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

  // Obtener el total de imágenes disponibles
  static getTotalImageCount(): number {
    const images = this.findAvailableImages();
    return images.length;
  }

  // Obtener una imagen específica por índice
  static getImageByIndex(index: number): string | null {
    const images = this.findAvailableImages();
    if (images.length === 0) return null;
    
    // Usar módulo para ciclar a través de las imágenes disponibles
    const actualIndex = index % images.length;
    return images[actualIndex];
  }

  // Obtener imagen por tamaño preferido
  static getImageBySize(preferredSize: 'small' | 'medium' | 'large', fallbackIndex: number = 0): string | null {
    const images = this.findAvailableImages();
    if (images.length === 0) return null;

    // Clasificar imágenes por tamaño
    const imagesBySize = images.map(imagePath => {
      try {
        const stats = fs.statSync(imagePath);
        return { path: imagePath, size: stats.size };
      } catch {
        return null;
      }
    }).filter(Boolean) as { path: string; size: number }[];

    // Ordenar por tamaño
    imagesBySize.sort((a, b) => a.size - b.size);

    const totalImages = imagesBySize.length;
    if (totalImages === 0) return null;

    let targetIndex: number;
    switch (preferredSize) {
      case 'small':
        targetIndex = Math.floor(totalImages * 0.2); // 20% más pequeñas
        break;
      case 'medium':
        targetIndex = Math.floor(totalImages * 0.5); // 50% medianas
        break;
      case 'large':
        targetIndex = Math.floor(totalImages * 0.8); // 80% más grandes
        break;
      default:
        targetIndex = fallbackIndex % totalImages;
    }

    return imagesBySize[targetIndex]?.path || imagesBySize[fallbackIndex % totalImages]?.path || null;
  }

  // Obtener información de una imagen
  static getImageInfo(imagePath: string): { name: string; size: number; sizeFormatted: string } | null {
    try {
      const stats = fs.statSync(imagePath);
      const name = path.basename(imagePath);
      return {
        name,
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size)
      };
    } catch {
      return null;
    }
  }

  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Crear imagen simulada como fallback
  static createFallbackImage(name: string, sizeKB: number = 500): { name: string; mimeType: string; buffer: Buffer } {
    const buffer = Buffer.alloc(sizeKB * 1024);
    // Llenar con datos simulados de imagen PNG
    buffer.write('PNG', 0);
    
    return {
      name,
      mimeType: 'image/png',
      buffer
    };
  }

  // Listar todas las imágenes disponibles
  static listAvailableImages(): void {
    const images = this.findAvailableImages();
    console.log(`\n📋 Imágenes disponibles en Downloads (${images.length}):`);
    
    if (images.length === 0) {
      console.log('   ❌ No se encontraron imágenes');
      return;
    }

    images.slice(0, 10).forEach((imagePath, index) => {
      const info = this.getImageInfo(imagePath);
      console.log(`   ${index + 1}. ${info?.name} (${info?.sizeFormatted})`);
    });

    if (images.length > 10) {
      console.log(`   ... y ${images.length - 10} más`);
    }
  }
}