// app/api/test-form/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('=== ENDPOINT DE PRUEBA - INICIO ===');
    
    try {
        // Obtener FormData
        console.log('Procesando FormData...');
        const formData = await request.formData();

        // Convertir FormData a objeto para logging
        const data: Record<string, string | string[]> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files: Record<string, any> = {};

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                files[key] = {
                    name: value.name,
                    size: value.size,
                    type: value.type
                };
                console.log(`Archivo recibido: ${key} - ${value.name} (${value.size} bytes)`);
            } else {
                data[key] = value as string;
            }
        }

        console.log('Campos de datos recibidos:', Object.keys(data));
        console.log('Archivos recibidos:', Object.keys(files));

        // Parsear arrays JSON para logging
        const jsonFields = ['specialties', 'diferencialCompetitivo', 'modelos', 'proyectos', 'clientes'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedData: Record<string, any> = { ...data };
        
        jsonFields.forEach(field => {
            if (typeof data[field] === 'string') {
                try {
                    parsedData[field] = JSON.parse(data[field] as string);
                    console.log(`Campo ${field} parseado correctamente:`, Array.isArray(parsedData[field]) ? `${parsedData[field].length} elementos` : 'objeto');
                } catch (e) {
                    console.warn(`Error parseando ${field}:`, e);
                    parsedData[field] = [];
                }
            }
        });

        // Validaciones básicas
        console.log('Validando campos obligatorios...');
        const requiredFields = ['companyName', 'contactPerson', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            console.error('Campos obligatorios faltantes:', missingFields);
            return Response.json({
                error: 'Campos obligatorios faltantes',
                missingFields
            }, { status: 400 });
        }

        // Simular procesamiento exitoso
        console.log('Simulando procesamiento exitoso...');
        
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000));

        const formType = data.formType || 'containers';
        
        console.log('=== DATOS PROCESADOS EXITOSAMENTE ===');
        console.log('Empresa:', data.companyName);
        console.log('Contacto:', data.contactPerson);
        console.log('Email:', data.email);
        console.log('Teléfono:', data.phone);
        console.log('Tipo de formulario:', formType);
        console.log('Archivos:', Object.keys(files).length);
        
        // Log de arrays procesados
        jsonFields.forEach(field => {
            if (parsedData[field] && Array.isArray(parsedData[field])) {
                console.log(`${field}:`, parsedData[field].length, 'elementos');
            }
        });

        return Response.json({
            success: true,
            message: `Formulario de prueba procesado exitosamente para ${data.companyName}`,
            data: {
                companyName: data.companyName,
                sheetName: 'Hoja de Prueba',
                filesUploaded: Object.keys(files).length,
                formType: formType,
                timestamp: new Date().toISOString(),
                fieldsReceived: Object.keys(data).length,
                filesReceived: Object.keys(files).length
            }
        });

    } catch (error) {
        console.error('=== ERROR EN ENDPOINT DE PRUEBA ===');
        console.error('Tipo de error:', error?.constructor?.name);
        console.error('Mensaje:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

        return Response.json({
            error: 'Error en endpoint de prueba',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            mode: 'TEST'
        }, { status: 500 });
    }
}