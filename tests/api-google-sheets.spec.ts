import { test, expect } from '@playwright/test';

test.describe('API Google Sheets - Verificación Directa', () => {
    test('debe enviar datos a Google Sheets via API y recibir confirmación', async ({ request }) => {
        console.log('🚀 Iniciando test directo de API Google Sheets...');
        console.log('📤 Enviando petición POST a /api/submit-form...');

        // Hacer la petición a la API con el header correcto
        const response = await request.post('http://localhost:3000/api/submit-form', {
            multipart: {
                formType: 'containers',
                companyName: 'API Test Company',
                contactPerson: 'Juan API Test',
                phone: '+54 9 11 9999-8888',
                email: 'api-test@googlesheets.com',
                brandColors: 'Rojo y negro para API test',
                address: 'Calle API Test 456, Buenos Aires',
                businessHours: 'Lunes a Viernes 8-17',
                socialMedia: '@apitestgooglesheets',
                whatsappNumber: '+54 9 11 9999-8888',
                workAreas: 'Buenos Aires - API Test',
                foundedYear: '2024',
                teamSize: '1-2',
                specialties: 'arquitectura-diseño',
                companyStory: 'Empresa de test para API Google Sheets.',
                achievements: 'Test de API exitoso.',
                workStyle: 'precios-establecidos',
                workTime: '30-45 días API',
                diferencialCompetitivo: 'precio-competitivo',
                ventajas: 'API test rápido y confiable.',
                rangoPrecios: 'USD 700-900 por m²',
                proyectosRealizados: '1-10',
                dominioOption: 'no-tengo',
                calculadoraOption: 'no',
                precioDifOpcion: 'no',
                frase: 'API Test de Google Sheets exitoso',
                pitch: 'Verificamos que la API funcione correctamente con Google Sheets',
                importante: 'Este es un test directo de la API con Google Sheets'
            }
        });

        console.log('📊 Respuesta recibida - Status:', response.status());

        // Verificar que la respuesta es exitosa
        expect(response.status()).toBe(200);

        // Obtener el cuerpo de la respuesta
        const responseBody = await response.json();
        console.log('📋 Respuesta del servidor:', JSON.stringify(responseBody, null, 2));

        // Verificaciones de la respuesta
        expect(responseBody.success).toBe(true);
        expect(responseBody.message).toContain('exitosamente');
        
        // Verificar que menciona Google Sheets o la hoja
        expect(responseBody.data).toBeDefined();
        expect(responseBody.data.sheetName).toBeDefined();
        
        console.log('✅ Hoja de destino:', responseBody.data.sheetName);
        console.log('✅ Empresa procesada:', responseBody.data.companyName || 'API Test Company');
        
        // Verificar que no hay errores
        expect(responseBody.error).toBeUndefined();
        
        // Si hay información específica de Google Sheets, verificarla
        if (responseBody.googleSheets) {
            console.log('📊 Información específica de Google Sheets:', responseBody.googleSheets);
            expect(responseBody.googleSheets.success).toBe(true);
        }

        console.log('✅ Test directo de API Google Sheets completado exitosamente!');
        console.log('📊 Los datos se enviaron correctamente a Google Sheets via API');
    });

    test('debe manejar errores de configuración correctamente', async ({ request }) => {
        console.log('🧪 Iniciando test de manejo de errores...');
        console.log('📤 Enviando petición con datos inválidos...');

        const response = await request.post('http://localhost:3000/api/submit-form', {
            multipart: {
                invalidField: 'invalid data'
            }
        });

        console.log('📊 Respuesta recibida - Status:', response.status());

        // La respuesta puede ser 400 (Bad Request) o 500 (Server Error) dependiendo del tipo de error
        expect([400, 500]).toContain(response.status());

        const responseBody = await response.json();
        console.log('📋 Respuesta de error:', JSON.stringify(responseBody, null, 2));

        // Verificar que hay información de error
        expect(responseBody.error).toBeDefined();
        
        console.log('✅ Test de manejo de errores completado');
    });
});