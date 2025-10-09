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
        range: 'Containers!A:AJ', // 32 columnas
        columns: [
            'timestamp', 'companyName', 'contactPerson', 'phone', 'email',
            'logo', 'brandColors', 'address', 'businessHours', 'socialMedia',
            'whatsappNumber', 'workAreas', 'foundedYear', 'teamSize', 'specialties',
            'companyStory', 'achievements', 'workStyle', 'workTime', 'diferencialCompetitivo',
            'ventajas', 'proyectosRealizados', 'dominioOption', 'dominioName', 'modelos',
            'proyectos', 'clientes', 'calculadoraOption', 'metodoCalculo', 'explicacionCalculo',
            'frase', 'importante'
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
        maxModelos: 100,
        maxProyectos: 100,
        maxClientes: 100
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