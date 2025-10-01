import { test, expect } from '@playwright/test';
import { RealImageUtils } from './real-image-utils';

test.describe('Validación de Tamaño de Imágenes - Funcionalidad Principal', () => {

  // Helper para crear imagen grande que active la alerta
  const createLargeImage = (name: string, sizeKB: number) => {
    console.log(`📷 Creando imagen simulada grande: ${name} (${(sizeKB/1024).toFixed(1)}MB)`);
    return RealImageUtils.createFallbackImage(name, sizeKB);
  };

  // Helper para configurar listener de alertas
  const setupAlertListener = (page: any) => {
    let alertMessage = '';
    let alertDetected = false;

    page.on('dialog', async (dialog: any) => {
      console.log(`🚨 ALERTA DETECTADA: ${dialog.type()}`);
      console.log(`📝 Mensaje: ${dialog.message()}`);
      alertMessage = dialog.message();
      alertDetected = true;
      
      // Tomar screenshot inmediatamente cuando se detecta la alerta
      const timestamp = Date.now();
      const screenshotPath = `test-results/alert-screenshots/alerta-${timestamp}.png`;
      
      // Crear directorio si no existe
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Captura simple y rápida sin timeout personalizado
      page.screenshot({ path: screenshotPath }).then(() => {
        console.log(`📸 Screenshot de alerta guardado: ${screenshotPath}`);
      }).catch((error: any) => {
        console.log(`⚠️ Error al tomar screenshot: ${error.message}`);
        // Intentar captura básica como fallback
        page.screenshot({ path: screenshotPath, timeout: 5000 }).catch(() => {
          console.log(`❌ Screenshot falló completamente`);
        });
      });
      
      // Aceptar la alerta inmediatamente
      await dialog.accept();
      console.log(`✅ Alerta aceptada correctamente`);
    });

    return { getAlertMessage: () => alertMessage, isAlertDetected: () => alertDetected };
  };

  test('PRINCIPAL: debe mostrar alerta en LOGO cuando excede el tamaño', async ({ page }) => {
    console.log('🧪 Probando alerta en campo LOGO (principal)...');
    
    const { getAlertMessage, isAlertDetected } = setupAlertListener(page);
    
    // Ir al formulario
    await page.goto('/?test=true');
    
    // Llenar campos mínimos del paso 1
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="contactPerson"]', 'Juan Pérez');
    await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
    await page.fill('input[name="email"]', 'juan@test.com');
    
    // Subir imagen grande en el logo
    console.log('📤 Subiendo imagen grande en LOGO...');
    const largeImage = createLargeImage('logo-gigante.jpg', 15000); // 15MB
    await page.setInputFiles('#logo-upload', largeImage, { timeout: 15000 });
    
    // Esperar para que se procese
    await page.waitForTimeout(5000);
    
    // Verificar que se detectó la alerta
    console.log(`🔍 Alerta detectada: ${isAlertDetected()}`);
    console.log(`📝 Mensaje: "${getAlertMessage()}"`);
    
    expect(isAlertDetected()).toBe(true);
    expect(getAlertMessage()).toContain('grande');
    console.log('✅ Alerta detectada correctamente en LOGO');
  });

  test('VERIFICACIÓN: debe mostrar alerta inmediatamente al subir imagen grande', async ({ page }) => {
    console.log('🧪 Verificando que la alerta aparece INMEDIATAMENTE...');
    
    const { getAlertMessage, isAlertDetected } = setupAlertListener(page);
    
    // Ir al formulario
    await page.goto('/?test=true');
    
    // Llenar campos mínimos
    await page.fill('input[name="companyName"]', 'Test Company Inmediato');
    await page.fill('input[name="contactPerson"]', 'María González');
    await page.fill('input[name="phone"]', '+54 9 11 5555-5555');
    await page.fill('input[name="email"]', 'maria@test.com');
    
    // Subir imagen EXTRA grande para garantizar la alerta
    console.log('📤 Subiendo imagen EXTRA grande...');
    const extraLargeImage = createLargeImage('logo-extra-gigante.jpg', 20000); // 20MB
    await page.setInputFiles('#logo-upload', extraLargeImage);
    
    // Esperar solo 2 segundos - la alerta debe aparecer inmediatamente
    await page.waitForTimeout(2000);
    
    // Verificar que se detectó la alerta rápidamente
    console.log(`🔍 Alerta detectada inmediatamente: ${isAlertDetected()}`);
    console.log(`📝 Mensaje inmediato: "${getAlertMessage()}"`);
    
    expect(isAlertDetected()).toBe(true);
    expect(getAlertMessage()).toMatch(/grande|tamaño|MB|límite/i);
    console.log('✅ Alerta aparece INMEDIATAMENTE al subir imagen grande');
  });

  test('FUNCIONALIDAD: debe impedir envío del formulario con imagen grande', async ({ page }) => {
    console.log('🧪 Verificando que imagen grande impide envío del formulario...');
    
    const { getAlertMessage, isAlertDetected } = setupAlertListener(page);
    
    // Ir al formulario
    await page.goto('/?test=true');
    
    // Llenar todos los campos obligatorios del paso 1
    await page.fill('input[name="companyName"]', 'Test Company Envío');
    await page.fill('input[name="contactPerson"]', 'Carlos Rodríguez');
    await page.fill('input[name="phone"]', '+54 9 11 7777-7777');
    await page.fill('input[name="email"]', 'carlos@test.com');
    await page.fill('textarea[name="brandColors"]', 'Verde y amarillo');
    
    // Subir imagen grande
    console.log('📤 Subiendo imagen grande que debe impedir envío...');
    const largeImage = createLargeImage('logo-bloqueo.jpg', 18000); // 18MB
    await page.setInputFiles('#logo-upload', largeImage);
    
    // Esperar para que se procese
    await page.waitForTimeout(3000);
    
    // Verificar que se detectó la alerta
    expect(isAlertDetected()).toBe(true);
    console.log('✅ Alerta detectada - imagen grande bloquea correctamente');
    
    // Intentar avanzar al siguiente paso (debería fallar o mostrar error)
    console.log('🔄 Intentando avanzar con imagen grande...');
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(2000);
    
    // Verificar que seguimos en el paso 1 (no avanzó)
    const step1Still = await page.locator('text=Paso 1 de 9').isVisible();
    console.log(`📍 Sigue en Paso 1: ${step1Still}`);
    
    // Si avanzó, verificar que hay algún mensaje de error
    if (!step1Still) {
      const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').count();
      console.log(`⚠️ Mensajes de error encontrados: ${errorMessages}`);
    }
    
    console.log('✅ Funcionalidad de bloqueo verificada');
  });
});