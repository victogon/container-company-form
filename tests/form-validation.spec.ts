import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Container Company Form - Validación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar el formulario correctamente', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Formulario de Empresa de Contenedores');
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page.locator('input[name="contactPerson"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('debe validar campos obligatorios', async ({ page }) => {
    // Intentar avanzar sin llenar campos
    await page.click('button:has-text("Siguiente")');
    
    // Verificar que aparecen mensajes de error
    await expect(page.locator('text=Este campo es obligatorio')).toHaveCount(3);
  });

  test('debe validar formato de email', async ({ page }) => {
    await page.fill('input[name="email"]', 'email-invalido');
    await page.click('button:has-text("Siguiente")');
    
    await expect(page.locator('text=Formato de email inválido')).toBeVisible();
  });

  test('debe permitir navegación entre pasos', async ({ page }) => {
    // Llenar datos del primer paso
    await page.fill('input[name="companyName"]', 'Empresa Test');
    await page.fill('input[name="contactPerson"]', 'Juan Pérez');
    await page.fill('input[name="email"]', 'juan@test.com');
    
    // Avanzar al siguiente paso
    await page.click('button:has-text("Siguiente")');
    
    // Verificar que estamos en el paso 2
    await expect(page.locator('text=Paso 2 de 4')).toBeVisible();
    
    // Volver al paso anterior
    await page.click('button:has-text("Anterior")');
    
    // Verificar que volvimos al paso 1
    await expect(page.locator('text=Paso 1 de 4')).toBeVisible();
  });
});