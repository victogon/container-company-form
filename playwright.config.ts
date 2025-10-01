import { defineConfig, devices } from '@playwright/test';

// Configuración para usar Vercel o localhost
const isProduction = process.env.NODE_ENV === 'production' || process.env.PLAYWRIGHT_ENV === 'production';
// Dominio personalizado de Vercel para formularios de containers
const vercelDomain = process.env.VERCEL_URL || 'https://formulario-containers.vercel.app';
const baseURL = isProduction ? vercelDomain : 'http://localhost:3000';

console.log(`🌐 Playwright configurado para: ${baseURL}`);
console.log(`📊 Modo: ${isProduction ? 'PRODUCCIÓN (Vercel)' : 'DESARROLLO (localhost)'}`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Timeout global para tests completos (especialmente importante para Vercel)
  timeout: isProduction ? 120000 : 60000, // 2 minutos en producción, 1 minuto en desarrollo
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Aumentar timeouts para tests remotos
    actionTimeout: isProduction ? 30000 : 10000,
    navigationTimeout: isProduction ? 60000 : 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-headed',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          slowMo: 1000, // Ralentizar para observar mejor
        },
      },
    },
    // Descomenta estos si quieres probar en más navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Solo usar webServer en desarrollo local
  webServer: isProduction ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});