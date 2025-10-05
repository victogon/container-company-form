import { google } from 'googleapis';
import { getSheetConfig, SHEET_CONFIGS, FILE_CONFIGS } from '../config/sheets-config';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

interface FileUpload {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

interface FileUrls {
    [key: string]: string;
}

interface FormData {
    [key: string]: any;
}

class GoogleSheetsService {
    private spreadsheetId: string;
    private formType: string;
    private sheetConfig: any;
    private fileConfig: any;
    private sheets: any;
    private drive: any;
    private auth: any;

    constructor(formType: string = 'containers') {
        this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
        this.formType = formType;
        this.sheetConfig = getSheetConfig(formType);
        this.fileConfig = FILE_CONFIGS[formType];

        // Configurar autenticación con Service Account
        this.initializeAuth();
    }

    private initializeAuth() {
        try {
            // Verificar si tenemos las variables de Service Account
            const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            const privateKey = process.env.GOOGLE_PRIVATE_KEY;

            if (serviceAccountEmail && privateKey) {
                // Usar Service Account (recomendado)
                console.log('Inicializando con Service Account...');
                this.auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: serviceAccountEmail,
                        private_key: privateKey.replace(/\\n/g, '\n'),
                    },
                    scopes: [
                        'https://www.googleapis.com/auth/spreadsheets',
                        'https://www.googleapis.com/auth/drive.file'
                    ]
                });
            } else {
                // Fallback a API Key (limitado)
                console.log('Usando API Key como fallback...');
                const apiKey = process.env.GOOGLE_API_KEY;
                if (!apiKey) {
                    throw new Error('No se encontró configuración de autenticación de Google');
                }
                this.auth = apiKey;
            }

            // Inicializar APIs
            this.sheets = google.sheets({
                version: 'v4',
                auth: this.auth
            });

