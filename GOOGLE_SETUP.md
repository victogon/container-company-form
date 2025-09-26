# Configuración de Google APIs para el Formulario

## ⚠️ IMPORTANTE: Configuración Actualizada

**El problema identificado:** Google Sheets API no acepta API Keys simples, requiere **Service Account** para aplicaciones del servidor.

## 🔧 Configuración Correcta (Service Account)

### 1. Google Cloud Console - Service Account

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services > Credentials**
4. Haz clic en **"Create Credentials" > "Service Account"**
5. Completa los datos:
   - **Service account name**: `form-sheets-service`
   - **Description**: `Service account for form submissions to Google Sheets`
6. Haz clic en **"Create and Continue"**
7. En **"Grant this service account access to project"**:
   - Rol: **Editor** (o **Google Sheets API > Sheets Editor**)
8. Haz clic en **"Done"**

### 2. Generar Clave JSON del Service Account

1. En la lista de Service Accounts, haz clic en el que acabas de crear
2. Ve a la pestaña **"Keys"**
3. Haz clic en **"Add Key" > "Create new key"**
4. Selecciona **JSON** y haz clic en **"Create"**
5. Se descargará un archivo JSON - **¡GUÁRDALO SEGURO!**

### 3. Habilitar APIs Necesarias

En Google Cloud Console, ve a **APIs & Services > Library** y habilita:
- ✅ **Google Sheets API**
- ✅ **Google Drive API**

### 4. Configurar Google Sheets

1. Crea una nueva hoja de cálculo en [Google Sheets](https://sheets.google.com)
2. **Importante**: Comparte la hoja con el email del Service Account:
   - Copia el email del service account (está en el archivo JSON como `client_email`)
   - En Google Sheets: **Share > Add people** 
   - Pega el email del service account
   - Asigna permisos de **Editor**
3. Renombra la primera pestaña a **"Containers"**
4. Copia el ID de la hoja (está en la URL): `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### 5. Configurar Google Drive (Opcional)

1. Crea una carpeta en [Google Drive](https://drive.google.com)
2. Comparte la carpeta con el email del Service Account (permisos de Editor)
3. Copia el ID de la carpeta (está en la URL): `https://drive.google.com/drive/folders/[FOLDER_ID]`

### 6. Actualizar Variables de Entorno

Actualiza tu archivo `.env.local`:

```env
# Google Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=161IDLnOS2heldWgS-uFJExMGsuslySXfwMBBppKDa1s
GOOGLE_DRIVE_FOLDER_ID=1-khr6dYVMph0XGJ2-d5WmeU8ksfA-iSd

# Form Configuration
FORM_TYPE=containers
NODE_ENV=development
```

**⚠️ Importante para GOOGLE_PRIVATE_KEY:**
- Copia la clave privada completa del archivo JSON (campo `private_key`)
- Mantén los `\n` en el texto
- Encierra toda la clave entre comillas dobles

### 7. Estructura de Columnas Requerida

La hoja "Containers" debe tener estas **36 columnas** en la primera fila (A hasta AJ):

| Columna | Campo | Descripción |
|---------|-------|-------------|
| A | timestamp | Fecha y hora del envío |
| B | companyName | Nombre de la empresa |
| C | contactPerson | Persona de contacto |
| D | phone | Teléfono |
| E | email | Email |
| F | logoUrl | URL del logo |
| G | brandColors | Colores de marca |
| H | address | Dirección |
| I | businessHours | Horarios de atención |
| J | socialMedia | Redes sociales |
| K | whatsappNumber | Número de WhatsApp |
| L | workAreas | Áreas de trabajo |
| M | foundedYear | Año de fundación |
| N | teamSize | Tamaño del equipo |
| O | specialties | Especialidades |
| P | companyStory | Historia de la empresa |
| Q | achievements | Logros |
| R | workStyle | Estilo de trabajo |
| S | workTime | Tiempo de trabajo |
| T | diferencialCompetitivo | Diferencial competitivo |
| U | ventajas | Ventajas |
| V | rangoPrecios | Rango de precios |
| W | proyectosRealizados | Proyectos realizados |
| X | dominioOption | Opción de dominio |
| Y | dominioName | Nombre del dominio |
| Z | calculadoraOption | Opción de calculadora |
| AA | rangoMetros | Rango de metros |
| AB | precioCategoria | Categoría de precio |
| AC | precioDifOpcion | Opción diferencial de precio |
| AD | precioDifValor | Valor diferencial de precio |
| AE | frase | Frase principal |
| AF | pitch | Pitch de la empresa |
| AG | importante | Información importante |
| AH | modelosData | **Datos de modelos (JSON)** |
| AI | proyectosData | **Datos de proyectos (JSON)** |
| AJ | clientesData | **Datos de clientes (JSON)** |

### 📝 **Importante sobre las columnas de datos complejos:**

Las últimas 3 columnas (AH, AI, AJ) contienen **datos JSON estructurados**:

- **modelosData**: Todos los modelos en formato JSON con sus imágenes y detalles
- **proyectosData**: Todos los proyectos en formato JSON con sus imágenes y detalles  
- **clientesData**: Todos los clientes en formato JSON con sus testimonios e imágenes

**No necesitas una columna por cada modelo/proyecto/cliente individual** - el sistema los agrupa automáticamente en estas 3 columnas como JSON.