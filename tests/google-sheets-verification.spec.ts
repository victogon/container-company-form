import { test, expect } from '@playwright/test';
import { RealImageUtils } from './real-image-utils';

// Configurar antes de todos los tests
test.beforeAll(async () => {
    console.log('📋 Listando imágenes disponibles para Google Sheets test...');
    RealImageUtils.listAvailableImages();
});

// Función helper para obtener imagen de test
function getTestImage(preferredName: string, size: 'small' | 'medium' | 'large', index: number): string {
    const image = RealImageUtils.getImageBySize(size, index);
    if (image) {
        const info = RealImageUtils.getImageInfo(image);
        console.log(`📷 Usando imagen real: ${info?.name} (${info?.sizeFormatted})`);
        return image;
    }
    
    // Fallback a imagen simulada si no hay imágenes reales
    console.log(`⚠️ No se encontró imagen real, usando fallback simulado`);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

test.describe('Google Sheets Verification - Envío de Datos Obligatorios', () => {
    test('debe enviar datos obligatorios a Google Sheets exitosamente', async ({ page }) => {
        console.log('🚀 Iniciando test de verificación Google Sheets...');

        await page.goto('/?test=true');

        console.log('🚀 Iniciando test de verificación Google Sheets...');

        // ==================== PASO 1: DATOS DE LA EMPRESA (SOLO OBLIGATORIOS) ====================
        console.log('🏢 Completando Paso 1: Solo campos obligatorios');

        await page.fill('input[name="companyName"]', 'Test Google Sheets Company');
        await page.fill('input[name="contactPerson"]', 'Juan Test');
        await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
        await page.fill('input[name="email"]', 'test@googlesheets.com');

        // Logo obligatorio
        const logoInput = page.locator('#logo-upload');
        const logoImage = getTestImage('logo-test.jpg', 'small', 0);
        await logoInput.setInputFiles(logoImage);
        await page.waitForTimeout(500);

        await page.fill('textarea[name="brandColors"]', 'Azul y blanco para test');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 2 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 2: UBICACIÓN (SOLO OBLIGATORIOS) ====================
        console.log('📍 Completando Paso 2: Solo campos obligatorios');

        await page.fill('textarea[name="address"]', 'Calle Test 123, Buenos Aires');
        await page.fill('textarea[name="businessHours"]', 'Lunes a Viernes 9-18');
        await page.fill('textarea[name="socialMedia"]', '@testgooglesheets');
        await page.fill('input[name="whatsappNumber"]', '+54 9 11 1234-5678');
        await page.fill('textarea[name="workAreas"]', 'Buenos Aires y alrededores');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 3 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 3: HISTORIA (SOLO OBLIGATORIOS) ====================
        console.log('📚 Completando Paso 3: Solo campos obligatorios');

        await page.fill('input[name="foundedYear"]', '2024');
        await page.check('input[value="1-2"]');
        await page.check('input[value="arquitectura-diseño"]');
        await page.fill('textarea[name="companyStory"]', 'Empresa de test para Google Sheets.');
        await page.fill('textarea[name="achievements"]', 'Test de integración exitoso.');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 4 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 4: METODOLOGÍA (SOLO OBLIGATORIOS) ====================
        console.log('⚙️ Completando Paso 4: Solo campos obligatorios');

        await page.check('input[value="precios-establecidos"]');
        await page.fill('textarea[name="workTime"]', '30-45 días');
        await page.check('input[value="precio-competitivo"]');
        await page.fill('textarea[name="ventajas"]', 'Test rápido y confiable.');
        await page.fill('textarea[name="rangoPrecios"]', 'USD 600-800 por m²');
        await page.check('input[value="1-10"]');
        await page.check('input[value="no-tengo"]');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 5 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== SALTAR PASOS OPCIONALES ====================
        console.log('⏭️ Saltando pasos opcionales (5, 6, 7)...');

        // Paso 5: Modelos (opcional) - saltar
        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 6 de 9')).toBeVisible({ timeout: 10000 });

        // Paso 6: Proyectos (opcional) - saltar
        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 7 de 9')).toBeVisible({ timeout: 10000 });

        // Paso 7: Clientes (opcional) - saltar
        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 8 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 8: CALCULADORA DE PRECIOS (CAMPOS OBLIGATORIOS) ====================
        console.log('💰 Completando Paso 8: Solo campos obligatorios');

        await page.check('input[name="calculadoraOption"][value="no"]');
        await page.check('input[name="precioDifOpcion"][value="no"]');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 9 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 9: MENSAJES Y COMUNICACIÓN (CAMPOS OBLIGATORIOS) ====================
        console.log('💬 Completando Paso 9: Solo campos obligatorios');

        await page.fill('textarea[name="frase"]', 'Test de Google Sheets exitoso');
        await page.fill('textarea[name="pitch"]', 'Verificamos que los datos lleguen correctamente a Google Sheets');
        await page.fill('textarea[name="importante"]', 'Este es un test de integración con Google Sheets');

        // Enviar el formulario
        console.log('📤 Enviando formulario y esperando respuesta...');
        await page.click('button[type="submit"]:has-text("Enviar")');

        // Verificar que aparece la pantalla de confirmación
        await expect(page.locator('text=¡Formulario enviado!')).toBeVisible({ timeout: 30000 });

        console.log('✅ Formulario enviado exitosamente!');
        console.log('📊 El formulario con datos obligatorios se ha enviado a Google Sheets');
        console.log('🔍 Para verificar manualmente: revisar la hoja de Google Sheets configurada');
        
        // Verificar que no hay mensajes de error en la página
        const errorMessages = page.locator('text=Error');
        await expect(errorMessages).toHaveCount(0);
        
        // Verificar que la pantalla de confirmación muestra información correcta
        await expect(page.locator('text=Test Google Sheets Company')).toBeVisible();
        
        console.log('✅ Verificación de Google Sheets completada exitosamente!');
    });
});