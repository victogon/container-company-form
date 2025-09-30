import { defineConfig, devices } from '@playwright/test';

// Configuración para usar Vercel o localhost
const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction 
  ? 'https://container-company-form.vercel.app' 
  : 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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