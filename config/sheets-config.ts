interface SheetConfig {
    sheetName: string;
    range: string;
    columns: string[];
}

interface FileConfig {
    folderPrefix: string;
    [key: string]: any;
}

export const SHEET_CONFIGS: { [key: string]: SheetConfig } = {
    containers: {
        sheetName: 'Containers',
        range: 'Containers!A:AJ', // 36 columnas: A hasta AJ
        columns: [
            'timestamp', 'companyName', 'contactPerson', 'phone', 'email',
            'logoUrl', 'brandColors', 'address', 'businessHours', 'socialMedia',
            'whatsappNumber', 'workAreas', 'foundedYear', 'teamSize', 'specialties',
            'companyStory', 'achievements', 'workStyle', 'workTime', 'diferencialCompetitivo',
            'ventajas', 'rangoPrecios', 'proyectosRealizados', 'dominioOption', 'dominioName',
            'calculadoraOption', 'rangoMetros', 'precioCategoria', 'precioDifOpcion', 'precioDifValor',
            'frase', 'pitch', 'importante', 'modelosData', 'proyectosData', 'clientesData'
        ]
    }
};

// Función para obtener configuración por tipo de formulario
export const getSheetConfig = (formType: string): SheetConfig => {
    return SHEET_CONFIGS[formType] || SHEET_CONFIGS.containers;
};

// Configuración de archivos por tipo de formulario
export const FILE_CONFIGS: { [key: string]: FileConfig } = {
    containers: {
        folderPrefix: 'containers',
        maxModelos: 10,
        maxProyectos: 10,
        maxClientes: 10
    }
    // restaurantes: {
    //     folderPrefix: 'restaurantes',
    //     maxPlatos: 15,
    //     maxGallery: 20,
    //     maxReviews: 10
    // },
    // servicios: {
    //     folderPrefix: 'servicios',
    //     maxServices: 12,
    //     maxPortfolio: 15,
    //     maxTestimonials: 8
    // }
};