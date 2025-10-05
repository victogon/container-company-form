import { NextRequest, NextResponse } from 'next/server';
import CloudinaryService from '../../../utils/cloudinary-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const companyName = formData.get('companyName') as string || 'unknown';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo imágenes (JPG, PNG, GIF, WebP)' 
      }, { status: 400 });
    }

    // Validar tamaño (10MB máximo por imagen individual)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Archivo demasiado grande. Máximo 10MB por imagen' 
      }, { status: 400 });
    }

    // Subir a Cloudinary
    const image = await CloudinaryService.uploadImage(file, folder, companyName);

    return NextResponse.json({
      success: true,
      url: image.url,
      publicId: image.publicId,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Error en upload-image:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// Borrar imagen por publicId
export async function DELETE(request: NextRequest) {
  try {
    const formData = await request.formData();
    const publicId = formData.get('publicId') as string;
    if (!publicId) {
      return NextResponse.json({ error: 'publicId requerido' }, { status: 400 });
    }
    const ok = await CloudinaryService.deleteImage(publicId);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('Error en delete-image:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}