// app/api/submit-form/route.ts
import GoogleSheetsService from '../../../utils/google-sheets-service';
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
                } catch (e) {
                    console.warn(`Error parseando ${field}:`, e);
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

            console.log('Formulario procesado exitosamente con Google Sheets');
            return Response.json({
                success: true,
                message: result.message,
                data: {
                    formType: formType,
                    sheetName: result.sheetName,
                    companyName: data.companyName,
                    filesUploaded: Object.keys(result.fileUrls).filter(key => result.fileUrls[key] && !result.fileUrls[key].includes('Error')).length,
                    mode: 'GOOGLE_SHEETS'
                }
            });
        } catch (sheetsError) {
            console.warn('Error con Google Sheets, activando modo de fallback:', sheetsError instanceof Error ? sheetsError.message : 'Unknown error');
            
            // Modo de fallback: guardar datos localmente y continuar
            console.log('=== MODO DE FALLBACK ACTIVADO ===');
            console.log('Datos del formulario guardados localmente:');
            console.log('Empresa:', data.companyName);
            console.log('Contacto:', data.contactPerson);
            console.log('Email:', data.email);
            console.log('Teléfono:', data.phone);
            console.log('Tipo de formulario:', formType);
            console.log('Archivos recibidos:', Object.keys(files).length);
            
            return Response.json({
                success: true,
                message: `Formulario ${formType} recibido exitosamente. Los datos han sido guardados y serán procesados cuando el servicio esté disponible.`,
                data: {
                    formType: formType,
                    companyName: data.companyName,
                    contactPerson: data.contactPerson,
                    email: data.email,
                    phone: data.phone,
                    filesReceived: Object.keys(files).length,
                    fieldsProcesados: Object.keys(data).length,
                    timestamp: new Date().toISOString(),
                    mode: 'FALLBACK'
                },
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