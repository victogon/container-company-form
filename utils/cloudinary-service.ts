import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export class CloudinaryService {
    /**
     * Sube una imagen a Cloudinary
     * @param file - Archivo de imagen
     * @param folder - Carpeta en Cloudinary (ej: 'containers/modelos')
     * @param companyName - Nombre de la empresa para organización
     * @returns URL de la imagen subida
     */
    static async uploadImage(
        file: File,
        folder: string,
        companyName: string
    ): Promise<{ url: string; publicId: string }> {
        try {
            // Convertir File a base64
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            // Configurar opciones de subida
            const uploadOptions = {
                folder: `containers/${companyName.toLowerCase().replace(/\s+/g, '-')}/${folder}`,
                resource_type: 'image' as const,
                transformation: [
                    { quality: 'auto:good' }, // Optimización automática
                    { fetch_format: 'auto' },  // Formato automático (WebP cuando sea posible)
                    { width: 1920, height: 1080, crop: 'limit' } // Limitar tamaño máximo
                ],
                overwrite: false,
                unique_filename: true,
            };

            // Subir a Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

            console.log(`✅ Imagen subida a Cloudinary: ${result.secure_url}`);
            return { url: result.secure_url, publicId: result.public_id };

        } catch (error) {
            console.error('❌ Error subiendo imagen a Cloudinary:', error);
            throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Sube múltiples imágenes en paralelo
     */
    static async uploadMultipleImages(
        files: (File | null)[],
        folder: string,
        companyName: string
    ): Promise<({ url: string; publicId: string } | null)[]> {
        const uploadPromises = files.map(async (file, index) => {
            if (!file) return null;

            try {
                return await this.uploadImage(file, `${folder}/image-${index + 1}`, companyName);
            } catch (error) {
                console.error(`Error subiendo imagen ${index + 1}:`, error);
                return null;
            }
        });

        return Promise.all(uploadPromises);
    }

    /**
     * Elimina una imagen de Cloudinary (opcional)
     */
    static async deleteImage(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            return false;
        }
    }
}

export default CloudinaryService;