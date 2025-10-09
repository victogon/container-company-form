# 🔧 Solución al Problema de Envío del Formulario

## 📋 Problema Identificado

El formulario no puede enviarse correctamente porque **faltan las variables de entorno necesarias** para conectar con Google Sheets y Cloudinary.

## ✅ Solución Paso a Paso

### 1. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local
```

### 2. Configurar Google Sheets (OBLIGATORIO)

Para que el formulario pueda enviar datos, necesitas configurar Google Sheets:

#### A. Crear Service Account en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Ve a **APIs & Services > Credentials**
4. Clic en **"Create Credentials" > "Service Account"**
5. Completa los datos y asigna rol de **Editor**
6. Genera una clave JSON y descárgala

#### B. Habilitar APIs
En Google Cloud Console, habilita:
- ✅ Google Sheets API
- ✅ Google Drive API

#### C. Crear Google Sheet
1. Crea una nueva hoja en [Google Sheets](https://sheets.google.com)
2. Comparte la hoja con el email del Service Account (permisos de Editor)
3. Renombra la primera pestaña a **"Containers"**
4. Copia el ID de la hoja (está en la URL)

#### D. Configurar variables en .env.local
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id_aqui
```

### 3. Configurar Cloudinary (OBLIGATORIO para imágenes)

Para que las imágenes se suban correctamente:

1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Ve a tu Dashboard y copia las credenciales
3. Agrega a `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Configuraciones opcionales

Para notificaciones (opcional):
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
RESEND_API_KEY=tu_resend_api_key
NOTIFY_EMAIL_TO=tu-email@ejemplo.com
NOTIFY_EMAIL_FROM=no-reply@tudominio.com
```

### 5. Reiniciar el servidor

Después de configurar las variables:
```bash
npm run dev
```

## 🚨 Problemas Comunes

### Error: "Configuración del servidor incompleta"
- **Causa**: Faltan variables de entorno de Google
- **Solución**: Verifica que `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` y `GOOGLE_SPREADSHEET_ID` estén configuradas

### Error: "Google Sheets Service Account no configurado"
- **Causa**: La clave privada no está formateada correctamente
- **Solución**: Asegúrate de que `GOOGLE_PRIVATE_KEY` incluya los `\n` y esté entre comillas dobles

### Error: "Permission denied"
- **Causa**: El Service Account no tiene permisos en la hoja
- **Solución**: Comparte la Google Sheet con el email del Service Account

### Imágenes no se suben
- **Causa**: Faltan credenciales de Cloudinary
- **Solución**: Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`

## 📝 Verificación

Para verificar que todo funciona:

1. Llena el formulario completamente
2. Sube al menos una imagen (logo)
3. Haz clic en "Enviar" en el último paso
4. Deberías ver una pantalla de confirmación
5. Verifica que los datos aparezcan en tu Google Sheet

## 📚 Documentación Adicional

- Ver `GOOGLE_SETUP.md` para instrucciones detalladas de Google
- Ver `.env.local.example` para todas las variables disponibles

## 🆘 Soporte

Si sigues teniendo problemas:
1. Verifica que todas las variables estén configuradas
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor en la terminal