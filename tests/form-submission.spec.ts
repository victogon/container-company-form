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

    test('debe enviar formulario completo con imágenes reales', async ({ page }) => {
        await page.goto('/?test=true');

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

        // 5. Logo de la empresa * - USAR ID ESPECÍFICO
        const logoInput = page.locator('#logo-upload');
        const logoImage = getTestImage('logo-empresa.jpg', 'medium', 0);
        await logoInput.setInputFiles(logoImage);
        await page.waitForTimeout(2000); // Esperar a que se procese

        // 6. Colores de marca *
        await page.fill('textarea[name="brandColors"]', 'Azul corporativo, dorado y verde');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 2 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 2: UBICACIÓN Y CONTACTO ====================
        console.log('📍 Completando Paso 2: Ubicación y contacto');

        // 7. Dirección *
        await page.fill('textarea[name="address"]', 'Av. Libertador 1234, CABA, Buenos Aires, Argentina');

        // 8. Horarios de atención *
        await page.fill('textarea[name="businessHours"]', 'Lunes a Viernes: 8:00 - 18:00, Sábados: 9:00 - 13:00');

        // 9. Redes sociales *
        await page.fill('textarea[name="socialMedia"]', '@contenedoresinnovadores');

        // 10. WhatsApp *`
        await page.fill('input[name="whatsappNumber"]', '+54 9 11 1234-5678');

        // 11. Zonas de trabajo *
        // Esperar a que el campo workAreas esté visible y disponible
        await expect(page.locator('textarea[name="workAreas"]')).toBeVisible({ timeout: 10000 });
        await page.fill('textarea[name="workAreas"]', 'CABA, GBA, La Plata, Mar del Plata, Córdoba, Rosario');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 3 de 9')).toBeVisible({ timeout: 10000 });

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
        await expect(page.locator('text=Paso 4 de 9')).toBeVisible({ timeout: 10000 });

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
        await page.fill('textarea[name="dominioName"]', 'contenedoresinnovadores.com.ar');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 5 de 9')).toBeVisible({ timeout: 10000 });

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

            if (i > 0) {
                await page.click('button:has-text("Agregar modelo")');
                await page.waitForTimeout(500); // Esperar a que se agregue el modelo
            }

            // Usar selectores basados en la estructura real del DOM
            const modeloContainer = page.locator('.p-4.rounded-lg').nth(i);
            await modeloContainer.locator('input[placeholder="Ejemplo: Compacta"]').fill(modelo.nombre);
            await modeloContainer.locator('input[placeholder="Ejemplo: Básico"]').fill(modelo.categoria);
            await modeloContainer.locator('input[placeholder="Ejemplo: 50 (m²)"]').fill(modelo.superficie);
            await modeloContainer.locator('input[placeholder="Ejemplo: 2"]').fill(modelo.dormitorios);
            await modeloContainer.locator('input[placeholder="Ejemplo: 1"]').fill(modelo.banios);
            await modeloContainer.locator('input[placeholder="Ejemplo: USD 750 (m²)"]').fill(modelo.precio);

            // Subir 3 imágenes reales para cada modelo
            for (let j = 1; j <= 3; j++) {
                const imageInput = page.locator(`#modelo-image-${j}-${i}`);
                const modelImage = getTestImage(`modelo-${i + 1}-imagen-${j}.jpg`, 'medium', (i * 3) + j);
                await imageInput.setInputFiles(modelImage);
                await page.waitForTimeout(1000); // Esperar entre imágenes
            }
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 6 de 9')).toBeVisible({ timeout: 15000 });

        // ==================== PASO 6: PROYECTOS CON IMÁGENES REALES ====================
        console.log('🏗️ Completando Paso 6: 4 Proyectos con imágenes reales');

        // 26. Proyectos
        const proyectos = [
            { nombre: 'Casa Sustentable Nordelta', ubicacion: 'Nordelta, Buenos Aires', anio: '2023', descripcion: 'Casa familiar de 120m² con paneles solares y sistema de recolección de agua de lluvia.' },
            { nombre: 'Oficinas Corporativas Puerto Madero', ubicacion: 'Puerto Madero, CABA', anio: '2022', descripcion: 'Complejo de oficinas modulares de 300m² con diseño minimalista y tecnología inteligente.' },
            { nombre: 'Complejo Habitacional Pilar', ubicacion: 'Pilar, Buenos Aires', anio: '2023', descripcion: 'Desarrollo de 8 unidades habitacionales con espacios comunitarios y áreas verdes.' },
            { nombre: 'Centro Comercial Rosario', ubicacion: 'Rosario, Santa Fe', anio: '2022', descripcion: 'Centro comercial modular de 500m² con locales gastronómicos y tiendas especializadas.' }
        ];

        for (let i = 0; i < proyectos.length; i++) {
            const proyecto = proyectos[i];
            console.log(`   🏗️ Agregando Proyecto ${i + 1}: ${proyecto.nombre} con imágenes reales`);

            await page.click('button:has-text("Agregar Proyecto")');
            await page.fill(`input[name="proyectos.${i}.nombre"]`, proyecto.nombre);
            await page.fill(`input[name="proyectos.${i}.ubicacion"]`, proyecto.ubicacion);
            await page.fill(`input[name="proyectos.${i}.anio"]`, proyecto.anio);
            await page.fill(`textarea[name="proyectos.${i}.descripcion"]`, proyecto.descripcion);

            // Subir 4 imágenes reales para cada proyecto
            for (let j = 0; j < 4; j++) {
                const imageInput = page.locator(`input[name="proyectos.${i}.imagenes.${j}"]`);
                const projectImage = getTestImage(`proyecto-${i + 1}-imagen-${j + 1}.jpg`, 'large', (i * 4) + j + 18); // offset para no repetir imágenes
                await imageInput.setInputFiles(projectImage);
                await page.waitForTimeout(1000);
            }
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 7 de 9')).toBeVisible({ timeout: 15000 });

        // ==================== PASO 7: CLIENTES ====================
        console.log('👥 Completando Paso 7: Clientes');

        // 27. Clientes
        const clientes = [
            { nombre: 'Familia Rodriguez', proyecto: 'Casa Sustentable Nordelta', testimonio: 'Excelente trabajo, superó nuestras expectativas. La casa es hermosa y muy eficiente energéticamente.' },
            { nombre: 'Empresa TechSolutions', proyecto: 'Oficinas Corporativas Puerto Madero', testimonio: 'Profesionalismo excepcional. Las oficinas quedaron perfectas para nuestro equipo de trabajo.' },
            { nombre: 'Desarrolladora Inmobiliaria Sur', proyecto: 'Complejo Habitacional Pilar', testimonio: 'Cumplieron con todos los plazos y la calidad es superior. Definitivamente volveremos a trabajar juntos.' }
        ];

        for (let i = 0; i < clientes.length; i++) {
            const cliente = clientes[i];
            console.log(`   👤 Agregando Cliente ${i + 1}: ${cliente.nombre}`);

            await page.click('button:has-text("Agregar Cliente")');
            await page.fill(`input[name="clientes.${i}.nombre"]`, cliente.nombre);
            await page.fill(`input[name="clientes.${i}.proyecto"]`, cliente.proyecto);
            await page.fill(`textarea[name="clientes.${i}.testimonio"]`, cliente.testimonio);
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 8 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 8: CALCULADORA DE PRECIOS ====================
        console.log('💰 Completando Paso 8: Calculadora de precios');

        // 28. ¿Quieren incluir una calculadora automática de precios en la web? (OBLIGATORIO)
        console.log('   📊 Pregunta 28: Calculadora automática');
        await page.check('input[name="calculadoraOption"][value="si"]');

        // 29. Rango de metros cuadrados (condicional)
        console.log('   📏 Pregunta 29: Rango de metros cuadrados');
        await page.fill('textarea[name="rangoMetros"]', '35-150 m²');

        // 30. Precio por m² por categoría (condicional)
        console.log('   💵 Pregunta 30: Precios por categoría');
        await page.fill('textarea[name="precioCategoria"]', 'Categoría Básica: USD 650/m²\nCategoría Estándar: USD 850/m²\nCategoría Premium: USD 1100/m²\nCategoría Luxury: USD 1400/m²');

        // 31. ¿Tienen precios diferenciales según la zona geográfica? (OBLIGATORIO)
        console.log('   🗺️ Pregunta 31: Precios diferenciales por zona');
        await page.check('input[name="precioDifOpcion"][value="si"]');

        // 32. Ajustes por zona (condicional)
        console.log('   📍 Pregunta 32: Ajustes por zona geográfica');
        await page.fill('textarea[name="precioDifValor"]', 'CABA: USD +150/m²\nGBA Norte: USD +100/m²\nGBA Sur: precio base\nGBA Oeste: USD +50/m²\nInterior Buenos Aires: USD +80/m²\nOtras provincias: USD +120/m²');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 9 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 9: MENSAJES Y COMUNICACIÓN ====================
        console.log('💬 Completando Paso 9: Mensajes y comunicación');

        // 33. ¿Tienen alguna frase o mensaje que los identifique como empresa? (OBLIGATORIO)
        console.log('   🎯 Pregunta 33: Frase identificatoria');
        await page.fill('textarea[name="frase"]', 'Construimos tu hogar sustentable con la innovación de los containers y la calidez del diseño personalizado');

        // 34. ¿Cómo les gusta describir su trabajo cuando hablan con clientes? (OBLIGATORIO)
        console.log('   🗣️ Pregunta 34: Descripción del trabajo');
        await page.fill('textarea[name="pitch"]', 'Transformamos containers marítimos en hogares únicos y sustentables. Combinamos diseño arquitectónico de vanguardia con construcción rápida y eficiente, creando espacios que respetan el medio ambiente sin comprometer el confort y la estética.');

        // 35. ¿Hay algo importante sobre su empresa que quieran que sea visible en la web? (OBLIGATORIO)
        console.log('   ⭐ Pregunta 35: Información importante');
        await page.fill('textarea[name="importante"]', 'Certificación LEED Gold en construcción sustentable\nGarantía estructural de 15 años\nTiempo de construcción: 45-90 días\nFinanciación propia disponible\nAsesoramiento integral desde el diseño hasta la entrega\nServicio post-venta y mantenimiento\nMás de 200 proyectos entregados en Argentina');

        // ==================== ENVÍO DEL FORMULARIO ====================
        console.log('📤 Enviando formulario completo...');

        await page.click('button[type="submit"]:has-text("Enviar")');

        // Verificar que aparece la pantalla de confirmación
        await expect(page.locator('text=¡Formulario enviado!')).toBeVisible({ timeout: 30000 });

        console.log('✅ Formulario completo enviado exitosamente con imágenes reales del Downloads!');
    });

    test('debe completar solo los campos obligatorios', async ({ page }) => {
        await page.goto('/?test=true');

        console.log('🚀 Iniciando test con solo campos obligatorios...');

        // ==================== PASO 1: DATOS DE LA EMPRESA (SOLO OBLIGATORIOS) ====================
        console.log('🏢 Completando Paso 1: Solo campos obligatorios');

        await page.fill('input[name="companyName"]', 'Containers Básicos');
        await page.fill('input[name="contactPerson"]', 'Juan Pérez');
        await page.fill('input[name="phone"]', '+54 9 11 9876-5432');
        await page.fill('input[name="email"]', 'juan@containersbasicos.com');

        // Logo obligatorio - USAR ID ESPECÍFICO
        const logoInput = page.locator('#logo-upload');
        const logoImage = getTestImage('logo-basico.jpg', 'small', 0);
        await logoInput.setInputFiles(logoImage);
        await page.waitForTimeout(2000);

        await page.fill('textarea[name="brandColors"]', 'Negro y blanco');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 2 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 2: UBICACIÓN (SOLO OBLIGATORIOS) ====================
        console.log('📍 Completando Paso 2: Solo campos obligatorios');

        await page.fill('textarea[name="address"]', 'Calle Falsa 123, Buenos Aires');
        await page.fill('textarea[name="businessHours"]', 'Lunes a Viernes 9-17');
        await page.fill('textarea[name="socialMedia"]', '@containers');
        await page.fill('input[name="whatsappNumber"]', '+54 9 11 9876-5432');
        await page.fill('textarea[name="workAreas"]', 'Buenos Aires');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 3 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 3: HISTORIA (SOLO OBLIGATORIOS) ====================
        console.log('📚 Completando Paso 3: Solo campos obligatorios');

        await page.fill('input[name="foundedYear"]', '2023');
        await page.check('input[value="1-2"]');
        await page.check('input[value="arquitectura-diseño"]');
        await page.fill('textarea[name="companyStory"]', 'Empresa nueva en el rubro.');
        await page.fill('textarea[name="achievements"]', 'Primer año de operaciones.');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 4 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 4: METODOLOGÍA (SOLO OBLIGATORIOS) ====================
        console.log('⚙️ Completando Paso 4: Solo campos obligatorios');

        await page.check('input[value="precios-establecidos"]');
        await page.fill('textarea[name="workTime"]', '30-60 días');
        await page.check('input[value="precio-competitivo"]');
        await page.fill('textarea[name="ventajas"]', 'Rápido y económico.');
        await page.fill('textarea[name="rangoPrecios"]', 'USD 500-700 por m²');
        await page.check('input[value="1-10"]');
        await page.check('input[value="no-tengo"]');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 5 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== SALTAR PASOS OPCIONALES ====================
        console.log('⏭️ Saltando pasos opcionales (5, 6, 7, 8)...');

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

        // 28. ¿Quieren incluir una calculadora automática de precios en la web? (OBLIGATORIO)
        await page.check('input[name="calculadoraOption"][value="no"]');

        // 31. ¿Tienen precios diferenciales según la zona geográfica? (OBLIGATORIO)
        await page.check('input[name="precioDifOpcion"][value="no"]');

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 9 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 9: MENSAJES Y COMUNICACIÓN (CAMPOS OBLIGATORIOS) ====================
        console.log('💬 Completando Paso 9: Solo campos obligatorios');

        // 33. ¿Tienen alguna frase o mensaje que los identifique como empresa? (OBLIGATORIO)
        await page.fill('textarea[name="frase"]', 'Containers de calidad para tu hogar');

        // 34. ¿Cómo les gusta describir su trabajo cuando hablan con clientes? (OBLIGATORIO)
        await page.fill('textarea[name="pitch"]', 'Construimos casas con containers de forma rápida y económica');

        // 35. ¿Hay algo importante sobre su empresa que quieran que sea visible en la web? (OBLIGATORIO)
        await page.fill('textarea[name="importante"]', 'Empresa nueva con ganas de crecer en el mercado');

        await page.click('button[type="submit"]:has-text("Enviar")');

        // Verificar que aparece la pantalla de confirmación
        await expect(page.locator('text=¡Formulario enviado!')).toBeVisible({ timeout: 30000 });

        console.log('✅ Formulario con solo campos obligatorios enviado exitosamente!');
    });

    test('debe mostrar información de imágenes disponibles', async ({ page }) => {
        console.log('📋 Mostrando información de imágenes disponibles en Downloads...');

        // Este test solo muestra información, no interactúa con la página
        RealImageUtils.listAvailableImages();

        const totalImages = RealImageUtils.getTotalImageCount();
        console.log(`📊 Total de imágenes encontradas: ${totalImages}`);

        if (totalImages > 0) {
            console.log('✅ Hay imágenes disponibles para los tests');

            // Mostrar algunas imágenes de ejemplo por tamaño
            const smallImage = RealImageUtils.getImageBySize('small', 0);
            const mediumImage = RealImageUtils.getImageBySize('medium', 0);
            const largeImage = RealImageUtils.getImageBySize('large', 0);

            if (smallImage) {
                const info = RealImageUtils.getImageInfo(smallImage);
                console.log(`📷 Imagen pequeña ejemplo: ${info?.name} (${info?.sizeFormatted})`);
            }

            if (mediumImage) {
                const info = RealImageUtils.getImageInfo(mediumImage);
                console.log(`📷 Imagen mediana ejemplo: ${info?.name} (${info?.sizeFormatted})`);
            }

            if (largeImage) {
                const info = RealImageUtils.getImageInfo(largeImage);
                console.log(`📷 Imagen grande ejemplo: ${info?.name} (${info?.sizeFormatted})`);
            }
        } else {
            console.log('⚠️ No se encontraron imágenes en la carpeta Downloads');
            console.log('💡 Los tests usarán imágenes simuladas como fallback');
        }

        // Ir a la página para que el test no falle
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();

        console.log('✅ Test de información completado');
    });
});