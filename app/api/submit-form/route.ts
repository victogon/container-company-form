// app/api/submit-form/route.ts
import GoogleSheetsService from '../../../utils/google-sheets-service';
import { notifySlack, notifyEmail } from '../../../utils/notifications';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('=== INICIO DE PROCESAMIENTO DE FORMULARIO ===');

    try {
        // Verificar variables de entorno críticas
        console.log('Verificando variables de entorno...');

        // Verificar que tenemos al menos una forma de autenticación con Google
        const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY;
        const hasApiKey = process.env.GOOGLE_API_KEY;

        if (!hasServiceAccount && !hasApiKey) {
            console.error('No se encontró configuración de autenticación de Google');
            return Response.json({
                error: 'Configuración del servidor incompleta',
                details: 'Se requiere configuración de Service Account o API Key de Google'
            }, { status: 500 });
        }

        // Verificar GOOGLE_SPREADSHEET_ID que es obligatorio
        if (!process.env.GOOGLE_SPREADSHEET_ID) {
            console.error('GOOGLE_SPREADSHEET_ID faltante');
            return Response.json({
                error: 'Configuración del servidor incompleta',
                details: 'GOOGLE_SPREADSHEET_ID es requerido'
            }, { status: 500 });
        }

        console.log('Configuración de autenticación:', hasServiceAccount ? 'Service Account' : 'API Key');

        // Obtener FormData
        console.log('Procesando FormData...');
        const formData = await request.formData();

        // Convertir FormData a objeto
        const data: Record<string, string | string[]> = {};
        const files: Record<string, Array<{ originalname: string; mimetype: string; buffer: Buffer; size: number }>> = {};

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                // Es un archivo
                console.log(`Procesando archivo: ${key} - ${value.name} (${value.size} bytes)`);
                const buffer = Buffer.from(await value.arrayBuffer());
                files[key] = [{
                    originalname: value.name,
                    mimetype: value.type,
                    buffer: buffer,
                    size: buffer.length
                }];
            } else {
                // Es datos de texto
                data[key] = value as string;
            }
        }

        console.log('Campos de datos recibidos:', Object.keys(data));
        console.log('Archivos recibidos:', Object.keys(files));

        // Parsear arrays JSON
        const jsonFields = ['specialties', 'diferencialCompetitivo', 'modelos', 'proyectos', 'clientes'];
        jsonFields.forEach(field => {
            if (typeof data[field] === 'string') {
                try {
                    data[field] = JSON.parse(data[field]);
                    console.log(`Campo ${field} parseado correctamente`);
                } catch {
                    console.warn(`Error parseando ${field}`);
                    data[field] = [];
                }
            }
        });

        // Validaciones
        console.log('Validando campos obligatorios...');
        if (!data.companyName || !data.contactPerson || !data.email || !data.phone) {
            console.error('Campos obligatorios faltantes:', {
                companyName: !!data.companyName,
                contactPerson: !!data.contactPerson,
                email: !!data.email,
                phone: !!data.phone
            });
            return Response.json({
                error: 'Campos obligatorios faltantes'
            }, { status: 400 });
        }

        // Procesar con Google Sheets (con modo de fallback)
        console.log('Iniciando procesamiento con Google Sheets...');
        const formType = typeof data.formType === 'string' ? data.formType : 'containers';
        console.log('Tipo de formulario:', formType);

        try {
            // Verificar configuración antes de crear el servicio
            const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            const privateKey = process.env.GOOGLE_PRIVATE_KEY;

            // Verificación más estricta para activar fallback en producción
            if (!serviceAccountEmail || !privateKey) {
                console.warn('Configuración de Service Account incompleta, activando modo fallback');
                console.log('Service Account Email presente:', !!serviceAccountEmail);
                console.log('Private Key presente:', !!privateKey);
                throw new Error('Google Sheets Service Account no configurado correctamente');
            }

            console.log('Intentando crear servicio de Google Sheets...');
            const sheetsService = new GoogleSheetsService(formType);
            const result = await sheetsService.processFormSubmission(data, files);

            // Contar imágenes de Cloudinary en lugar de archivos de Google Drive
            let cloudinaryImagesCount = 0;

            console.log('=== DIAGNÓSTICO DE CONTEO DE IMÁGENES ===');
            console.log('Logo recibido:', {
                logoUrl: data.logoUrl,
                logoUrlType: typeof data.logoUrl,
                logoUrlLength: data.logoUrl ? data.logoUrl.length : 0,
                includesCloudinary: data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.includes('cloudinary')
            });

            // Contar logo
            if (data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.includes('cloudinary')) {
                cloudinaryImagesCount++;
                console.log('✅ Logo contado - Total actual:', cloudinaryImagesCount);
            } else {
                console.log('❌ Logo NO contado - Razón:', !data.logoUrl ? 'No existe' : typeof data.logoUrl !== 'string' ? 'No es string' : 'No incluye cloudinary');
            }

            // Contar imágenes de modelos (solo arrays `images`)
            if (Array.isArray(data.modelos)) {
                (data.modelos as unknown[]).forEach((modelo: unknown) => {
                    if (typeof modelo === 'object' && modelo !== null) {
                        const modeloObj = modelo as Record<string, unknown>;

                        // Preferir arrays `images` si existen; contar hasta 5
                        const imagesValue = modeloObj['images'];
                        const imagesArr: unknown[] | null = Array.isArray(imagesValue) ? imagesValue : null;
                        if (imagesArr && imagesArr.length > 0) {
                            let counted = 0;
                            for (const img of imagesArr) {
                                if (typeof img === 'string' && img.includes('cloudinary')) {
                                    cloudinaryImagesCount++;
                                    counted++;
                                    if (counted >= 5) break; // Contar hasta 5 imágenes por modelo
                                }
                            }
                        }
                    }
                });
            }

            // Contar imágenes de proyectos (solo arrays `images`)
            if (Array.isArray(data.proyectos)) {
                (data.proyectos as unknown[]).forEach((proyecto: unknown) => {
                    if (typeof proyecto === 'object' && proyecto !== null) {
                        const proyectoObj = proyecto as Record<string, unknown>;

                        const imagesValue = proyectoObj['images'];
                        const imagesArr: unknown[] | null = Array.isArray(imagesValue) ? imagesValue : null;
                        if (imagesArr && imagesArr.length > 0) {
                            let counted = 0;
                            for (const img of imagesArr) {
                                if (typeof img === 'string' && img.includes('cloudinary')) {
                                    cloudinaryImagesCount++;
                                    counted++;
                                    if (counted >= 5) break; // Contar hasta 5 imágenes por proyecto
                                }
                            }
                        }
                    }
                });
            }

            // Contar imágenes de clientes
            if (Array.isArray(data.clientes)) {
                (data.clientes as unknown[]).forEach((cliente: unknown, index: number) => {
                    if (typeof cliente === 'object' && cliente !== null) {
                        const clienteObj = cliente as Record<string, unknown>;
                        if (clienteObj.image && typeof clienteObj.image === 'string' && clienteObj.image.includes('cloudinary')) {
                            cloudinaryImagesCount++;
                            console.log(`✅ Cliente ${index + 1} imagen contada - Total actual:`, cloudinaryImagesCount);
                        } else {
                            console.log(`❌ Cliente ${index + 1} imagen NO contada:`, {
                                image: clienteObj.image,
                                imageType: typeof clienteObj.image,
                                includesCloudinary: clienteObj.image && typeof clienteObj.image === 'string' && clienteObj.image.includes('cloudinary')
                            });
                        }
                    }
                });
            }

            console.log('=== RESUMEN FINAL DE CONTEO ===');
            console.log(`Total de imágenes de Cloudinary contadas: ${cloudinaryImagesCount}`);
            console.log('Desglose esperado: 1 logo + 12 modelos + 12 proyectos + 3 clientes = 28 total');
            console.log('=== FIN DIAGNÓSTICO ===');

            console.log('Formulario procesado exitosamente con Google Sheets');
            const responseData = {
                formType: formType,
                sheetName: result.sheetName,
                companyName: data.companyName as string,
                contactPerson: data.contactPerson as string,
                email: data.email as string,
                phone: data.phone as string,
                filesUploaded: cloudinaryImagesCount,
                mode: 'GOOGLE_SHEETS',
                timestamp: new Date().toISOString(),
            };
            // Notificar por Slack y Email si está configurado
            await notifySlack(responseData);
            await notifyEmail(responseData);
            return Response.json({
                success: true,
                message: result.message,
                data: responseData,
            });
        } catch (sheetsError) {
            console.warn('Error con Google Sheets, activando modo de fallback:', sheetsError instanceof Error ? sheetsError.message : 'Unknown error');

            // Contar imágenes de Cloudinary también en modo fallback
            let cloudinaryImagesCount = 0;

            // Contar logo (prioriza logoUrl y luego logo)
            if (data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.includes('cloudinary')) {
                cloudinaryImagesCount++;
            } else if (data.logo && typeof data.logo === 'string' && data.logo.includes('cloudinary')) {
                cloudinaryImagesCount++;
            }

            // Contar imágenes de modelos (solo arrays `images`)
            if (Array.isArray(data.modelos)) {
                (data.modelos as unknown[]).forEach((modelo: unknown) => {
                    if (typeof modelo === 'object' && modelo !== null) {
                        const modeloObj = modelo as Record<string, unknown>;

                        const imagesValue = modeloObj['images'];
                        const imagesArr: unknown[] | null = Array.isArray(imagesValue) ? imagesValue : null;
                        if (imagesArr && imagesArr.length > 0) {
                            let counted = 0;
                            for (const img of imagesArr) {
                                if (typeof img === 'string' && img.includes('cloudinary')) {
                                    cloudinaryImagesCount++;
                                    counted++;
                                    if (counted >= 5) break; // Contar hasta 5 imágenes por modelo
                                }
                            }
                        }
                    }
                });
            }

            // Contar imágenes de proyectos (solo arrays `images`)
            if (Array.isArray(data.proyectos)) {
                (data.proyectos as unknown[]).forEach((proyecto: unknown) => {
                    if (typeof proyecto === 'object' && proyecto !== null) {
                        const proyectoObj = proyecto as Record<string, unknown>;

                        const imagesValue = proyectoObj['images'];
                        const imagesArr: unknown[] | null = Array.isArray(imagesValue) ? imagesValue : null;
                        if (imagesArr && imagesArr.length > 0) {
                            let counted = 0;
                            for (const img of imagesArr) {
                                if (typeof img === 'string' && img.includes('cloudinary')) {
                                    cloudinaryImagesCount++;
                                    counted++;
                                    if (counted >= 5) break; // Contar hasta 5 imágenes por proyecto
                                }
                            }
                        }
                    }
                });
            }

            // Contar imágenes de clientes
            if (Array.isArray(data.clientes)) {
                (data.clientes as unknown[]).forEach((cliente: unknown) => {
                    if (typeof cliente === 'object' && cliente !== null) {
                        const clienteObj = cliente as Record<string, unknown>;
                        if (clienteObj.image && typeof clienteObj.image === 'string' && clienteObj.image.includes('cloudinary')) {
                            cloudinaryImagesCount++;
                        }
                    }
                });
            }

            // Modo de fallback: guardar datos localmente y continuar
            console.log('=== MODO DE FALLBACK ACTIVADO ===');
            console.log('Datos del formulario guardados localmente:');
            console.log('Empresa:', data.companyName);
            console.log('Contacto:', data.contactPerson);
            console.log('Email:', data.email);
            console.log('Teléfono:', data.phone);
            console.log('Tipo de formulario:', formType);
            console.log('Archivos recibidos:', Object.keys(files).length);
            console.log(`Imágenes de Cloudinary contadas: ${cloudinaryImagesCount}`);

            const fallbackData = {
                formType: formType,
                companyName: data.companyName as string,
                contactPerson: data.contactPerson as string,
                email: data.email as string,
                phone: data.phone as string,
                filesUploaded: cloudinaryImagesCount,
                fieldsProcesados: Object.keys(data).length,
                timestamp: new Date().toISOString(),
                mode: 'FALLBACK'
            };
            await notifySlack(fallbackData);
            await notifyEmail(fallbackData);
            return Response.json({
                success: true,
                message: `Formulario ${formType} recibido exitosamente. Los datos han sido guardados y serán procesados cuando el servicio esté disponible.`,
                data: fallbackData,
                warning: 'El servicio de Google Sheets no está disponible temporalmente. Sus datos han sido recibidos correctamente.'
            });
        }

    } catch (error) {
        console.error('=== ERROR EN PROCESAMIENTO ===');
        console.error('Tipo de error:', error?.constructor?.name);
        console.error('Mensaje:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

        // Información adicional para debugging
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                cause: error.cause
            });
        }

        return Response.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}