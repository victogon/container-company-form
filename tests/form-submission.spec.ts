import { test, expect } from '@playwright/test';
import { RealImageUtils } from './real-image-utils';

test.describe('Container Company Form - Envío Completo con Imágenes Reales', () => {

    test.beforeAll(async () => {
        // Mostrar imágenes disponibles
        RealImageUtils.listAvailableImages();
    });

    // Helper function que usa imágenes reales o fallback
    const getTestImage = (name: string, preferredSize: 'small' | 'medium' | 'large' = 'medium', index: number = 0) => {
        const realImagePath = RealImageUtils.getImageBySize(preferredSize, index);

        if (realImagePath) {
            const info = RealImageUtils.getImageInfo(realImagePath);
            console.log(`📷 Usando imagen real: ${info?.name} (${info?.sizeFormatted})`);
            return realImagePath;
        } else {
            console.log(`📷 Usando imagen simulada: ${name}`);
            return RealImageUtils.createFallbackImage(name, 800);
        }
    };

    test('debe completar el formulario completo con imágenes reales del Downloads', async ({ page }) => {
        await page.goto('/');

        console.log('🚀 Iniciando test completo con imágenes reales del Downloads...');

        // ==================== PASO 1: DATOS DE LA EMPRESA ====================
        console.log('🏢 Completando Paso 1: Datos de la empresa');
        
        // 1. Nombre de la empresa *
        await page.fill('input[name="companyName"]', 'Contenedores Innovadores S.A.');
        
        // 2. Persona de contacto *
        await page.fill('input[name="contactPerson"]', 'María González');
        
        // 3. Teléfono *
        await page.fill('input[name="phone"]', '+54 9 11 1234-5678');
        
        // 4. Email *
        await page.fill('input[name="email"]', 'maria@contenedoresinnovadores.com.ar');
        
        // 5. Logo de la empresa *
        const logoInput = page.locator('input[type="file"][accept="image/*"]').first();
        const logoImage = getTestImage('logo-empresa.jpg', 'medium', 0);
        await logoInput.setInputFiles(logoImage);
        
        // 6. Colores de marca *
        await page.fill('input[name="brandColors"]', '#2563EB, #F59E0B, #10B981');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 2 de 9')).toBeVisible();

        // ==================== PASO 2: UBICACIÓN Y CONTACTO ====================
        console.log('📍 Completando Paso 2: Ubicación y contacto');
        
        // 7. Dirección *
        await page.fill('input[name="address"]', 'Av. Libertador 1234, CABA, Buenos Aires, Argentina');
        
        // 8. Horarios de atención *
        await page.fill('textarea[name="businessHours"]', 'Lunes a Viernes: 8:00 - 18:00, Sábados: 9:00 - 13:00');
        
        // 9. Redes sociales *
        await page.fill('input[name="socialMedia"]', '@contenedoresinnovadores');
        
        // 10. WhatsApp *
        await page.fill('input[name="whatsappNumber"]', '+54 9 11 1234-5678');
        
        // 11. Zonas de trabajo *
        await page.fill('textarea[name="workAreas"]', 'CABA, GBA, La Plata, Mar del Plata, Córdoba, Rosario');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 3 de 9')).toBeVisible();

        // ==================== PASO 3: HISTORIA Y EQUIPO ====================
        console.log('📚 Completando Paso 3: Historia y equipo');

        // 12. Año de fundación *
        await page.fill('input[name="foundedYear"]', '2020');

        // 13. Tamaño del equipo * (radio button)
        await page.check('input[value="3-5"]'); // "3-5 personas"

        // 14. Especialidad principal * (checkbox - al menos una)
        await page.check('input[value="arquitectura-diseño"]'); // "Arquitectura y diseño"

        // 15. Historia de la empresa *
        await page.fill('textarea[name="companyStory"]', 'Empresa fundada en 2020 con el objetivo de ofrecer soluciones habitacionales sustentables usando containers.');

        // 16. Logros importantes *
        await page.fill('textarea[name="achievements"]', 'Certificación en construcción sustentable y más de 50 proyectos completados.');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 4 de 9')).toBeVisible();

        // ==================== PASO 4: METODOLOGÍA DE TRABAJO ====================
        console.log('⚙️ Completando Paso 4: Metodología de trabajo');

        // 17. Cómo trabajan * (radio button)
        await page.check('input[value="precios-establecidos"]'); // "Tenemos diseños con precios establecidos"

        // 18. Tiempo de entrega *
        await page.fill('textarea[name="workTime"]', '60-90 días dependiendo del proyecto');

        // 19. Diferencial competitivo * (checkbox - al menos uno)
        await page.check('input[value="precio-competitivo"]'); // "Precio competitivo"

        // 20. Ventajas containers *
        await page.fill('textarea[name="ventajas"]', 'Las casas container son más rápidas de construir, más económicas y más sustentables que la construcción tradicional.');

        // 21. Rango de precios *
        await page.fill('textarea[name="rangoPrecios"]', 'USD 600-800 por m²');

        // 22. Proyectos realizados * (radio button)
        await page.check('input[value="1-10"]'); // "1-10 proyectos"

        // 23. Dominio web * (radio button)
        await page.check('input[value="no-tengo"]'); // "No tengo dominio y necesito ayuda para elegir y comprarlo"

        // 24. Dominio name (opcional)
        await page.fill('input[name="dominioName"]', 'contenedoresinnovadores.com.ar');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 5 de 9')).toBeVisible();

        // ==================== PASO 5: MODELOS CON IMÁGENES REALES ====================
        console.log('🏠 Completando Paso 5: 6 Modelos con imágenes reales');

        // 25. Modelos
        const modelos = [
            { nombre: 'Estudio Compacto Urban', categoria: 'Habitacional', superficie: '25', dormitorios: '1', banios: '1', precio: '45000' },
            { nombre: 'Casa Familiar Premium', categoria: 'Habitacional', superficie: '80', dormitorios: '3', banios: '2', precio: '95000' },
            { nombre: 'Oficina Comercial Executive', categoria: 'Comercial', superficie: '60', dormitorios: '0', banios: '2', precio: '75000' },
            { nombre: 'Loft Industrial Moderno', categoria: 'Habitacional', superficie: '120', dormitorios: '2', banios: '2', precio: '135000' },
            { nombre: 'Centro Comercial Modular', categoria: 'Comercial', superficie: '200', dormitorios: '0', banios: '4', precio: '180000' },
            { nombre: 'Villa Sustentable Eco', categoria: 'Habitacional', superficie: '150', dormitorios: '4', banios: '3', precio: '165000' }
        ];

        for (let i = 0; i < modelos.length; i++) {
            const modelo = modelos[i];
            console.log(`   📦 Agregando Modelo ${i + 1}: ${modelo.nombre} con imágenes reales`);

            await page.click('button:has-text("Agregar Modelo")');
            await page.fill(`input[name="modelos.${i}.nombre"]`, modelo.nombre);
            await page.selectOption(`select[name="modelos.${i}.categoria"]`, modelo.categoria);
            await page.fill(`input[name="modelos.${i}.superficie"]`, modelo.superficie);
            await page.fill(`input[name="modelos.${i}.dormitorios"]`, modelo.dormitorios);
            await page.fill(`input[name="modelos.${i}.banios"]`, modelo.banios);
            await page.fill(`input[name="modelos.${i}.preciobase"]`, modelo.precio);
            await page.fill(`textarea[name="modelos.${i}.especiales"]`, `Descripción detallada del ${modelo.nombre}`);

            // Subir 4 imágenes reales por modelo, variando tamaños
            const img1 = page.locator(`input[data-testid="modelo-${i}-image1"]`);
            await img1.setInputFiles(getTestImage(`modelo-${i}-exterior.jpg`, 'large', i * 4));

            const img2 = page.locator(`input[data-testid="modelo-${i}-image2"]`);
            await img2.setInputFiles(getTestImage(`modelo-${i}-interior.jpg`, 'medium', i * 4 + 1));

            const img3 = page.locator(`input[data-testid="modelo-${i}-image3"]`);
            await img3.setInputFiles(getTestImage(`modelo-${i}-cocina.jpg`, 'medium', i * 4 + 2));

            const img4 = page.locator(`input[data-testid="modelo-${i}-image4"]`);
            await img4.setInputFiles(getTestImage(`modelo-${i}-dormitorio.jpg`, 'small', i * 4 + 3));
        }

        await page.click('button:has-text("Siguiente")');

        // ==================== PASO 6: PROYECTOS CON IMÁGENES REALES ====================
        console.log('🏗️ Completando Paso 6: 20 Proyectos con imágenes reales');

        // 26. Proyectos
        const proyectos = [
            { modelo: 'Estudio Compacto Urban', ubicacion: 'Palermo, CABA', anio: '2023' },
            { modelo: 'Casa Familiar Premium', ubicacion: 'Pilar, Buenos Aires', anio: '2023' },
            { modelo: 'Oficina Comercial Executive', ubicacion: 'Microcentro, CABA', anio: '2023' },
            { modelo: 'Loft Industrial Moderno', ubicacion: 'Puerto Madero, CABA', anio: '2022' },
            { modelo: 'Villa Sustentable Eco', ubicacion: 'Bariloche, Río Negro', anio: '2022' },
            { modelo: 'Casa Minimalista', ubicacion: 'Belgrano, CABA', anio: '2023' },
            { modelo: 'Oficina Startup', ubicacion: 'Villa Crespo, CABA', anio: '2023' },
            { modelo: 'Casa Duplex', ubicacion: 'San Isidro, Buenos Aires', anio: '2022' },
            { modelo: 'Local Comercial', ubicacion: 'Recoleta, CABA', anio: '2023' },
            { modelo: 'Casa de Campo', ubicacion: 'Tigre, Buenos Aires', anio: '2022' },
            { modelo: 'Estudio Artista', ubicacion: 'La Boca, CABA', anio: '2023' },
            { modelo: 'Casa Familiar Grande', ubicacion: 'Nordelta, Buenos Aires', anio: '2022' },
            { modelo: 'Oficina Corporativa', ubicacion: 'Catalinas Norte, CABA', anio: '2023' },
            { modelo: 'Casa Sustentable Plus', ubicacion: 'Mendoza Capital', anio: '2022' },
            { modelo: 'Loft Creativo', ubicacion: 'Barracas, CABA', anio: '2023' },
            { modelo: 'Casa Playa', ubicacion: 'Mar del Plata, Buenos Aires', anio: '2022' },
            { modelo: 'Oficina Coworking', ubicacion: 'Núñez, CABA', anio: '2023' },
            { modelo: 'Casa Moderna', ubicacion: 'Rosario, Santa Fe', anio: '2022' },
            { modelo: 'Showroom', ubicacion: 'Palermo Hollywood, CABA', anio: '2023' },
            { modelo: 'Casa Inteligente', ubicacion: 'Córdoba Capital', anio: '2022' }
        ];

        for (let i = 0; i < proyectos.length; i++) {
            const proyecto = proyectos[i];
            console.log(`   🏗️ Agregando Proyecto ${i + 1}: ${proyecto.modelo} con imágenes reales`);

            await page.click('button:has-text("Agregar Proyecto")');
            await page.fill(`input[name="proyectos.${i}.modelo"]`, proyecto.modelo);
            await page.fill(`input[name="proyectos.${i}.ubicacion"]`, proyecto.ubicacion);
            await page.fill(`input[name="proyectos.${i}.anio"]`, proyecto.anio);
            await page.fill(`input[name="proyectos.${i}.superficie"]`, `${50 + i * 10}`);
            await page.fill(`input[name="proyectos.${i}.dormitorios"]`, `${1 + i % 4}`);
            await page.fill(`input[name="proyectos.${i}.banios"]`, `${1 + i % 3}`);

            // Subir 4 imágenes reales por proyecto
            const img1 = page.locator(`input[data-testid="proyecto-${i}-image1"]`);
            await img1.setInputFiles(getTestImage(`proyecto-${i}-exterior.jpg`, 'large', 30 + i * 4));

            const img2 = page.locator(`input[data-testid="proyecto-${i}-image2"]`);
            await img2.setInputFiles(getTestImage(`proyecto-${i}-interior.jpg`, 'medium', 30 + i * 4 + 1));

            const img3 = page.locator(`input[data-testid="proyecto-${i}-image3"]`);
            await img3.setInputFiles(getTestImage(`proyecto-${i}-detalle.jpg`, 'small', 30 + i * 4 + 2));

            const img4 = page.locator(`input[data-testid="proyecto-${i}-image4"]`);
            await img4.setInputFiles(getTestImage(`proyecto-${i}-acabados.jpg`, 'medium', 30 + i * 4 + 3));
        }

        await page.click('button:has-text("Siguiente")');

        // ==================== PASO 7: CLIENTES CON IMÁGENES REALES ====================
        console.log('👥 Completando Paso 7: 10 Testimonios con imágenes reales');

        // 27. Clientes
        const clientes = [
            { nombre: 'Carlos Mendoza', testimonio: 'Excelente trabajo, superó nuestras expectativas. La casa quedó perfecta.' },
            { nombre: 'Ana Rodríguez', testimonio: 'Profesionales de primera. Cumplieron con todos los plazos acordados.' },
            { nombre: 'Roberto Silva', testimonio: 'Innovadores y creativos. Transformaron nuestra idea en realidad.' },
            { nombre: 'Laura Fernández', testimonio: 'Calidad excepcional y atención personalizada durante todo el proceso.' },
            { nombre: 'Diego Martín', testimonio: 'Recomiendo totalmente. Construcción rápida y resultado impecable.' },
            { nombre: 'Patricia López', testimonio: 'Superaron mis expectativas. El diseño es increíble y funcional.' },
            { nombre: 'Miguel Torres', testimonio: 'Trabajo impecable, cumplieron tiempos y presupuesto exacto.' },
            { nombre: 'Sofía Herrera', testimonio: 'Atención personalizada excepcional. Muy recomendable.' },
            { nombre: 'Andrés Castro', testimonio: 'Innovación y calidad en cada detalle. Excelente inversión.' },
            { nombre: 'Valeria Morales', testimonio: 'Profesionalismo total. Mi casa container es un sueño hecho realidad.' }
        ];

        for (let i = 0; i < clientes.length; i++) {
            const cliente = clientes[i];
            console.log(`   👤 Agregando Cliente ${i + 1}: ${cliente.nombre} con imagen real`);

            await page.click('button:has-text("Agregar Cliente")');
            await page.fill(`input[name="clientes.${i}.nombre"]`, cliente.nombre);
            await page.fill(
                `textarea[name="clientes.${i}.testimonio"]`,
                cliente.testimonio
            );

            // Subir imagen real para cada cliente
            const img = page.locator(`input[data-testid="cliente-${i}-image"]`);
            await img.setInputFiles(getTestImage(`testimonio-${i}.jpg`, 'small', 50 + i));
        }

        await page.click('button:has-text("Siguiente")');

        // ==================== PASO 8: CALCULADORA ====================
        console.log('🧮 Completando Paso 8: Calculadora de precios');

        // 28. Calculadora automática * (radio button)
        await page.check('input[value="no"]'); // "No"

        // 29. Rango metros (opcional)
        await page.fill('input[name="rangoMetros"]', '20-200 m²');

        // 30. Precio categoría (opcional)
        await page.fill('input[name="precioCategoria"]', 'Básica 700USD por metro cuadrado, Media 800USD por metro cuadrado y Premium 100USD por metro cuadrado');

        // 31. Precios diferenciales por zona * (radio button)
        await page.check('input[value="no"]'); // "No"

        // 32. Precio diferencial (opcional)
        await page.fill('input[name="precioDiferencial"]', '100USD extra por metro cuadrado fuera de Montevideo');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 9 de 9')).toBeVisible();

        // ==================== PASO 9: MENSAJES FINALES ====================
        console.log('💬 Completando Paso 9: Mensajes finales');

        // 33. Frase
        await page.fill('textarea[name="frase"]', 'Transformamos contenedores en hogares excepcionales');

        // 34. Importante
        await page.fill('textarea[name="importante"]', 'Cada proyecto es único y personalizado según las necesidades del cliente');

        // 35. Pitch
        await page.fill('textarea[name="pitch"]', 'Líderes en construcción modular sustentable');

        // ==================== VERIFICACIÓN Y ENVÍO ====================
        console.log('📤 Enviando formulario con imágenes reales...');

        // Verificar advertencias de tamaño (probablemente aparezcan con imágenes reales)
        const sizeWarning = page.locator('text=Advertencia de Tamaño');
        if (await sizeWarning.isVisible()) {
            console.log('⚠️ Advertencia de tamaño detectada (esperado con imágenes reales)');
        }

        // Enviar formulario
        await page.click('button:has-text("Enviar Formulario")');

        // Verificar pantalla de confirmación
        await expect(page.locator('text=¡Formulario enviado exitosamente!')).toBeVisible({ timeout: 20000 });
        await expect(page.locator('text=Contenedores Innovadores S.A.')).toBeVisible();

        console.log('✅ FORMULARIO CON IMÁGENES REALES ENVIADO EXITOSAMENTE!');
        console.log('📊 Resumen del test:');
        console.log('   🏠 6 modelos con 24 imágenes reales');
        console.log('   🏗️ 20 proyectos con 80 imágenes reales');
        console.log('   👥 10 testimonios con 10 imágenes reales');
        console.log('   🧮 Calculadora: SÍ');
        console.log('   📷 Total: 115 imágenes reales del Downloads');
    });

    test('debe completar SOLO los campos OBLIGATORIOS (sin modelos, proyectos ni clientes)', async ({ page }) => {
        await page.goto('/');

        console.log('📝 Iniciando test con SOLO campos obligatorios...');

        // ==================== PASO 1: DATOS DE LA EMPRESA ====================
        console.log('🏢 Paso 1: Datos de la empresa');

        // 1. Nombre de la empresa *
        await page.fill('input[name="companyName"]', 'Empresa Mínima S.A.');

        // 2. Persona de contacto *
        await page.fill('input[name="contactPerson"]', 'Juan Pérez');

        // 3. Teléfono *
        await page.fill('input[name="phone"]', '+598 99 123 456');

        // 4. Email *
        await page.fill('input[name="email"]', 'juan@empresaminima.com');

        // 5. Logo de la empresa *
        const logoInput = page.locator('input[type="file"][accept="image/*"]').first();
        const logoImage = getTestImage('logo-minimo.jpg', 'small', 0);
        await logoInput.setInputFiles(logoImage);

        // 6. Colores de marca *
        await page.fill('input[name="brandColors"]', '#FF0000, #0000FF');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 2 de 9')).toBeVisible();

        // ==================== PASO 2: UBICACIÓN Y CONTACTO ====================
        console.log('📍 Paso 2: Ubicación y contacto');

        // 7. Dirección *
        await page.fill('input[name="address"]', 'Av. Principal 123, Montevideo');

        // 8. Horarios de atención *
        await page.fill('textarea[name="businessHours"]', 'Lunes a Viernes 9:00 a 18:00');

        // 9. Redes sociales *
        await page.fill('input[name="socialMedia"]', '@empresaminima');

        // 10. WhatsApp *
        await page.fill('input[name="whatsappNumber"]', '+598 99 123 456');

        // 11. Zonas de trabajo *
        await page.fill('textarea[name="workAreas"]', 'Montevideo y área metropolitana');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 3 de 9')).toBeVisible();

        // ==================== PASO 3: HISTORIA Y EQUIPO ====================
        console.log('📚 Paso 3: Historia y equipo');

        // 12. Año de fundación *
        await page.fill('input[name="foundedYear"]', '2020');

        // 13. Tamaño del equipo * (radio button)
        await page.check('input[value="3-5"]'); // "3-5 personas"

        // 14. Especialidad principal * (checkbox - al menos una)
        await page.check('input[value="arquitectura-diseño"]'); // "Arquitectura y diseño"

        // 15. Historia de la empresa *
        await page.fill('textarea[name="companyStory"]', 'Empresa fundada en 2020 con el objetivo de ofrecer soluciones habitacionales sustentables usando containers.');

        // 16. Logros importantes *
        await page.fill('textarea[name="achievements"]', 'Certificación en construcción sustentable y más de 50 proyectos completados.');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 4 de 9')).toBeVisible();

        // ==================== PASO 4: METODOLOGÍA DE TRABAJO ====================
        console.log('⚙️ Paso 4: Metodología de trabajo');

        // 17. Cómo trabajan * (radio button)
        await page.check('input[value="precios-establecidos"]'); // "Tenemos diseños con precios establecidos"

        // 18. Tiempo de entrega *
        await page.fill('textarea[name="workTime"]', '60-90 días dependiendo del proyecto');

        // 19. Diferencial competitivo * (checkbox - al menos uno)
        await page.check('input[value="precio-competitivo"]'); // "Precio competitivo"

        // 20. Ventajas containers *
        await page.fill('textarea[name="ventajas"]', 'Las casas container son más rápidas de construir, más económicas y más sustentables que la construcción tradicional.');

        // 21. Rango de precios *
        await page.fill('textarea[name="rangoPrecios"]', 'USD 600-800 por m²');

        // 22. Proyectos realizados * (radio button)
        await page.check('input[value="1-10"]'); // "1-10 proyectos"

        // 23. Dominio web * (radio button)
        await page.check('input[value="no-tengo"]'); // "No tengo dominio y necesito ayuda para elegir y comprarlo"

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 5 de 9')).toBeVisible();

        // ==================== PASO 5: MODELOS (OPCIONAL - SALTAR) ====================
        console.log('🏠 Paso 5: Modelos (saltando - no obligatorio)');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 6 de 9')).toBeVisible();

        // ==================== PASO 6: PROYECTOS (OPCIONAL - SALTAR) ====================
        console.log('🏗️ Paso 6: Proyectos (saltando - no obligatorio)');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 7 de 9')).toBeVisible();

        // ==================== PASO 7: CLIENTES (OPCIONAL - SALTAR) ====================
        console.log('👥 Paso 7: Clientes (saltando - no obligatorio)');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 8 de 9')).toBeVisible();

        // ==================== PASO 8: CALCULADORA ====================
        console.log('🧮 Paso 8: Calculadora de precios');

        // 28. Calculadora automática * (radio button)
        await page.check('input[value="no"]'); // "No"

        // 31. Precios diferenciales por zona * (radio button)
        await page.check('input[value="no"]'); // "No"

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 9 de 9')).toBeVisible();

        // ==================== PASO 9: MENSAJES FINALES ====================
        console.log('💬 Paso 9: Mensajes finales');

        // 33. Frase principal *
        await page.fill('textarea[name="frase"]', 'Construimos tu hogar ideal con containers de calidad.');

        // 34. Información importante *
        await page.fill('textarea[name="importante"]', 'Empresa certificada con garantía de 5 años en todas nuestras construcciones.');

        // 35. Pitch de la empresa *
        await page.fill('textarea[name="pitch"]', 'Tu hogar sustentable en tiempo récord.');

        // ==================== VERIFICACIÓN Y ENVÍO ====================
        console.log('📤 Enviando formulario con solo campos obligatorios...');

        await page.click('button:has-text("Enviar Formulario")');

        // Verificar pantalla de confirmación
        await expect(page.locator('text=¡Formulario enviado exitosamente!')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Empresa Mínima S.A.')).toBeVisible();

        console.log('✅ FORMULARIO MÍNIMO ENVIADO EXITOSAMENTE!');
        console.log('📊 Resumen del test:');
        console.log('   ✅ Solo campos obligatorios completados');
        console.log('   ❌ Sin modelos adicionales');
        console.log('   ❌ Sin proyectos');
        console.log('   ❌ Sin testimonios de clientes');
        console.log('   🧮 Calculadora: NO');
        console.log('   📷 Solo 1 imagen: logo de la empresa');
    });

    test('debe mostrar información de imágenes disponibles', async ({ page }) => {
        console.log('📋 Mostrando información de imágenes disponibles...');

        const images = RealImageUtils.findAvailableImages();

        if (images.length > 0) {
            console.log(`✅ Se encontraron ${images.length} imágenes en Descargas`);

            // Mostrar información de las primeras 10 imágenes
            for (let i = 0; i < Math.min(10, images.length); i++) {
                const info = RealImageUtils.getImageInfo(images[i]);
                if (info) {
                    console.log(`   ${i + 1}. ${info.name} - ${info.sizeFormatted}`);
                }
            }

            if (images.length > 10) {
                console.log(`   ... y ${images.length - 10} imágenes más`);
            }
        } else {
            console.log('❌ No se encontraron imágenes en la carpeta Descargas');
            console.log('💡 Asegúrate de tener imágenes (.jpg, .png, .gif, etc.) en tu carpeta Descargas');
        }
    });
});