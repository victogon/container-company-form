import { test, expect } from '@playwright/test';
import { RealImageUtils } from './real-image-utils';

test.describe('Container Company Form - Subida de Imágenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Completar TODOS los campos obligatorios del primer paso
    await page.fill('input[name="companyName"]', 'Empresa Test');
    await page.fill('input[name="contactPerson"]', 'Juan Pérez');
    await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
    await page.fill('input[name="email"]', 'juan@test.com');
    
    // Ahora sí podemos continuar al siguiente paso
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(1000);
  });

  test('debe permitir subir logo', async ({ page }) => {
    // Usar imagen real de la carpeta Downloads
    const testImage = RealImageUtils.getImageBySize('small', 0);
    
    if (testImage) {
      console.log(`📸 Usando imagen real: ${testImage}`);
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles(testImage);
      
      // Verificar que el archivo se cargó (buscar el nombre del archivo)
      const imageName = testImage.split('/').pop() || 'imagen';
      await expect(page.locator(`text=${imageName}`)).toBeVisible({ timeout: 10000 });
    } else {
      // Fallback con imagen simulada
      console.log('⚠️ No hay imágenes reales, usando fallback');
      const fallbackImage = RealImageUtils.createFallbackImage('test-logo.png', 100);
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles(fallbackImage);
      await expect(page.locator('text=test-logo.png')).toBeVisible({ timeout: 10000 });
    }
  });

  test('debe mostrar advertencia de tamaño cuando se excede el límite', async ({ page }) => {
    // Intentar usar una imagen grande real primero
    const largeImage = RealImageUtils.getImageBySize('large', 0);
    
    if (largeImage) {
      console.log(`📸 Usando imagen grande real: ${largeImage}`);
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles(largeImage);
    } else {
      // Crear archivo grande simulado (15MB)
      console.log('⚠️ Creando archivo grande simulado');
      const largeFileBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles({
        name: 'large-logo.png',
        mimeType: 'image/png',
        buffer: largeFileBuffer
      });
    }
    
    // Verificar que aparece algún tipo de advertencia o mensaje de tamaño
    // Ajustar según el texto real que muestre tu aplicación
    await expect(page.locator('text*=tamaño').or(page.locator('text*=grande')).or(page.locator('text*=límite'))).toBeVisible({ timeout: 10000 });
  });

  test('debe comprimir imágenes automáticamente', async ({ page }) => {
    // Usar imagen real mediana para probar compresión
    const mediumImage = RealImageUtils.getImageBySize('medium', 0);
    
    if (mediumImage) {
      console.log(`📸 Usando imagen mediana real para compresión: ${mediumImage}`);
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles(mediumImage);
    } else {
      // Fallback con imagen simulada de 5MB
      console.log('⚠️ Creando imagen simulada para compresión');
      const mediumImage = RealImageUtils.createFallbackImage('test-compression.jpg', 5000); // 5MB
      const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await fileInput.setInputFiles(mediumImage);
    }
    
    // Esperar a que se procese la imagen
    await page.waitForTimeout(3000);
    
    // Verificar que se muestra información de compresión
    // Ajustar según el texto real que muestre tu aplicación
    await expect(page.locator('text*=comprim').or(page.locator('text*=optimiz')).or(page.locator('text*=reduc'))).toBeVisible({ timeout: 10000 });
  });
});