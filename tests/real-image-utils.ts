import fs from 'fs';
import path from 'path';
import os from 'os';

export class RealImageUtils {
  private static readonly DOWNLOADS_PATH = path.join(os.homedir(), 'Downloads');
  private static imageCache: string[] = [];

  // Buscar todas las imágenes en la carpeta de Descargas
  static findAvailableImages(): string[] {
    if (this.imageCache.length > 0) {
      return this.imageCache;
    }

    try {
      const files = fs.readdirSync(this.DOWNLOADS_PATH);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      
      this.imageCache = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map(file => path.join(this.DOWNLOADS_PATH, file))
        .filter(filePath => {
          try {
            const stats = fs.statSync(filePath);
            // Filtrar archivos que sean menores a 50MB para evitar problemas
            return stats.isFile() && stats.size < 50 * 1024 * 1024;
          } catch {
            return false;
          }
        });

      console.log(`📁 Encontradas ${this.imageCache.length} imágenes en Descargas`);
      return this.imageCache;
    } catch (error) {
      console.warn('⚠️ No se pudo acceder a la carpeta de Descargas, usando imágenes simuladas');
      return [];
    }
  }

  // Obtener una imagen específica por índice
  static getImageByIndex(index: number): string | null {
    const images = this.findAvailableImages();
    if (images.length === 0) return null;
    
    // Usar módulo para ciclar a través de las imágenes disponibles
    const actualIndex = index % images.length;
    return images[actualIndex];
  }

  // Obtener imagen por tamaño aproximado (pequeña, mediana, grande)
  static getImageBySize(preferredSize: 'small' | 'medium' | 'large', fallbackIndex: number = 0): string | null {
    const images = this.findAvailableImages();
    if (images.length === 0) return null;

    try {
      const imagesWithSizes = images.map(imagePath => {
        const stats = fs.statSync(imagePath);
        return { path: imagePath, size: stats.size };
      });

      let filteredImages: typeof imagesWithSizes = [];

      switch (preferredSize) {
        case 'small':
          // Menos de 1MB
          filteredImages = imagesWithSizes.filter(img => img.size < 1024 * 1024);
          break;
        case 'medium':
          // Entre 1MB y 5MB
          filteredImages = imagesWithSizes.filter(img => img.size >= 1024 * 1024 && img.size < 5 * 1024 * 1024);
          break;
        case 'large':
          // Más de 5MB
          filteredImages = imagesWithSizes.filter(img => img.size >= 5 * 1024 * 1024);
          break;
      }

      if (filteredImages.length > 0) {
        const randomIndex = fallbackIndex % filteredImages.length;
        return filteredImages[randomIndex].path;
      }

      // Si no hay imágenes del tamaño preferido, usar cualquiera
      return this.getImageByIndex(fallbackIndex);
    } catch {
      return this.getImageByIndex(fallbackIndex);
    }
  }

  // Obtener información de una imagen
  static getImageInfo(imagePath: string): { name: string; size: number; sizeFormatted: string } | null {
    try {
      const stats = fs.statSync(imagePath);
      const name = path.basename(imagePath);
      const size = stats.size;
      const sizeFormatted = this.formatFileSize(size);
      
      return { name, size, sizeFormatted };
    } catch {
      return null;
    }
  }

  // Formatear tamaño de archivo
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Crear fallback si no hay imágenes reales
  static createFallbackImage(name: string, sizeKB: number = 500): { name: string; mimeType: string; buffer: Buffer } {
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
    const jpegFooter = Buffer.from([0xFF, 0xD9]);
    const imageData = Buffer.alloc(sizeKB * 1024 - jpegHeader.length - jpegFooter.length, 0x80);
    
    return {
      name,
      mimeType: 'image/jpeg',
      buffer: Buffer.concat([jpegHeader, imageData, jpegFooter])
    };
  }

  // Listar todas las imágenes disponibles con información
  static listAvailableImages(): void {
    const images = this.findAvailableImages();
    console.log('\n📸 IMÁGENES DISPONIBLES EN DESCARGAS:');
    console.log('=====================================');
    
    if (images.length === 0) {
      console.log('❌ No se encontraron imágenes en la carpeta de Descargas');
      return;
    }

    images.forEach((imagePath, index) => {
      const info = this.getImageInfo(imagePath);
      if (info) {
        console.log(`${index + 1}. ${info.name} (${info.sizeFormatted})`);
      }
    });
    console.log('=====================================\n');
  }
}