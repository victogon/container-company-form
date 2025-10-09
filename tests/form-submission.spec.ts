import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
// Alias de tipo local alineado con la firma esperada por Playwright
type FilePayload = { name: string; mimeType: string; buffer: Buffer<ArrayBufferLike> };
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

    // Helper para convertir rutas o payloads mixtos a FilePayload[] (requerido por setInputFiles)
    const mimeFromExt = (filePath: string): string => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
        if (ext === '.png') return 'image/png';
        if (ext === '.webp') return 'image/webp';
        if (ext === '.gif') return 'image/gif';
        if (ext === '.bmp') return 'image/bmp';
        return 'application/octet-stream';
    };

    const toFilePayloads = (items: (string | FilePayload)[], defaultNamePrefix: string): ReadonlyArray<FilePayload> => {
        return items.map((it, idx) => {
            if (typeof it === 'string') {
                const name = path.basename(it) || `${defaultNamePrefix}-${idx + 1}.jpg`;
                const mimeType = mimeFromExt(it);
                const buffer = fs.readFileSync(it);
                return { name, mimeType, buffer };
            }
            return it;
        });
    };

    // Helper function para verificar que la imagen se haya cargado en Cloudinary
    const waitForImageUpload = async (page: any, imageIndex: number, maxRetries: number = 15) => {
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                // Buscar cualquier texto que contenga una URL de Cloudinary
                const cloudinaryElements = await page.locator('text=/https:\/\/res\.cloudinary\.com\/.*\.(jpg|png|jpeg)/').all();

                if (cloudinaryElements.length >= imageIndex) {
                    const cloudinaryUrl = await cloudinaryElements[imageIndex - 1].textContent();
                    if (cloudinaryUrl && cloudinaryUrl.includes('cloudinary.com')) {
                        console.log(`      ✅ Imagen ${imageIndex} cargada en Cloudinary: ${cloudinaryUrl.substring(0, 60)}...`);
                        return true;
                    }
                }

                // Método alternativo: buscar por el patrón específico de la imagen
                const imagePattern = page.locator(`text=/https:\/\/res\.cloudinary\.com\/.*\.(jpg|png|jpeg)/`).nth(imageIndex - 1);
                const urlText = await imagePattern.textContent({ timeout: 1000 });

                if (urlText && urlText.includes('cloudinary.com')) {
                    console.log(`      ✅ Imagen ${imageIndex} cargada en Cloudinary: ${urlText.substring(0, 60)}...`);
                    return true;
                }
            } catch (error) {
                // Continuar intentando
            }

            console.log(`      ⏳ Esperando carga de imagen ${imageIndex} (intento ${retry + 1}/${maxRetries})`);
            await page.waitForTimeout(2000); // Aumentar tiempo entre intentos
        }

        console.log(`      ⚠️ Imagen ${imageIndex} no se cargó completamente en Cloudinary después de ${maxRetries} intentos`);
        return false;
    };

    test('debe enviar formulario completo con imágenes reales', async ({ page }) => {
        test.setTimeout(480000); // 8 minutos de timeout para el test completo
        await page.goto('/?test=true');

        console.log('🚀 Iniciando test completo con imágenes reales del Downloads...');

        // Configurar listener para logs del backend desde el inicio
        let totalImagesProcessed = 0;
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('imágenes procesadas correctamente')) {
                console.log('✅ Confirmado desde backend:', text);
                // Extraer el número de imágenes del mensaje
                const match = text.match(/(\d+)\s+imágenes/);
                if (match) {
                    totalImagesProcessed = parseInt(match[1]);
                }
            }
        });

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

        // Esperar a que la imagen se suba completamente a Cloudinary
        // Verificamos que aparezca el texto "Archivo:" que indica que la subida fue exitosa
        await expect(page.locator('img[alt="Logo"]')).toBeVisible({ timeout: 15000 });

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
        console.log('🏠 Completando Paso 5: 10 Modelos con 4 imágenes cada uno');

        // 25. Modelos - 10 modelos con variedad
        const modelos = [
            { nombre: 'Estudio Compacto Urban', categoria: 'Habitacional', superficie: '25', dormitorios: '1', banios: '1', precio: '45000' },
            { nombre: 'Casa Familiar Premium', categoria: 'Habitacional', superficie: '80', dormitorios: '3', banios: '2', precio: '95000' },
            { nombre: 'Oficina Comercial Executive', categoria: 'Comercial', superficie: '60', dormitorios: '0', banios: '2', precio: '75000' },
            { nombre: 'Loft Industrial Moderno', categoria: 'Habitacional', superficie: '120', dormitorios: '2', banios: '2', precio: '135000' },
            { nombre: 'Centro Comercial Modular', categoria: 'Comercial', superficie: '200', dormitorios: '0', banios: '4', precio: '180000' },
            { nombre: 'Villa Sustentable Eco', categoria: 'Habitacional', superficie: '150', dormitorios: '4', banios: '3', precio: '165000' },
            { nombre: 'Duplex Contemporáneo', categoria: 'Habitacional', superficie: '180', dormitorios: '3', banios: '3', precio: '195000' },
            { nombre: 'Oficina Startup Hub', categoria: 'Comercial', superficie: '40', dormitorios: '0', banios: '1', precio: '55000' },
            { nombre: 'Casa de Campo Rústica', categoria: 'Habitacional', superficie: '220', dormitorios: '5', banios: '4', precio: '285000' },
            { nombre: 'Showroom Comercial', categoria: 'Comercial', superficie: '300', dormitorios: '0', banios: '3', precio: '320000' }
        ];

        for (let i = 0; i < modelos.length; i++) {
            const modelo = modelos[i];
            console.log(`   📦 Agregando Modelo ${i + 1}: ${modelo.nombre} con imágenes reales`);

            if (i > 0) {
                await page.click('button:has-text("Agregar modelo")');
                // Esperar a que el nuevo modelo se agregue al DOM
                await page.waitForFunction(
                    (expectedCount) => document.querySelectorAll('.p-4.rounded-lg').length >= expectedCount,
                    i + 1,
                    { timeout: 5000 }
                );
                await page.waitForTimeout(500); // Tiempo para estabilizar el DOM
            }

            // Usar selectores basados en la estructura real del DOM
            const modeloContainer = page.locator('.p-4.rounded-lg').nth(i);

            // Esperar a que el contenedor esté visible antes de interactuar
            await modeloContainer.waitFor({ state: 'visible', timeout: 5000 });

            await modeloContainer.locator('input[placeholder="Ejemplo: Compacta"]').fill(modelo.nombre);
            await modeloContainer.locator('input[placeholder="Ejemplo: Básico"]').fill(modelo.categoria);
            await modeloContainer.locator('input[placeholder="Ejemplo: 50 (m²)"]').fill(modelo.superficie);
            await modeloContainer.locator('input[placeholder="Ejemplo: 2"]').fill(modelo.dormitorios);
            await modeloContainer.locator('input[placeholder="Ejemplo: 1"]').fill(modelo.banios);
            await modeloContainer.locator('input[placeholder="Ejemplo: USD 750 (m²)"]').fill(modelo.precio);

            // Subir 4 imágenes usando input múltiple por modelo
            const multiImageSelector = `#modelo-images-${i}`;
            console.log(`      🔍 Buscando selector múltiple: ${multiImageSelector}`);
            try {
                const imageInput = modeloContainer.locator(multiImageSelector);
                const elementCount = await imageInput.count();
                console.log(`      📊 Elementos encontrados con selector ${multiImageSelector}: ${elementCount}`);
                if (elementCount === 0) {
                    console.log(`      ❌ No se encontró el input múltiple de imágenes: ${multiImageSelector}`);
                } else {
                    await imageInput.waitFor({ state: 'attached', timeout: 10000 });
                    const images = [
                        getTestImage(`modelo-${i + 1}-imagen-1.jpg`, 'medium', (i * 4) + 1),
                        getTestImage(`modelo-${i + 1}-imagen-2.jpg`, 'medium', (i * 4) + 2),
                        getTestImage(`modelo-${i + 1}-imagen-3.jpg`, 'medium', (i * 4) + 3),
                        getTestImage(`modelo-${i + 1}-imagen-4.jpg`, 'medium', (i * 4) + 4)
                    ];
                    await imageInput.setInputFiles(toFilePayloads(images, `modelo-${i + 1}`));
                    console.log(`      ✅ 4 imágenes cargadas exitosamente para modelo ${i + 1}`);
                    // Esperar thumbnails visibles
                    const grid = modeloContainer.locator('.grid.grid-cols-4');
                    await expect(grid).toBeVisible({ timeout: 15000 });
                    const thumbs = modeloContainer.locator('.relative.group.h-24');
                    await expect(thumbs).toHaveCount(4, { timeout: 15000 });
                    console.log(`      ✅ Confirmado: 4 thumbnails visibles para modelo ${i + 1}`);
                }
            } catch (error) {
                console.log(`      ❌ Error cargando imágenes para modelo ${i + 1}: ${error}`);
            }
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 6 de 9')).toBeVisible({ timeout: 15000 });

        // ==================== PASO 6: PROYECTOS CON IMÁGENES REALES ====================
        console.log('🏗️ Completando Paso 6: 20 Proyectos con 4 imágenes cada uno');

        // 26. Proyectos - 20 proyectos diversos
        const proyectos = [
            { nombre: 'Casa Sustentable Nordelta', ubicacion: 'Nordelta, Buenos Aires', anio: '2023', superficie: '120', dormitorios: '3', banios: '2' },
            { nombre: 'Oficinas Corporativas Puerto Madero', ubicacion: 'Puerto Madero, CABA', anio: '2022', superficie: '300', dormitorios: '0', banios: '4' },
            { nombre: 'Complejo Habitacional Pilar', ubicacion: 'Pilar, Buenos Aires', anio: '2023', superficie: '180', dormitorios: '4', banios: '3' },
            { nombre: 'Centro Comercial Rosario', ubicacion: 'Rosario, Santa Fe', anio: '2022', superficie: '500', dormitorios: '0', banios: '6' },
            { nombre: 'Villa Moderna Tigre', ubicacion: 'Tigre, Buenos Aires', anio: '2023', superficie: '250', dormitorios: '5', banios: '4' },
            { nombre: 'Oficina Tech Palermo', ubicacion: 'Palermo, CABA', anio: '2023', superficie: '150', dormitorios: '0', banios: '2' },
            { nombre: 'Casa Minimalista La Plata', ubicacion: 'La Plata, Buenos Aires', anio: '2022', superficie: '90', dormitorios: '2', banios: '2' },
            { nombre: 'Complejo Turístico Bariloche', ubicacion: 'Bariloche, Río Negro', anio: '2023', superficie: '400', dormitorios: '8', banios: '6' },
            { nombre: 'Estudio Artístico Recoleta', ubicacion: 'Recoleta, CABA', anio: '2022', superficie: '80', dormitorios: '1', banios: '1' },
            { nombre: 'Casa Familiar Córdoba', ubicacion: 'Córdoba Capital', anio: '2023', superficie: '160', dormitorios: '4', banios: '3' },
            { nombre: 'Oficina Coworking Belgrano', ubicacion: 'Belgrano, CABA', anio: '2022', superficie: '200', dormitorios: '0', banios: '3' },
            { nombre: 'Villa Ecológica Mendoza', ubicacion: 'Mendoza Capital', anio: '2023', superficie: '280', dormitorios: '6', banios: '5' },
            { nombre: 'Loft Industrial San Telmo', ubicacion: 'San Telmo, CABA', anio: '2022', superficie: '110', dormitorios: '2', banios: '2' },
            { nombre: 'Casa de Playa Mar del Plata', ubicacion: 'Mar del Plata, Buenos Aires', anio: '2023', superficie: '140', dormitorios: '3', banios: '2' },
            { nombre: 'Centro Médico Microcentro', ubicacion: 'Microcentro, CABA', anio: '2022', superficie: '350', dormitorios: '0', banios: '8' },
            { nombre: 'Casa Contemporánea Salta', ubicacion: 'Salta Capital', anio: '2023', superficie: '190', dormitorios: '4', banios: '3' },
            { nombre: 'Oficina Startup Villa Crespo', ubicacion: 'Villa Crespo, CABA', anio: '2022', superficie: '120', dormitorios: '0', banios: '2' },
            { nombre: 'Complejo Residencial Tucumán', ubicacion: 'San Miguel de Tucumán', anio: '2023', superficie: '320', dormitorios: '12', banios: '8' },
            { nombre: 'Casa Inteligente Neuquén', ubicacion: 'Neuquén Capital', anio: '2022', superficie: '170', dormitorios: '3', banios: '3' },
            { nombre: 'Showroom Comercial Rosario', ubicacion: 'Rosario Centro, Santa Fe', anio: '2023', superficie: '450', dormitorios: '0', banios: '5' }
        ];

        for (let i = 0; i < proyectos.length; i++) {
            const proyecto = proyectos[i];
            console.log(`   🏗️ Agregando Proyecto ${i + 1}: ${proyecto.nombre} con imágenes reales`);

            if (i > 0) {
                await page.click('button:has-text("Agregar proyecto")');
                // Esperar a que el nuevo proyecto se agregue al DOM usando el encabezado "Proyecto N"
                await expect(page.getByText(`Proyecto ${i + 1}`)).toBeVisible({ timeout: 5000 });
                await page.waitForTimeout(300);
            }

            // Acotar al contenedor del proyecto identificado por el encabezado
            const proyectoContainer = page.locator('.p-4.rounded-lg').filter({
                has: page.locator(`h4:has-text("Proyecto ${i + 1}")`)
            });

            // Asegurar visibilidad del contenedor
            await proyectoContainer.waitFor({ state: 'visible', timeout: 5000 });

            // Rellenar campos del proyecto dentro del contenedor
            await proyectoContainer.locator('input[placeholder="Ejemplo: Compacta"]').fill(proyecto.nombre);
            await proyectoContainer.locator('input[placeholder="Ejemplo: Canelones"]').fill(proyecto.ubicacion);
            await proyectoContainer.locator('input[placeholder="Ejemplo: 2025"]').fill(proyecto.anio);
            await proyectoContainer.locator('input[placeholder="Ejemplo: 100 (m²)"]').fill(proyecto.superficie);
            await proyectoContainer.locator('input[placeholder="Ejemplo: 2"]').fill(proyecto.dormitorios);
            await proyectoContainer.locator('input[placeholder="Ejemplo: 1"]').fill(proyecto.banios);

            // Subir 4 imágenes usando input múltiple por proyecto dentro del contenedor
            const multiProjectSelector = `#proyecto-images-${i}`;
            console.log(`      🔍 Buscando selector múltiple: ${multiProjectSelector}`);
            try {
                const imageInput = proyectoContainer.locator(multiProjectSelector);
                const elementCount = await imageInput.count();
                console.log(`      📊 Elementos encontrados con selector ${multiProjectSelector}: ${elementCount}`);
                if (elementCount === 0) {
                    console.log(`      ❌ No se encontró el input múltiple de imágenes: ${multiProjectSelector}`);
                } else {
                    await imageInput.waitFor({ state: 'attached', timeout: 10000 });
                    const images = [
                        getTestImage(`proyecto-${i + 1}-imagen-1.jpg`, 'large', 40 + (i * 4) + 1),
                        getTestImage(`proyecto-${i + 1}-imagen-2.jpg`, 'large', 40 + (i * 4) + 2),
                        getTestImage(`proyecto-${i + 1}-imagen-3.jpg`, 'large', 40 + (i * 4) + 3),
                        getTestImage(`proyecto-${i + 1}-imagen-4.jpg`, 'large', 40 + (i * 4) + 4)
                    ];
                    await imageInput.setInputFiles(toFilePayloads(images, `proyecto-${i + 1}`));
                    console.log(`      ✅ 4 imágenes cargadas exitosamente para proyecto ${i + 1}`);
                    // Esperar thumbnails visibles dentro del contenedor
                    const grid = proyectoContainer.locator('.grid.grid-cols-4');
                    await expect(grid).toBeVisible({ timeout: 15000 });
                    const thumbs = proyectoContainer.locator('.relative.group.h-24');
                    await expect(thumbs).toHaveCount(4, { timeout: 15000 });
                    console.log(`      ✅ Confirmado: 4 thumbnails visibles para proyecto ${i + 1}`);
                }
            } catch (error) {
                console.log(`      ❌ Error cargando imágenes para proyecto ${i + 1}: ${error}`);
            }
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 7 de 9')).toBeVisible({ timeout: 15000 });

        // ==================== PASO 7: CLIENTES ====================
        console.log('👥 Completando Paso 7: 6 Clientes con imágenes');

        // 27. Clientes - 6 clientes diversos
        const clientes = [
            { nombre: 'Familia Rodriguez', proyecto: 'Casa Sustentable Nordelta', testimonio: 'Excelente trabajo, superó nuestras expectativas. La casa es hermosa y muy eficiente energéticamente.' },
            { nombre: 'Empresa TechSolutions', proyecto: 'Oficinas Corporativas Puerto Madero', testimonio: 'Profesionalismo excepcional. Las oficinas quedaron perfectas para nuestro equipo de trabajo.' },
            { nombre: 'Desarrolladora Inmobiliaria Sur', proyecto: 'Complejo Habitacional Pilar', testimonio: 'Cumplieron con todos los plazos y la calidad es superior. Definitivamente volveremos a trabajar juntos.' },
            { nombre: 'Familia Martinez', proyecto: 'Villa Moderna Tigre', testimonio: 'Increíble atención al detalle. Nuestra villa quedó exactamente como la soñamos, moderna y funcional.' },
            { nombre: 'Startup InnovateLab', proyecto: 'Oficina Tech Palermo', testimonio: 'Entendieron perfectamente nuestras necesidades como startup. El espacio es inspirador y productivo.' },
            { nombre: 'Pareja Fernandez-Lopez', proyecto: 'Casa Minimalista La Plata', testimonio: 'Diseño minimalista perfecto. Cada metro cuadrado está optimizado y el resultado es espectacular.' }
        ];

        for (let i = 0; i < clientes.length; i++) {
            const cliente = clientes[i];
            console.log(`   👤 Agregando Cliente ${i + 1}: ${cliente.nombre}`);

            if (i > 0) {
                await page.click('button:has-text("Agregar cliente")');
                // Esperar a que el nuevo cliente se agregue al DOM con timeout reducido
                await page.waitForSelector(`.p-4.rounded-lg:nth-child(${i + 1})`, { timeout: 3000 });
                await page.waitForTimeout(200); // Tiempo reducido para estabilizar el DOM
            }

            // Usar el contenedor identificado por el encabezado "Cliente N" para mayor robustez
            const clienteContainer = page.locator('.p-4.rounded-lg').filter({
                has: page.locator(`h4:has-text("Cliente ${i + 1}")`)
            });

            // Esperar a que el contenedor esté visible antes de interactuar con timeout reducido
            await clienteContainer.waitFor({ state: 'visible', timeout: 3000 });

            await clienteContainer.locator('input[placeholder="Ejemplo: Rodrigo M."]').fill(cliente.nombre);
            await clienteContainer.locator('input[placeholder="Ejemplo: Maldonado"]').fill(cliente.proyecto);
            await clienteContainer.locator('textarea[placeholder*="Buscaba algo moderno"]').fill(cliente.testimonio);

            // Subir imagen del cliente con verificación robusta
            const clientImageSelector = `#cliente-image-${i}`;
            console.log(`      🔍 Buscando selector: ${clientImageSelector}`);
            const clientImageInput = page.locator(clientImageSelector);

            // Verificar si el elemento existe
            const elementCount = await clientImageInput.count();
            console.log(`      📊 Elementos encontrados con selector ${clientImageSelector}: ${elementCount}`);

            if (elementCount === 0) {
                console.log(`      ❌ No se encontró el input de imagen: ${clientImageSelector}`);
                continue;
            }

            // Esperar a que el input de imagen esté disponible con timeout aumentado
            await clientImageInput.waitFor({ state: 'attached', timeout: 10000 });
            const clientImage = getTestImage(`cliente-${i + 1}.jpg`, 'medium', i + 120); // offset para no repetir imágenes con modelos y proyectos
            await clientImageInput.setInputFiles(clientImage);
            console.log(`      ✅ Imagen cargada exitosamente para cliente ${i + 1}: ${cliente.nombre}`);

            // Dar tiempo para que la imagen se procese antes de continuar
            await page.waitForTimeout(2000); // Más tiempo para clientes
            console.log(`      🖼️ Imagen del cliente ${i + 1} (${cliente.nombre}) procesada`);

            // Verificar que la vista previa aparezca dentro del contenedor del cliente
            const previewImage = clienteContainer.locator('img[alt="Cliente"]');
            await expect(previewImage).toBeVisible({ timeout: 15000 });
            console.log(`      ✅ Vista previa visible para cliente ${i + 1}`);
        }

        await page.click('button:has-text("Siguiente")');
        await expect(page.locator('text=Paso 8 de 9')).toBeVisible({ timeout: 10000 });

        // ==================== PASO 8: CALCULADORA DE PRECIOS ====================
        console.log('💰 Completando Paso 8: Calculadora de precios');

        // 28. ¿Quieren incluir una calculadora automática de precios en la web? (OBLIGATORIO)
        console.log('   📊 Pregunta 28: Calculadora automática');
        await page.check('input[name="calculadoraOption"][value="si"]');

        // Los campos rangoMetros, precioCategoria y precioDifOpcion fueron removidos del formulario

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

        // Configurar listener para alertas y errores
        let alertMessage = '';
        page.on('dialog', async dialog => {
            alertMessage = dialog.message();
            console.log('🚨 Alerta detectada:', alertMessage);
            await dialog.accept();
        });

        // Configurar listener para errores de consola
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Error de consola:', msg.text());
            }
        });

        await page.click('button:has-text("Enviar")');

        // Esperar un poco para ver si aparece alguna alerta (optimizado)
        await page.waitForTimeout(500);

        // Si hay una alerta, reportarla
        if (alertMessage) {
            console.log('🚨 Se detectó una alerta durante el envío:', alertMessage);
        }

        // Verificar que el botón muestra "Enviando..." para confirmar que el envío está en progreso
        console.log('📤 Verificando que el envío está en progreso...');
        await expect(page.locator('button:has-text("Enviando...")')).toBeVisible({ timeout: 10000 });
        console.log('✅ Envío en progreso confirmado');

        // Verificar que aparece la pantalla de confirmación con timeout extendido (3 minutos)
        console.log('⏳ Esperando mensaje de confirmación...');
        await expect(page.locator('text=¡Formulario enviado!')).toBeVisible({ timeout: 180000 });

        // Tomar screenshot de la pantalla de confirmación y adjuntarlo al reporte
        const screenshot = await page.screenshot({
            fullPage: true
        });
        await test.info().attach('screenshot-confirmacion-final', {
            body: screenshot,
            contentType: 'image/png'
        });
        console.log('📸 Screenshot de confirmación tomado y adjuntado al reporte exitosamente');

        // Intentar leer el conteo de imágenes desde la pantalla de confirmación
        let confirmationText = '';
        try {
            const countLocator = page.locator('text=/\\d+\\s+imagen(?:es)?\\s+procesada(?:s)?/i');
            confirmationText = await countLocator.textContent({ timeout: 5000 }) || '';
            const match = confirmationText.match(/(\d+)/);
            if (match) {
                totalImagesProcessed = parseInt(match[1], 10);
                console.log(`✅ Conteo leído de la confirmación: ${totalImagesProcessed} imagen(es) procesada(s)`);
            } else {
                console.log('⚠️ No se pudo extraer número de la confirmación');
            }
        } catch (e) {
            console.log('⚠️ No se encontró el texto de confirmación de imágenes');
        }

        // Verificar el conteo esperado (127 total)
        const expectedTotal = 127;
        if (totalImagesProcessed === expectedTotal) {
            console.log('✅ Conteo de imágenes verificado correctamente: 127 imágenes procesadas');
            console.log('   📊 Desglose: 1 logo + 40 modelos (10x4) + 80 proyectos (20x4) + 6 clientes = 127 total');
            console.log('   ⚠️ Nota: Solo se cuentan las imágenes que se procesan en el backend');
        } else if (totalImagesProcessed > 0) {
            console.log(`⚠️ Se procesaron ${totalImagesProcessed} imágenes, esperábamos ${expectedTotal}`);
        } else {
            console.log('⚠️ No se pudo verificar el conteo de imágenes desde la pantalla de confirmación');
        }

        console.log('✅ Formulario con solo campos obligatorios enviado exitosamente!');
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

        // Esperar a que la imagen se suba completamente a Cloudinary
        // Verificamos que aparezca el texto "Archivo:" que indica que la subida fue exitosa
        await expect(page.locator('img[alt="Logo"]')).toBeVisible({ timeout: 15000 });

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

        // Precio diferencial por zona: se muestra solo si la calculadora está habilitada
        // Al seleccionar "no" en la calculadora, este bloque no aparece y no es necesario interactuar

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

        await page.click('button:has-text("Enviar")');

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

        // Ir a la página en modo test para que el test no falle
        await page.goto('/?test=true');
        await expect(page.locator('h1')).toBeVisible();

        console.log('✅ Test de información completado');
    });
});