            this.drive = google.drive({
                version: 'v3',
                auth: this.auth
            });

        } catch (error) {
            console.error('Error inicializando autenticación de Google:', error);
            throw error;
        }
    }

    /**
     * Subir archivo a Google Drive con organización por tipo de formulario
     */
    async uploadFileToDrive(file: FileUpload, filename: string, companyName?: string, fileType?: string): Promise<{ id: string, url: string }> {
        try {
            // Solución alternativa: Guardar archivos localmente
            // Las Service Accounts no tienen cuota de almacenamiento en Google Drive
            console.log('Guardando archivo localmente debido a limitaciones de Service Account...');

            // Validar configuración
            const folderPrefix = this.fileConfig?.folderPrefix || 'uploads';
            const currentYear = new Date().getFullYear().toString();

            // Crear estructura de directorios por cliente
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            const yearFolder = path.join(uploadsDir, currentYear);

            // Si tenemos nombre de empresa, crear estructura organizada
            let clientFolder = yearFolder;
            let subFolder = '';

            if (companyName) {
                // Sanitizar nombre de empresa para usar como nombre de carpeta
                const sanitizedCompanyName = companyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                clientFolder = path.join(yearFolder, sanitizedCompanyName);

                // Determinar subcarpeta según el tipo de archivo
                if (fileType) {
                    if (fileType.includes('logo')) {
                        subFolder = 'logo';
                    } else if (fileType.includes('modelo')) {
                        subFolder = 'modelos';
                    } else if (fileType.includes('proyecto')) {
                        subFolder = 'proyectos';
                    } else if (fileType.includes('cliente')) {
                        subFolder = 'clientes';
                    }
                }
            }

            const finalFolder = subFolder ? path.join(clientFolder, subFolder) : clientFolder;

            // Crear directorios si no existen
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            if (!fs.existsSync(yearFolder)) {
                fs.mkdirSync(yearFolder, { recursive: true });
            }
            if (!fs.existsSync(clientFolder)) {
                fs.mkdirSync(clientFolder, { recursive: true });
            }
            if (subFolder && !fs.existsSync(finalFolder)) {
                fs.mkdirSync(finalFolder, { recursive: true });
            }

            // Construir nombre de archivo limpio
            const timestamp = Date.now();
            const cleanFilename = filename.replace(/^[^_]*_[^_]*_/, ''); // Remover prefijos antiguos
            const finalFilename = `${timestamp}_${cleanFilename}`;
            const filePath = path.join(finalFolder, finalFilename);

            // Guardar archivo
            fs.writeFileSync(filePath, file.buffer);

            // Generar URL local organizada
            let localUrl: string;
            if (companyName && subFolder) {
                const sanitizedCompanyName = companyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                localUrl = `/uploads/${currentYear}/${sanitizedCompanyName}/${subFolder}/${finalFilename}`;
            } else if (companyName) {
                const sanitizedCompanyName = companyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                localUrl = `/uploads/${currentYear}/${sanitizedCompanyName}/${finalFilename}`;
            } else {
                // Fallback a estructura anterior
                localUrl = `/uploads/${currentYear}/${finalFilename}`;
            }

            const fileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log(`Archivo guardado localmente: ${localUrl}`);

            return {
                id: fileId,
                url: localUrl
            };
        } catch (error: any) {
            console.error(`Error saving ${filename} locally:`, error);
            throw new Error(`Failed to save ${filename}: ${error.message}`);
        }
    }

    /**
     * Subir múltiples archivos con nomenclatura específica por formulario
     */
    async uploadMultipleFiles(files: { [key: string]: FileUpload[] }, companyName?: string): Promise<FileUrls> {
        const fileUrls: FileUrls = {};
        const uploadPromises: Promise<any>[] = [];

        for (const [fieldName, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray.length > 0) {
                const file = fileArray[0]; // Multer pone archivos en arrays
                if (file && file.size > 0) {
                    const timestamp = Date.now();
                    const filename = `${this.formType}_${fieldName}_${timestamp}_${file.originalname}`;

                    uploadPromises.push(
                        this.uploadFileToDrive(file, filename, companyName, fieldName)
                            .then(result => {
                                fileUrls[fieldName] = result.url;
                                return { fieldName, result };
                            })
                            .catch(error => {
                                console.error(`Error uploading ${fieldName}:`, error);
                                fileUrls[fieldName] = `Error: ${error.message}`;
                                return { fieldName, error: error.message };
                            })
                    );
                }
            }
        }

        await Promise.all(uploadPromises);
        return fileUrls;
    }

    /**
     * Procesar datos específicos por tipo de formulario
     */
    processFormData(formData: FormData, fileUrls: FileUrls): FormData {
        const timestamp = new Date().toISOString();

        // Datos base comunes a todos los formularios
        const baseData: FormData = {
            timestamp,
            companyName: formData.companyName || '',
            contactPerson: formData.contactPerson || '',
            phone: formData.phone || '',
            email: formData.email || '',
            logoUrl: formData.logoUrl || '',
            brandColors: formData.brandColors || '',
            address: formData.address || '',
            businessHours: formData.businessHours || '',
            socialMedia: formData.socialMedia || '',
            whatsappNumber: formData.whatsappNumber || '',
            foundedYear: formData.foundedYear || '',
            teamSize: formData.teamSize || '',
            companyStory: formData.companyStory || '',
            achievements: formData.achievements || '',
            dominioOption: formData.dominioOption || '',
            dominioName: formData.dominioName || '',
            frase: formData.frase || '',
            pitch: formData.pitch || '',
            importante: formData.importante || ''
        };

        // Datos específicos por tipo de formulario
        if (this.formType === 'containers') {
            return {
                ...baseData,
                workAreas: formData.workAreas || '',
                specialties: JSON.stringify(formData.specialties || []),
                workStyle: formData.workStyle || '',
                workTime: formData.workTime || '',
                diferencialCompetitivo: JSON.stringify(formData.diferencialCompetitivo || []),
                ventajas: formData.ventajas || '',
                rangoPrecios: formData.rangoPrecios || '',
                proyectosRealizados: formData.proyectosRealizados || '',
                calculadoraOption: formData.calculadoraOption || '',
                rangoMetros: formData.rangoMetros || '',
                precioCategoria: formData.precioCategoria || '',
                precioDifOpcion: formData.precioDifOpcion || '',
                precioDifValor: formData.precioDifValor || '',
                modelosData: this.processModelosData(formData.modelos, fileUrls),
                proyectosData: this.processProyectosData(formData.proyectos, fileUrls),
                clientesData: this.processClientesData(formData.clientes, fileUrls)
            };
        }

        return baseData;
    }

    /**
     * Procesar datos de modelos (específico para containers)
     */
    processModelosData(modelos: any[], fileUrls: FileUrls): string {
        if (!modelos || modelos.length === 0) return '';

        return JSON.stringify(modelos.map((modelo: any, index: number) => ({
            ...modelo
        })));
    }

    /**
     * Procesar datos de proyectos (específico para containers)
     */
    processProyectosData(proyectos: any[], fileUrls: FileUrls): string {
        if (!proyectos || proyectos.length === 0) return '';

        return JSON.stringify(proyectos.map((proyecto: any, index: number) => ({
            ...proyecto
        })));
    }

    /**
     * Procesar datos de clientes (específico para containers)
     */
    processClientesData(clientes: any[], fileUrls: FileUrls): string {
        if (!clientes || clientes.length === 0) return '';

        console.log('=== PROCESANDO CLIENTES ===');
        console.log('Número de clientes recibidos:', clientes.length);
        
        const processedClientes = clientes.map((cliente: any, index: number) => {
            console.log(`Cliente ${index + 1}:`, {
                nombre: cliente.nombre,
                ubicacion: cliente.ubicacion,
                testimonio: cliente.testimonio,
                image: cliente.image,
                imageType: typeof cliente.image,
                imageLength: cliente.image ? cliente.image.length : 0
            });
            
            return {
                ...cliente
            };
        });
        
        console.log('Clientes procesados:', processedClientes);
        console.log('=== FIN PROCESAMIENTO CLIENTES ===');
        
        return JSON.stringify(processedClientes);
    }

    /**
     * Convertir datos procesados a array de valores para Google Sheets
     */
    processedDataToValuesArray(processedData: FormData): string[] {
        const columns = this.sheetConfig.columns;
        return columns.map((column: string) => processedData[column] || '');
    }

    /**
     * Insertar fila en la hoja específica
     */
    async insertRow(processedData: FormData): Promise<any> {
        try {
            const values = this.processedDataToValuesArray(processedData);

            const resource = {
                values: [values]
            };

            console.log(`Insertando en hoja: ${this.sheetConfig.sheetName}`);
            console.log(`Rango: ${this.sheetConfig.range}`);
            console.log(`Columnas a insertar: ${values.length}`);

            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: this.sheetConfig.range,
                valueInputOption: 'USER_ENTERED',
                resource: resource
            });

            return response.data;
        } catch (error: any) {
            console.error('Error inserting row:', error);
            throw new Error(`Failed to insert data in ${this.sheetConfig.sheetName}: ${error.message}`);
        }
    }

    /**
     * Función principal para procesar formulario completo
     */
    async processFormSubmission(formData: FormData, files: { [key: string]: FileUpload[] }): Promise<any> {
        try {
            console.log(`Procesando formulario tipo: ${this.formType}`);
            console.log(`Hoja destino: ${this.sheetConfig.sheetName}`);

            // Extraer nombre de empresa para organización de archivos
            const companyName = formData.companyName || 'sin-nombre';

            // 1. Subir archivos organizados por cliente
            console.log(`Subiendo archivos para empresa: ${companyName}...`);
            const fileUrls = await this.uploadMultipleFiles(files, companyName);

            // 2. Procesar datos
            console.log('Procesando datos del formulario...');
            const processedData = this.processFormData(formData, fileUrls);

            // 3. Insertar en Google Sheets
            console.log(`Insertando en hoja "${this.sheetConfig.sheetName}"...`);
            const result = await this.insertRow(processedData);

            console.log('Formulario procesado exitosamente!');
            return {
                success: true,
                result,
                fileUrls,
                sheetName: this.sheetConfig.sheetName,
                formType: this.formType,
                companyName: companyName,
                message: `Formulario ${this.formType} enviado exitosamente a hoja ${this.sheetConfig.sheetName}`
            };

        } catch (error: any) {
            console.error(`Error procesando formulario ${this.formType}:`, error);
            throw error;
        }
    }
}

export default GoogleSheetsService;