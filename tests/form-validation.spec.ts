import { test, expect } from '@playwright/test';
import { RealImageUtils } from './real-image-utils';

test.describe('Container Company Form - Validación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar el formulario correctamente', async ({ page }) => {
    // Verificar el título correcto
    await expect(page.locator('h1')).toContainText('Información para desarrollo web');
    
    // Verificar que estamos en el paso 1 de 9
    await expect(page.locator('text=Paso 1 de 9')).toBeVisible();
    
    // Verificar campos principales
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page.locator('input[name="contactPerson"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('debe validar campos obligatorios', async ({ page }) => {
    // Intentar avanzar sin llenar campos
    await page.click('button:has-text("Siguiente")');
    
    // Verificar que aparecen mensajes de validación (el texto correcto es "Llena este campo")
    // Según el snapshot, hay 6 campos obligatorios en el paso 1
    await expect(page.locator('text=Llena este campo')).toHaveCount(6, { timeout: 10000 });
  });

  test('debe validar formato de email', async ({ page }) => {
    // Llenar email con formato inválido
    await page.fill('input[name="email"]', 'email-invalido');
    
    // Llenar otros campos obligatorios para que solo falle el email
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="contactPerson"]', 'Juan Pérez');
    await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
    await page.fill('input[name="email"]', 'email-invalido'); // Email inválido para probar validación
    await page.fill('textarea[name="brandColors"]', 'Rojo');
    
    // Subir logo (obligatorio)
    await page.setInputFiles('#logo-upload', {
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Intentar avanzar
    await page.click('button:has-text("Siguiente")');
    
    // Verificar mensaje de email inválido
    await expect(page.locator('text=El email no es válido')).toBeVisible({ timeout: 10000 });
  });

  test('debe permitir navegación entre pasos', async ({ page }) => {
    // Verificar que empezamos en el paso 1
    await expect(page.locator('text=Paso 1 de 9')).toBeVisible({ timeout: 10000 });
    
    // Llenar campos obligatorios del primer paso
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="contactPerson"]', 'Juan Pérez');
    await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
    await page.fill('input[name="email"]', 'juan.perez@testcompany.com');
    await page.fill('textarea[name="brandColors"]', 'Rojo y azul');
    
    // Subir logo (obligatorio) usando imagen real
    const testImage = RealImageUtils.getImageBySize('small', 0);
    if (testImage) {
      console.log(`📸 Usando imagen real para logo: ${testImage}`);
      await page.setInputFiles('#logo-upload', testImage);
    } else {
      // Fallback con imagen simulada
      console.log('⚠️ No hay imágenes reales, usando fallback');
      await page.setInputFiles('#logo-upload', {
        name: 'test-logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      });
    }
    
    // Esperar a que la imagen se suba completamente a Cloudinary
    // Verificamos que aparezca el preview del logo (img con alt="Logo")
    await expect(page.locator('img[alt="Logo"]')).toBeVisible({ timeout: 15000 });
    
    // Avanzar al siguiente paso
    await page.click('button:has-text("Siguiente")');
    
    // Esperar a que la navegación se complete y verificar que estamos en el paso 2
    await expect(page.locator('span:has-text("Paso 2 de 9")')).toBeVisible({ timeout: 15000 });
    
    // Verificar que el botón "Anterior" funciona
    await page.click('button:has-text("Anterior")');
    await expect(page.locator('span:has-text("Paso 1 de 9")')).toBeVisible({ timeout: 10000 });
    
    // Volver al paso 2 para confirmar que la navegación funciona en ambas direcciones
    await page.click('button:has-text("Siguiente")');
    await expect(page.locator('span:has-text("Paso 2 de 9")')).toBeVisible({ timeout: 10000 });
  });
});