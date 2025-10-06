"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react';
import ConfirmationScreen from './components/ConfirmationScreen';

// Define interfaces for form data structure
interface Modelo {
  nombre: string;
  categoria: string;
  superficie: string;
  dormitorios: string;
  banios: string;
  preciobase: string;
  especiales: string;
  images: { url: string; publicId: string }[];
}

interface Proyecto {
  modelo: string;
  ubicacion: string;
  anio: string;
  superficie: string;
  dormitorios: string;
  banios: string;
  images: { url: string; publicId: string }[];
}

interface Cliente {
  nombre: string;
  ubicacion: string;
  testimonio: string;
  image: { url: string; publicId: string } | null;
}

interface FormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  logo: { url: string; publicId: string } | null;
  brandColors: string;
  address: string;
  businessHours: string;
  socialMedia: string;
  whatsappNumber: string;
  workAreas: string;
  foundedYear: string;
  teamSize: string;
  specialties: string[];
  companyStory: string;
  achievements: string;
  workStyle: string;
  workTime: string;
  diferencialCompetitivo: string[];
  ventajas: string;
  rangoPrecios: string;
  proyectosRealizados: string;
  dominioOption: string;
  dominioName: string;
  modelos: Modelo[];
  proyectos: Proyecto[];
  clientes: Cliente[];
  calculadoraOption: string;
  rangoMetros: string;
  precioCategoria: string;
  precioDifOpcion: string;
  precioDifValor: string;
  frase: string;
  importante: string;
  pitch: string;
  condicionesEspeciales?: string;
  preguntasFrecuentes?: string;
  formType: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Límites y umbrales eliminados

const ContainerCompanyForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 9;



  const uploadToCloudinary = async (file: File, folder: string): Promise<{ url: string; publicId: string }> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', folder);
    uploadFormData.append('companyName', formData.companyName || 'unknown');

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error subiendo imagen');
    }

    const result = await response.json();
    return { url: result.url, publicId: result.publicId };
  };

  // Subida con XHR para poder informar progreso
  const xhrUploadImage = (file: File, folder: string, onProgress: (loaded: number, total: number) => void): Promise<{ url: string; publicId: string }> => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      form.append('companyName', formData.companyName || 'unknown');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-image');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve({ url: result.url, publicId: result.publicId });
          } catch (e) {
            reject(new Error('Respuesta inválida del servidor'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Error subiendo imagen'));
          } catch {
            reject(new Error('Error subiendo imagen'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Error de red durante la subida'));
      xhr.send(form);
    });
  };







  // Función mejorada para procesar imágenes con validación de límite
  const uploadImageToCloudinary = async (file: File, folder: string): Promise<{ url: string; publicId: string }> => {
    // Validar tamaño máximo individual (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.');
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP).');
    }

    try {
      const image = await uploadToCloudinary(file, folder);
      return image;
    } catch (error) {
      throw error;
    }
  };

  

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    companyName: string;
    sheetName: string;
    filesUploaded: number;
  } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<{ inProgress: boolean; percent: number }>({ inProgress: false, percent: 0 });
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    logo: null,
    brandColors: '',
    address: '',
    businessHours: '',
    socialMedia: '',
    whatsappNumber: '',
    workAreas: '',
    foundedYear: '',
    teamSize: '',
    specialties: [],
    companyStory: '',
    achievements: '',
    workStyle: '',
    workTime: '',
    diferencialCompetitivo: [],
    ventajas: '',
    rangoPrecios: '',
    proyectosRealizados: '',
    dominioOption: '',
    dominioName: '',
    calculadoraOption: '',
    rangoMetros: '',
    precioCategoria: '',
    precioDifOpcion: '',
    precioDifValor: '',
    frase: '',
    importante: '',
    pitch: '',
    formType: 'container',
    // Nuevos campos para tablas
    modelos: [{ nombre: '', categoria: '', superficie: '', dormitorios: '', banios: '', preciobase: '', especiales: '', images: [] }],
    proyectos: [{ modelo: '', ubicacion: '', anio: '', superficie: '', dormitorios: '', banios: '', images: [] as { url: string; publicId: string }[] }],
    clientes: [{ nombre: '', ubicacion: '', testimonio: '', image: null }]
  });

  // Función para calcular tamaño total de imágenes eliminada

  // Función para actualizar el tracking de tamaño eliminada

  const steps = [
    { title: "Datos de la empresa" },
    { title: "Ubicación y contacto" },
    { title: "Historia y equipo" },
    { title: "Forma de trabajo" },
    { title: "Modelos" },
    { title: "Proyectos" },
    { title: "Clientes" },
    { title: "Calculadora de precios" },
    { title: "Mensajes y comunicación de la empresa" }
  ];

  // Estilos
  const inputStyle = {
    backgroundColor: "transparent",
    border: "1px solid #817D79",
    color: "#F0EFED",
    fontSize: "16px",
  };
  const labelStyle = { color: "#F0EFED" };
  const descStyle = { color: "#817D79" };
  const asteriskStyle = { color: "#817D79" };



  // Funciones de manejo de formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación automática para campos de selección (radio buttons)
    if (e.target.type === 'radio') {
      handleFieldValidation(name, value);
    }
  };

  const handleCheckboxChange = (name: 'specialties' | 'diferencialCompetitivo', value: string) => {
    const newValue = formData[name].includes(value)
      ? formData[name].filter((item) => item !== value)
      : [...formData[name], value];

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validación automática para checkboxes
    handleFieldValidation(name, newValue);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Iniciar progreso
        setUploadingLogo({ inProgress: true, percent: 0 });
        const image = await xhrUploadImage(file, 'logos', (loaded, total) => {
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          setUploadingLogo(prev => ({ ...prev, percent }));
        });
        // Finalizar progreso
        setUploadingLogo({ inProgress: false, percent: 100 });

        setFormData((prev) => ({ ...prev, logo: image }));

        // Marcar el campo como tocado y luego validar
        setTouchedFields(prev => ({
          ...prev,
          logo: true
        }));

        // Limpiar el error del logo inmediatamente
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.logo;
          return newErrors;
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al procesar el archivo');
        setUploadingLogo({ inProgress: false, percent: 0 });
        e.target.value = '';
        return;
      }
    } else {
      setFormData((prev) => ({ ...prev, logo: null }));
      handleFieldValidation('logo', null);
    }
  };

  const handleRemoveLogoImage = async () => {
    if (!formData.logo) return;
    try {
      const fd = new FormData();
      fd.append('publicId', formData.logo.publicId);
      await fetch('/api/upload-image', { method: 'DELETE', body: fd });
    } catch {
      // Silently ignore deletion errors, still clear from form
    }
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  // Funciones para tablas dinámicas
  const addModeloRow = () => {
    setFormData((prev) => ({
      ...prev,
      modelos: [...prev.modelos, { nombre: "", categoria: "", superficie: "", dormitorios: "", banios: "", preciobase: "", especiales: "", images: [] }],
    }));
  };

  const removeModeloRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modelos: prev.modelos.filter((_, i) => i !== index),
    }));
  };

  const updateModelo = (index: number, field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      modelos: prev.modelos.map((modelo, i) =>
        i === index ? { ...modelo, [field]: value } : modelo
      ),
    }));
  };

  const handleModeloImagesChange = async (modeloIndex: number, files: FileList) => {
    const currentImages = formData.modelos[modeloIndex].images || [];
    const remaining = 5 - currentImages.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    const uploaded = [];
    for (const file of filesToUpload) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'modelos');
      uploadFormData.append('companyName', formData.companyName || 'unknown');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error subiendo imagen');
      }

      const { url, publicId } = await response.json();
      uploaded.push({ url, publicId });
    }

    const updatedModelos = [...formData.modelos];
    updatedModelos[modeloIndex].images = [...currentImages, ...uploaded];
    setFormData((prev) => ({ ...prev, modelos: updatedModelos }));
  };

  const handleRemoveModeloImage = async (modeloIndex: number, imageIndex: number) => {
    const img = formData.modelos[modeloIndex].images[imageIndex];
    const fd = new FormData();
    fd.append('publicId', img.publicId);
    await fetch('/api/upload-image', { method: 'DELETE', body: fd });
    const updatedModelos = [...formData.modelos];
    updatedModelos[modeloIndex].images = updatedModelos[modeloIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setFormData((prev) => ({ ...prev, modelos: updatedModelos }));
  };

  const addProyectoRow = () => {
    setFormData((prev) => ({
      ...prev,
      proyectos: [...prev.proyectos, { modelo: "", ubicacion: "", anio: "", superficie: "", dormitorios: "", banios: "", images: [] }],
    }));
  };

  const removeProyectoRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.filter((_, i) => i !== index),
    }));
  };

  const updateProyecto = (index: number, field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
  };

  const handleProyectoImagesChange = async (proyectoIndex: number, files: FileList) => {
    const currentImages = formData.proyectos[proyectoIndex].images || [];
    const remaining = 5 - currentImages.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    const uploaded = [];
    for (const file of filesToUpload) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'proyectos');
      uploadFormData.append('companyName', formData.companyName || 'unknown');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error subiendo imagen');
      }

      const { url, publicId } = await response.json();
      uploaded.push({ url, publicId });
    }

    const updatedProyectos = [...formData.proyectos];
    updatedProyectos[proyectoIndex].images = [...currentImages, ...uploaded];
    setFormData((prev) => ({ ...prev, proyectos: updatedProyectos }));
  };

  const handleRemoveProyectoImage = async (proyectoIndex: number, imageIndex: number) => {
    const img = formData.proyectos[proyectoIndex].images[imageIndex];
    const fd = new FormData();
    fd.append('publicId', img.publicId);
    await fetch('/api/upload-image', { method: 'DELETE', body: fd });
    const updatedProyectos = [...formData.proyectos];
    updatedProyectos[proyectoIndex].images = updatedProyectos[proyectoIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setFormData((prev) => ({ ...prev, proyectos: updatedProyectos }));
  };

  const addClienteRow = () => {
    setFormData((prev) => ({
      ...prev,
      clientes: [...prev.clientes, { nombre: "", ubicacion: "", testimonio: "", image: null }],
    }));
  };

  const removeClienteRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clientes: prev.clientes.filter((_, i) => i !== index),
    }));
  };

  const updateCliente = (index: number, field: string, value: string | { url: string; publicId: string } | null) => {
    setFormData((prev) => ({
      ...prev,
      clientes: prev.clientes.map((cliente, i) =>
        i === index ? { ...cliente, [field]: value } : cliente
      ),
    }));
  };

  const handleClienteImageChange = async (index: number, file: File | null) => {
    if (file) {
      try {
        const image = await uploadImageToCloudinary(file, 'clientes');
        updateCliente(index, "image", image);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al procesar el archivo');
      }
    } else {
      updateCliente(index, "image", null);
    }
  };

  const handleRemoveClienteImage = async (clienteIndex: number) => {
    const updatedClientes = [...formData.clientes];
    const img = updatedClientes[clienteIndex].image;
    if (img) {
      try {
        const fd = new FormData();
        fd.append('publicId', img.publicId);
        await fetch('/api/upload-image', { method: 'DELETE', body: fd });
      } catch {
        // ignore
      }
    }
    updatedClientes[clienteIndex].image = null;
    setFormData((prev) => ({ ...prev, clientes: updatedClientes }));
  };

  // Funciones de validación por página
  const validateStep = (step: number) => {
    const errors: ValidationErrors = {};

    switch (step) {
      case 0: // Datos de la empresa
        if (!formData.companyName.trim()) errors.companyName = 'Llena este campo';
        if (!formData.contactPerson.trim()) errors.contactPerson = 'Llena este campo';
        if (!formData.phone.trim()) errors.phone = 'Llena este campo';
        if (!formData.email.trim()) errors.email = 'Llena este campo';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'El email no es válido';
        if (!formData.logo) errors.logo = 'Llena este campo';
        if (!formData.brandColors.trim()) errors.brandColors = 'Llena este campo';
        break;

      case 1: // Ubicación y contacto
        if (!formData.address.trim()) errors.address = 'Llena este campo';
        if (!formData.businessHours.trim()) errors.businessHours = 'Llena este campo';
        if (!formData.socialMedia.trim()) errors.socialMedia = 'Llena este campo';
        if (!formData.whatsappNumber.trim()) errors.whatsappNumber = 'Llena este campo';
        if (!formData.workAreas.trim()) errors.workAreas = 'Llena este campo';
        break;

      case 2: // Historia y equipo
        if (!formData.foundedYear.trim()) errors.foundedYear = 'Llena este campo';
        if (!formData.teamSize.trim()) errors.teamSize = 'Llena este campo';
        if (!formData.specialties || formData.specialties.length === 0) errors.specialties = 'Selecciona al menos una opción';
        if (!formData.companyStory.trim()) errors.companyStory = 'Llena este campo';
        if (!formData.achievements.trim()) errors.achievements = 'Llena este campo';
        break;

      case 3: // Forma de trabajo
        if (formData.specialties.length === 0) errors.specialties = 'Selecciona al menos una opción';
        if (!formData.workStyle.trim()) errors.workStyle = 'Llena este campo';
        if (!formData.workTime.trim()) errors.workTime = 'Llena este campo';
        if (formData.diferencialCompetitivo.length === 0) errors.diferencialCompetitivo = 'Selecciona al menos una opción';
        if (!formData.ventajas.trim()) errors.ventajas = 'Llena este campo';
        if (!formData.rangoPrecios.trim()) errors.rangoPrecios = 'Llena este campo';
        if (!formData.proyectosRealizados.trim()) errors.proyectosRealizados = 'Llena este campo';
        if (!formData.dominioOption.trim()) errors.dominioOption = 'Selecciona una opción';
        break;

      case 4: // Modelos (opcional)
        // Solo validar si hay modelos agregados
        if (formData.modelos.length > 0 && formData.modelos[0].nombre.trim()) {
          formData.modelos.forEach((modelo, index) => {
            if (!modelo.nombre.trim()) errors[`modelo_${index}_nombre`] = 'Llena este campo';
            if (!modelo.superficie.trim()) errors[`modelo_${index}_superficie`] = 'Llena este campo';
            if (!modelo.dormitorios.trim()) errors[`modelo_${index}_dormitorios`] = 'Llena este campo';
            if (!modelo.banios.trim()) errors[`modelo_${index}_banios`] = 'Llena este campo';
          });
        }
        break;

      case 5: // Proyectos (opcional)
        // Solo validar si hay proyectos agregados
        if (formData.proyectos.length > 0) {
          formData.proyectos.forEach((proyecto, index) => {
            // Si cualquier campo del proyecto está lleno, validar todos los campos obligatorios
            const hasAnyField = proyecto.modelo.trim() || proyecto.ubicacion.trim() ||
              proyecto.superficie.trim() || proyecto.dormitorios.trim() ||
              proyecto.banios.trim() || proyecto.anio.trim();

            if (hasAnyField) {
              if (!proyecto.modelo.trim()) errors[`proyecto_${index}_modelo`] = 'Llena este campo';
              if (!proyecto.ubicacion.trim()) errors[`proyecto_${index}_ubicacion`] = 'Llena este campo';
              if (!proyecto.superficie.trim()) errors[`proyecto_${index}_superficie`] = 'Llena este campo';
              if (!proyecto.dormitorios.trim()) errors[`proyecto_${index}_dormitorios`] = 'Llena este campo';
              if (!proyecto.banios.trim()) errors[`proyecto_${index}_banios`] = 'Llena este campo';
            }
          });
        }
        break;

      case 6: // Clientes (opcional)
        // Solo validar si hay clientes agregados
        if (formData.clientes.length > 0 && formData.clientes[0].nombre.trim()) {
          formData.clientes.forEach((cliente, index) => {
            if (!cliente.nombre.trim()) errors[`cliente_${index}_nombre`] = 'Llena este campo';
            if (!cliente.ubicacion.trim()) errors[`cliente_${index}_ubicacion`] = 'Llena este campo';
            if (!cliente.testimonio.trim()) errors[`cliente_${index}_testimonio`] = 'Llena este campo';
          });
        }
        break;

      case 7: // Calculadora de precios
        if (!formData.dominioOption.trim()) errors.dominioOption = 'Selecciona una opción';
        if (formData.dominioOption === 'si' && !formData.dominioName.trim()) {
          errors.dominioName = 'Llena este campo';
        }
        if (!formData.calculadoraOption.trim()) errors.calculadoraOption = 'Selecciona una opción';
        if (!formData.precioDifOpcion.trim()) errors.precioDifOpcion = 'Selecciona una opción';
        // Las preguntas 29 y 30 (rangoMetros y precioCategoria) son opcionales
        // Solo se validan si el usuario eligió 'si' en calculadora Y decidió llenar los campos
        break;

      case 8: // Mensajes y comunicación
        if (!formData.frase.trim()) errors.frase = 'Llena este campo';
        if (!formData.importante.trim()) errors.importante = 'Llena este campo';
        if (!formData.pitch.trim()) errors.pitch = 'Llena este campo';
        break;
    }

    return errors;
  };

  // Función de validación individual para campos específicos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (fieldName: string, value: any) => {
    let error = '';

    // Validaciones específicas por campo
    switch (fieldName) {
      // Paso 0 - Datos de la empresa
      case 'companyName':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'contactPerson':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'phone':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'email':
        if (!value || !value.trim()) error = 'Llena este campo';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'El email no es válido';
        break;
      case 'logo':
        if (!value) error = 'Llena este campo';
        break;
      case 'brandColors':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 1 - Ubicación y contacto
      case 'address':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'businessHours':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'socialMedia':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'whatsappNumber':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'workAreas':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 2 - Historia de la empresa
      case 'foundedYear':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'teamSize':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'specialties':
        if (!value || value.length === 0) error = 'Selecciona al menos una opción';
        break;
      case 'companyStory':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'achievements':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 3 - Forma de trabajo
      case 'workStyle':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'workTime':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'diferencialCompetitivo':
        if (!value || value.length === 0) error = 'Selecciona al menos una opción';
        break;
      case 'ventajas':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'rangoPrecios':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyectosRealizados':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 4 - Modelos (campos dinámicos)
      case 'modelo_nombre':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'modelo_categoria':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'modelo_superficie':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 5 - Proyectos (campos dinámicos)
      case 'proyecto_modelo':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_ubicacion':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_anio':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 6 - Clientes (campos dinámicos)
      case 'cliente_nombre':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'cliente_ubicacion':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'cliente_testimonio':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;

      // Paso 7 - Calculadora de precios
      case 'dominioOption':
        if (!value || !value.trim()) error = 'Selecciona una opción';
        break;
      case 'dominioName':
        if (formData.dominioOption === 'si' && (!value || !value.trim())) {
          error = 'Llena este campo';
        }
        break;
      case 'calculadoraOption':
        if (!value || !value.trim()) error = 'Selecciona una opción';
        break;
      case 'rangoMetros':
        if (formData.calculadoraOption === 'si' && (!value || !value.trim())) {
          error = 'Llena este campo';
        }
        break;
      case 'precioCategoria':
        if (formData.calculadoraOption === 'si' && (!value || !value.trim())) {
          error = 'Llena este campo';
        }
        break;

      // Paso 8 - Mensajes y comunicación
      case 'frase':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'importante':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'pitch':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
    }

    return error;
  };

  // Función para validar un campo y actualizar errores en tiempo real
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldValidation = (fieldName: string, value: any, index?: number) => {
    const fieldKey = index !== undefined ? `${fieldName}_${index}` : fieldName;

    // Solo validar si el campo ha sido tocado por el usuario
    if (!touchedFields[fieldKey]) {
      return;
    }

    const error = validateField(fieldName, value);

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldKey] = error;
      } else {
        delete newErrors[fieldKey];
      }
      return newErrors;
    });
  };
  // Función para obtener los campos de un paso específico
  const getFieldsForStep = (step: number): string[] => {
    const fields: string[] = [];

    switch (step) {
      case 0:
        fields.push('companyName', 'contactPerson', 'phone', 'email', 'logo', 'brandColors');
        break;
      case 1:
        fields.push('address', 'businessHours', 'socialMedia', 'whatsappNumber', 'workAreas');
        break;
      case 2:
        fields.push('foundedYear', 'teamSize', 'specialties', 'companyStory', 'achievements');
        break;
      case 3:
        fields.push('workStyle', 'workTime', 'diferencialCompetitivo', 'ventajas', 'rangoPrecios', 'proyectosRealizados', 'dominioOption');
        break;
      case 4: // Modelos
        fields.push('modelos');
        // Agregar campos dinámicos de modelos
        formData.modelos.forEach((_, index) => {
          fields.push(`modelo_${index}_nombre`, `modelo_${index}_superficie`, `modelo_${index}_dormitorios`, `modelo_${index}_banios`);
        });
        break;
      case 5: // Proyectos
        fields.push('proyectos');
        // Agregar campos dinámicos de proyectos
        formData.proyectos.forEach((_, index) => {
          fields.push(`proyecto_${index}_modelo`, `proyecto_${index}_ubicacion`, `proyecto_${index}_superficie`, `proyecto_${index}_dormitorios`, `proyecto_${index}_banios`);
        });
        break;
      case 6: // Clientes
        fields.push('clientes');
        // Agregar campos dinámicos de clientes
        formData.clientes.forEach((_, index) => {
          fields.push(`cliente_${index}_nombre`, `cliente_${index}_ubicacion`, `cliente_${index}_testimonio`);
        });
        break;
      case 7:
        fields.push('dominioOption', 'dominioName', 'calculadoraOption', 'precioDifOpcion');
        break;
      case 8:
        fields.push('frase', 'importante', 'pitch');
        break;
      default:
        break;
    }

    return fields;
  };

  // Función para marcar un campo como tocado
  const markFieldAsTouched = (fieldName: string, index?: number) => {
    const fieldKey = index !== undefined ? `${fieldName}_${index}` : fieldName;
    setTouchedFields(prev => ({
      ...prev,
      [fieldKey]: true
    }));
  };

  const nextStep = () => {
    // Validar TODOS los campos obligatorios del paso actual antes de avanzar
    const errors = validateStep(currentStep);
    setValidationErrors(errors);

    // Marcar todos los campos del paso actual como tocados para mostrar errores
    const currentStepFields = getFieldsForStep(currentStep);
    const newTouchedFields = { ...touchedFields };
    currentStepFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    if (Object.keys(errors).length === 0) {
      // No hay errores, puede avanzar
      if (currentStep < totalSteps - 1) {
        // Limpiar errores del paso siguiente para evitar validación automática
        const nextStepFields = getFieldsForStep(currentStep + 1);
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          nextStepFields.forEach(field => {
            delete newErrors[field];
          });
          return newErrors;
        });

        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 10);
      }
    } else {
      // Hay errores, hacer scroll al primer error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.error-message');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({}); // Limpiar errores al retroceder
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos del paso actual como tocados antes de validar
    const stepFields = getFieldsForStep(currentStep);
    const newTouchedFields = { ...touchedFields };
    stepFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    // Validar el paso actual antes de enviar
    const errors = validateStep(currentStep);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Hay errores, hacer scroll al primer error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.error-message');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    const submitButton = e.currentTarget.querySelector<HTMLButtonElement>('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      console.log('Enviando formulario containers a Google Sheets...');

      const formDataToSend = new FormData();

      // Agregar tipo de formulario
      formDataToSend.append('formType', 'containers');

      // Campos básicos (mantén tu lógica actual de addField
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('contactPerson', formData.contactPerson);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('brandColors', formData.brandColors || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('businessHours', formData.businessHours || '');
      formDataToSend.append('socialMedia', formData.socialMedia || '');
      formDataToSend.append('whatsappNumber', formData.whatsappNumber);
      formDataToSend.append('workAreas', formData.workAreas || '');
      formDataToSend.append('foundedYear', formData.foundedYear);
      formDataToSend.append('teamSize', formData.teamSize);
      formDataToSend.append('companyStory', formData.companyStory || '');
      formDataToSend.append('achievements', formData.achievements || '');
      formDataToSend.append('workStyle', formData.workStyle);
      formDataToSend.append('workTime', formData.workTime || '');
      formDataToSend.append('ventajas', formData.ventajas || '');
      formDataToSend.append('rangoPrecios', formData.rangoPrecios || '');
      formDataToSend.append('proyectosRealizados', formData.proyectosRealizados);
      formDataToSend.append('dominioOption', formData.dominioOption);
      formDataToSend.append('dominioName', formData.dominioName || '');
      formDataToSend.append('calculadoraOption', formData.calculadoraOption);
      formDataToSend.append('rangoMetros', formData.rangoMetros || '');
      formDataToSend.append('precioCategoria', formData.precioCategoria || '');
      formDataToSend.append('precioDifOpcion', formData.precioDifOpcion);
      formDataToSend.append('precioDifValor', formData.precioDifValor || '');
      formDataToSend.append('frase', formData.frase || '');
      formDataToSend.append('pitch', formData.pitch || '');
      formDataToSend.append('importante', formData.importante || '');

      // Logo como URL (no como archivo)
      if (formData.logo) {
        const logoUrl = typeof formData.logo === 'string' ? formData.logo : formData.logo.url;
        formDataToSend.append('logoUrl', logoUrl);
      }

      // Convertir modelos, proyectos y clientes a formato con URLs
      const modelosWithUrls = formData.modelos.map(modelo => ({
        ...modelo,
        images: modelo.images.map(img => img.url),
      }));

      const proyectosWithUrls = formData.proyectos.map(proyecto => ({
        ...proyecto,
        images: proyecto.images.map(img => img.url),
      }));

      const clientesWithUrls = formData.clientes.map(cliente => ({
        ...cliente,
        image: cliente.image ? (typeof cliente.image === 'string' ? cliente.image : cliente.image.url) : null,
      }));

      // Arrays como JSON (ahora con URLs)
      formDataToSend.append('specialties', JSON.stringify(formData.specialties));
      formDataToSend.append('diferencialCompetitivo', JSON.stringify(formData.diferencialCompetitivo));
      formDataToSend.append('modelos', JSON.stringify(modelosWithUrls));
      formDataToSend.append('proyectos', JSON.stringify(proyectosWithUrls));
      formDataToSend.append('clientes', JSON.stringify(clientesWithUrls));

      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();

      // Mostrar pantalla de confirmación
      setConfirmationData({
        companyName: formData.companyName,
        sheetName: result.data.sheetName,
        filesUploaded: result.data.filesUploaded
      });
      setShowConfirmation(true);

    } catch (error) {
      console.error('Error:', error);
      alert("Error al enviar el formulario: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      if (submitButton && originalText) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  };

  // Funciones para manejar la pantalla de confirmación



  // Componente para mostrar errores
  const ErrorMessage = ({ error }: { error: string | null | undefined }) => {
    if (!error) return null;
    return (
      <div className="error-message text-red-400 text-xs mt-1 font-medium">
        {error}
      </div>
    );
  };

  // Pasos
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                1. Nombre de la empresa<span style={asteriskStyle}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('companyName', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.companyName} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                2. Persona de contacto principal<span style={asteriskStyle}>*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('contactPerson', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.contactPerson} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                3. Teléfono de contacto<span style={asteriskStyle}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('phone', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.phone} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                4. Email de contacto<span style={asteriskStyle}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('email', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.email} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                5. Suba el logo de la empresa<span style={asteriskStyle}>*</span>
              </label>

              {/* Preview si hay logo */}
              {formData.logo && (
                <div className="mb-3">
                  <div className="relative group inline-block">
                    <Image
                      src={formData.logo.url}
                      alt="Logo"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-contain bg-white/5 rounded border-2"
                      style={{ borderColor: '#817D79' }}
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogoImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de subida */}
              {!formData.logo && (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${validationErrors.logo ? 'border-red-400' : ''}`}
                  style={{ borderColor: validationErrors.logo ? '#f87171' : '#817D79' }}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-upload"
                    required
                  />
                  <label htmlFor="logo-upload" className={`cursor-pointer group ${uploadingLogo.inProgress ? 'opacity-60 pointer-events-none' : ''}`}>
                    <Upload
                      size={24}
                      className="mx-auto mb-2 text-[#817D79] group-hover:text-white transition-colors duration-200"
                    />
                    <div className="text-sm text-[#817D79] group-hover:text-white transition-colors duration-200">
                      Subir logo
                    </div>
                  </label>

                  {uploadingLogo.inProgress && (
                    <div className="mt-4 text-left">
                      <div className="text-xs text-[#817D79]">Subiendo logo… {uploadingLogo.percent}%</div>
                      <div className="h-1.5 rounded bg-[#2a2a2a] mt-2">
                        <div className="h-1.5 rounded bg-[#817D79]" style={{ width: `${uploadingLogo.percent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ErrorMessage error={validationErrors.logo} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                6. ¿Cuáles son los colores principales de su marca?<span style={asteriskStyle}>*</span>
              </label>
              <textarea
                name="brandColors"
                value={formData.brandColors}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('brandColors', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.brandColors ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.brandColors} />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                7. Dirección de la empresa<span style={asteriskStyle}>*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('address', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.address ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.address} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                8. ¿Cuáles son sus horarios de atención?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: Lunes a viernes 9:00 a 18:00, Sábados 9:00 a 12:00</p>
              <textarea
                name="businessHours"
                value={formData.businessHours}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('businessHours', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.businessHours ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.businessHours} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                9. ¿Qué redes sociales tienen?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Compartan los links o nombres de sus perfiles de redes sociales (Facebook, Instagram, etc.)</p>
              <textarea
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('socialMedia', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.socialMedia ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.socialMedia} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                10. Número de WhatsApp para contacto<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Este será el número principal que aparecerá en la web para que los clientes puedan contactarlos</p>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('whatsappNumber', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.whatsappNumber ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.whatsappNumber} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                11. ¿En qué ciudades o zonas de Uruguay trabajan?<span style={asteriskStyle}>*</span>
              </label>
              <textarea
                name="workAreas"
                value={formData.workAreas}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('workAreas', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.workAreas ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.workAreas} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                12. ¿En qué año comenzó la empresa?<span style={asteriskStyle}>*</span>
              </label>
              <input
                type="text"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('foundedYear', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.foundedYear ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.foundedYear} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                13. ¿Cuántas personas conforman el equipo actual?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { teamSize: "1-2", label: "1-2 personas" },
                  { teamSize: "3-5", label: "3-5 personas" },
                  { teamSize: "6-10", label: "6-10 personas" },
                  { teamSize: "+10", label: "Más de 10 personas" }
                ].map((option) => (
                  <label key={option.teamSize} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="teamSize"
                      value={option.teamSize}
                      checked={formData.teamSize === option.teamSize}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleFieldValidation('calculadoraOption', e.target.value);
                      }}
                      className={`w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300 ${validationErrors.teamSize ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.teamSize} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                14. ¿Cuál es su especialidad principal?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Puedes seleccionar múltiples opciones
              </p>
              <div className="space-y-3">
                {[
                  { specialties: "arquitectura-diseño", label: "Arquitectura y diseño" },
                  { specialties: "construccion-montaje", label: "Construcción y montaje" },
                  { specialties: "diseño-interiores", label: "Diseño de interiores" },
                  { specialties: "gestion-proyectos", label: "Gestión de proyectos" },
                  { specialties: "asesoramiento-tecnico", label: "Asesoramiento técnico" },
                  { specialties: "ingenieria-estructural", label: "Ingeniería estructural" },
                  { specialties: "decoracion-ambientacion", label: "Decoración y ambientación" }
                ].map((option) => (
                  <label key={option.specialties} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="specialties"
                      value={option.specialties}
                      checked={formData.specialties.includes(option.specialties)}
                      onChange={() => handleCheckboxChange("specialties", option.specialties)}
                      className={`w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300 rounded ${validationErrors.specialties ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.specialties} />

              <input
                type="hidden"
                name="specialties-validation"
                value={formData.specialties.length > 0 ? "valid" : ""}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                15. Cuéntenos sobre su empresa: historia, motivación y valores<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>¿Cómo comenzaron? ¿Por qué eligieron containers? ¿Qué los motiva?
                ¿Cuáles son sus valores? ¿Experiencias importantes que los marcaron? ¿Cuál es su misión como empresa?</p>
              <textarea
                name="companyStory"
                value={formData.companyStory}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('companyStory', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.companyStory ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.companyStory} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                16. ¿Tienen algún logro o hito importante que les gustaría destacar?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Premios, certificaciones, proyectos especiales, años en el mercado, etc.</p>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('achievements', e.target.value)}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.achievements ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.achievements} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                17. ¿Cómo trabajan principalmente?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { workStyle: "precios-establecidos", label: "Tenemos diseños con precios establecidos" },
                  { workStyle: "especifico-cliente", label: "Cada casa es diseñada específicamente para el cliente" },
                  { workStyle: "ambos", label: "Ambos (tenemos diseños base que se pueden personalizar)" }
                ].map((option) => (
                  <label key={option.workStyle} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="workStyle"
                      value={option.workStyle}
                      checked={formData.workStyle === option.workStyle}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleFieldValidation('calculadoraOption', e.target.value);
                      }}
                      className={`w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300 ${validationErrors.workStyle ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: validationErrors.workStyle ? "#f87171" : "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.workStyle} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                18. ¿En cuántos días entregan aproximadamente un proyecto?<span style={asteriskStyle}>*</span>
              </label>
              <textarea
                name="workTime"
                value={formData.workTime}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.workTime ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.workTime} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                19. ¿Cuál consideran que es su principal diferencial competitivo?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Puedes seleccionar múltiples opciones
              </p>
              <div className="space-y-3">
                {[
                  { diferencialCompetitivo: "precio-competitivo", label: "Precio competitivo" },
                  { diferencialCompetitivo: "rapidez-entrega", label: "Rapidez en entrega" },
                  { diferencialCompetitivo: "calidad-materiales", label: "Calidad de materiales" },
                  { diferencialCompetitivo: "disenio-innovador", label: "Diseño innovador" },
                  { diferencialCompetitivo: "servicio-personalizado", label: "Servicio personalizado" },
                  { diferencialCompetitivo: "experiencia-trayectoria", label: "Experiencia y trayectoria" },
                  { diferencialCompetitivo: "garantia-extendida", label: "Garantías extendidas" },
                  { diferencialCompetitivo: "atencion-postventa", label: "Atención post-venta" }
                ].map((option) => (
                  <label key={option.diferencialCompetitivo} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="diferencialCompetitivo"
                      value={option.diferencialCompetitivo}
                      checked={formData.diferencialCompetitivo.includes(option.diferencialCompetitivo)}
                      onChange={() => handleCheckboxChange("diferencialCompetitivo", option.diferencialCompetitivo)}
                      className={`w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300 rounded ${validationErrors.diferencialCompetitivo ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: validationErrors.diferencialCompetitivo ? "#f87171" : "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.diferencialCompetitivo} />

              <input
                type="hidden"
                name="diferenciales-validation"
                value={formData.diferencialCompetitivo.length > 0 ? "valid" : ""}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                20. ¿Qué ventajas consideran que tienen las casas container sobre la construcción tradicional?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Cuéntenos qué beneficios ven ustedes en este tipo de construcción desde su experiencia</p>
              <textarea
                name="ventajas"
                value={formData.ventajas}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.ventajas ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.ventajas} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                21. Rango de precios por m² aproximado<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: USD 800-1200 por m²</p>
              <textarea
                name="rangoPrecios"
                value={formData.rangoPrecios}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors.rangoPrecios ? 'border-red-400' : ''}`}
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.rangoPrecios} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                22. ¿Cuántos proyectos han realizado aproximadamente?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { proyectosRealizados: "1-10", label: "1-10 proyectos" },
                  { proyectosRealizados: "11-25", label: "11-25 proyectos" },
                  { proyectosRealizados: "26-50", label: "26-50 proyectos" },
                  { proyectosRealizados: "51-100", label: "51-100 proyectos" },
                  { proyectosRealizados: "+100", label: "Más de 100 proyectos" }
                ].map((option) => (
                  <label key={option.proyectosRealizados} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="proyectosRealizados"
                      value={option.proyectosRealizados}
                      checked={formData.proyectosRealizados === option.proyectosRealizados}
                      onChange={handleInputChange}
                      className={`w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300 ${validationErrors.proyectosRealizados ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: validationErrors.proyectosRealizados ? "#f87171" : "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.proyectosRealizados} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                23. ¿Ya tienen dominio web?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { dominioOption: "tengo", label: "Tengo dominio (especificar en la siguiente pregunta)" },
                  { dominioOption: "no-tengo", label: "No tengo dominio y necesito ayuda para elegir y comprarlo" },
                  { dominioOption: "idea", label: "Tengo una idea pero no lo compré (especificar en la siguiente pregunta)" }
                ].map((option) => (
                  <label key={option.dominioOption} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="dominioOption"
                      value={option.dominioOption}
                      checked={formData.dominioOption === option.dominioOption}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300"
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.dominioOption} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                24. Si respondió &quot;Sí&quot; o &quot;Tengo una idea&quot;, especifique el dominio
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: www.miempresacontainers.com.uy</p>
              <textarea
                name="dominioName"
                value={formData.dominioName}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                25. Si tiene modelos predefinidos
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Detalle cada modelo con su descripción, precio aproximado e imagen representativa
              </p>

              <div className="space-y-4">
                {formData.modelos.map((modelo, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #817D79', backgroundColor: '#1a1a1a' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium" style={labelStyle}>Modelo {index + 1}</h4>
                      {formData.modelos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModeloRow(index)}
                          className="p-1 rounded hover:bg-red-600/20"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Nombre del modelo</label>
                        <input
                          type="text"
                          value={modelo.nombre}
                          onChange={(e) => updateModelo(index, 'nombre', e.target.value)}
                          placeholder="Ejemplo: Compacta"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`modelo_${index}_nombre`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_nombre`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Categoría</label>
                        <input
                          type="text"
                          value={modelo.categoria}
                          onChange={(e) => updateModelo(index, 'categoria', e.target.value)}
                          placeholder="Ejemplo: Básico"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`modelo_${index}_categoria`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_categoria`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Superficie (m²)</label>
                        <input
                          type="text"
                          value={modelo.superficie}
                          onChange={(e) => updateModelo(index, 'superficie', e.target.value)}
                          placeholder="Ejemplo: 50 (m²)"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`modelo_${index}_superficie`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_superficie`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Dormitorios</label>
                        <input
                          type="text"
                          value={modelo.dormitorios}
                          onChange={(e) => updateModelo(index, 'dormitorios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`modelo_${index}_dormitorios`, e.target.value)}
                          placeholder="Ejemplo: 2"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`modelo_${index}_dormitorios`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_dormitorios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Baños</label>
                        <input
                          type="text"
                          value={modelo.banios}
                          onChange={(e) => updateModelo(index, 'banios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`modelo_${index}_banios`, e.target.value)}
                          placeholder="Ejemplo: 1"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`modelo_${index}_banios`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_banios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Precio base (m²)</label>
                        <input
                          type="text"
                          value={modelo.preciobase}
                          onChange={(e) => updateModelo(index, 'preciobase', e.target.value)}
                          placeholder="Ejemplo: USD 750 (m²)"
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={inputStyle}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Características especiales</label>
                        <textarea
                          value={modelo.especiales}
                          onChange={(e) => updateModelo(index, 'especiales', e.target.value)}
                          placeholder="Ejemplo: Terraza, aislación"
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={inputStyle}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold" style={labelStyle}>
                            Imágenes del modelo
                          </label>
                          <span className="text-sm text-[#817D79]">
                            {modelo.images?.length || 0}/5
                          </span>
                        </div>

                        <p className="text-sm text-[#817D79] mb-3">
                          Si es posible, subí 4 fotos
                        </p>

                        {/* Grid de imágenes subidas */}
                        {modelo.images && modelo.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-3 mb-3">
                            {modelo.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="relative group h-24">
                                <Image
                                  src={img.url}
                                  alt={`Imagen ${imgIndex + 1}`}
                                  fill
                                  sizes="(min-width: 768px) 25vw, 50vw"
                                  className="object-cover rounded"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveModeloImage(index, imgIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón de subida */}
                        {(!modelo.images || modelo.images.length < 5) && (
                          <div className="border-2 border-dashed rounded p-6 text-center" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              multiple
                              onChange={async (e) => e.target.files && await handleModeloImagesChange(index, e.target.files)}
                              className="hidden"
                              id={`modelo-images-${index}`}
                            />
                            <label htmlFor={`modelo-images-${index}`} className="cursor-pointer group">
                              <Upload
                                size={24}
                                className="mx-auto mb-2 text-[#817D79] group-hover:text-white transition-colors duration-200"
                              />
                              <div className="text-sm text-[#817D79] group-hover:text-white transition-colors duration-200">
                                {modelo.images?.length > 0 ? 'Agregar más fotos' : 'Subir fotos'}
                              </div>
                              <div className="text-xs text-[#817D79]/70 mt-1">
                                Podés seleccionar varias a la vez
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <ErrorMessage error={validationErrors.modelos} />

                <button
                  type="button"
                  onClick={addModeloRow}
                  className="w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-center space-x-2 hover:bg-gray-800/50"
                  style={{ borderColor: '#817D79' }}
                >
                  <Plus size={20} style={{ color: '#817D79' }} />
                  <span style={descStyle}>Agregar modelo</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                26. Si tiene proyectos realizados
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Muestre sus mejores proyectos con imágenes y descripción
              </p>

              <div className="space-y-4">
                {formData.proyectos.map((project, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #817D79', backgroundColor: '#1a1a1a' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium" style={labelStyle}>Proyecto {index + 1}</h4>
                      {formData.proyectos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProyectoRow(index)}
                          className="p-1 rounded hover:bg-red-600/20"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Modelo</label>
                        <input
                          type="text"
                          value={project.modelo}
                          onChange={(e) => updateProyecto(index, 'modelo', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_modelo`, e.target.value)}
                          placeholder="Ejemplo: Compacta"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`proyecto_${index}_modelo`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_modelo`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Ubicación</label>
                        <input
                          type="text"
                          value={project.ubicacion}
                          onChange={(e) => updateProyecto(index, 'ubicacion', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_ubicacion`, e.target.value)}
                          placeholder="Ejemplo: Canelones"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`proyecto_${index}_ubicacion`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_ubicacion`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Año</label>
                        <input
                          type="text"
                          value={project.anio}
                          onChange={(e) => updateProyecto(index, 'anio', e.target.value)}
                          placeholder="Ejemplo: 2025"
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={inputStyle}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Superficie (m²)</label>
                        <input
                          type="text"
                          value={project.superficie}
                          onChange={(e) => updateProyecto(index, 'superficie', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_superficie`, e.target.value)}
                          placeholder="Ejemplo: 100 (m²)"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`proyecto_${index}_superficie`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_superficie`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Dormitorios</label>
                        <input
                          type="text"
                          value={project.dormitorios}
                          onChange={(e) => updateProyecto(index, 'dormitorios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_dormitorios`, e.target.value)}
                          placeholder="Ejemplo: 2"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`proyecto_${index}_dormitorios`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_dormitorios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Baños</label>
                        <input
                          type="text"
                          value={project.banios}
                          onChange={(e) => updateProyecto(index, 'banios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_banios`, e.target.value)}
                          placeholder="Ejemplo: 1"
                          className={`w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${validationErrors[`proyecto_${index}_banios`] ? 'border-red-400' : ''}`}
                          style={inputStyle}
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_banios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold" style={labelStyle}>
                            Imágenes del proyecto
                          </label>
                          <span className="text-sm text-[#817D79]">
                            {project.images?.length || 0}/5
                          </span>
                        </div>

                        <p className="text-sm text-[#817D79] mb-3">
                          Si es posible, subí 4 fotos
                        </p>

                        {/* Grid de imágenes subidas */}
                        {project.images && project.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-3 mb-3">
                            {project.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="relative group h-24">
                                <Image
                                  src={img.url}
                                  alt={`Imagen ${imgIndex + 1}`}
                                  fill
                                  sizes="(min-width: 768px) 25vw, 50vw"
                                  className="object-cover rounded"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProyectoImage(index, imgIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón de subida */}
                        {(!project.images || project.images.length < 5) && (
                          <div className="border-2 border-dashed rounded p-6 text-center" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              multiple
                              onChange={async (e) => e.target.files && await handleProyectoImagesChange(index, e.target.files)}
                              className="hidden"
                              id={`proyecto-images-${index}`}
                            />
                            <label htmlFor={`proyecto-images-${index}`} className="cursor-pointer group">
                              <Upload
                                size={24}
                                className="mx-auto mb-2 text-[#817D79] group-hover:text-white transition-colors duration-200"
                              />
                              <div className="text-sm text-[#817D79] group-hover:text-white transition-colors duration-200">
                                {project.images?.length > 0 ? 'Agregar más fotos' : 'Subir fotos'}
                              </div>
                              <div className="text-xs text-[#817D79]/70 mt-1">
                                Podés seleccionar varias a la vez
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProyectoRow}
                  className="w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-center space-x-2 hover:bg-gray-800/50"
                  style={{ borderColor: '#817D79' }}
                >
                  <Plus size={20} style={{ color: '#817D79' }} />
                  <span style={descStyle}>Agregar proyecto</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                27. Cuéntenos sobre algunos clientes satisfechos
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Compartan experiencias de clientes contentos: nombres, dónde fue el proyecto, y qué comentaron sobre el trabajo</p>

              <div className="space-y-4">
                {formData.clientes.map((cliente, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #817D79', backgroundColor: '#1a1a1a' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium" style={labelStyle}>Cliente {index + 1}</h4>
                      {formData.clientes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClienteRow(index)}
                          className="p-1 rounded hover:bg-red-600/20"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Nombre de cliente</label>
                        <input
                          type="text"
                          value={cliente.nombre}
                          onChange={(e) => updateCliente(index, 'nombre', e.target.value)}
                          onBlur={() => handleFieldValidation(`cliente_${index}_nombre`, cliente.nombre)}
                          placeholder="Ejemplo: Rodrigo M."
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={{
                            ...inputStyle,
                            borderColor: validationErrors[`cliente_${index}_nombre`] ? '#ef4444' : inputStyle.border
                          }}
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_nombre`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Ubicación</label>
                        <input
                          type="text"
                          value={cliente.ubicacion}
                          onChange={(e) => updateCliente(index, 'ubicacion', e.target.value)}
                          onBlur={() => handleFieldValidation(`cliente_${index}_ubicacion`, cliente.ubicacion)}
                          placeholder="Ejemplo: Maldonado"
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={{
                            ...inputStyle,
                            borderColor: validationErrors[`cliente_${index}_ubicacion`] ? '#ef4444' : inputStyle.border
                          }}
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_ubicacion`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Testimonio</label>
                        <textarea
                          value={cliente.testimonio}
                          onChange={(e) => updateCliente(index, 'testimonio', e.target.value)}
                          onBlur={() => handleFieldValidation(`cliente_${index}_testimonio`, cliente.testimonio)}
                          placeholder="Ejemplo: Buscaba algo moderno para mi terreno en la costa. El resultado final superó el render que me habían mostrado. 
                          Excelente calidad y atención al detalle."
                          className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                          style={{
                            ...inputStyle,
                            borderColor: validationErrors[`cliente_${index}_testimonio`] ? '#ef4444' : inputStyle.border
                          }}
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_testimonio`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>
                          Imagen
                        </label>

                        {/* Preview si hay imagen */}
                        {cliente.image && (
                          <div className="mb-3">
                            <div className="relative group inline-block">
                              <Image
                                src={cliente.image.url}
                                alt="Cliente"
                                width={128}
                                height={128}
                                className="w-32 h-32 object-cover rounded border-2"
                                style={{ borderColor: '#817D79' }}
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveClienteImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Botón de subida */}
                        {!cliente.image && (
                          <div className="border-2 border-dashed rounded p-4 text-center" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              onChange={async (e) => e.target.files && await handleClienteImageChange(index, e.target.files[0])}
                              className="hidden"
                              id={`cliente-image-${index}`}
                            />
                            <label htmlFor={`cliente-image-${index}`} className="cursor-pointer group">
                              <Upload
                                size={20}
                                className="mx-auto mb-2 text-[#817D79] group-hover:text-white transition-colors duration-200"
                              />
                              <div className="text-sm text-[#817D79] group-hover:text-white transition-colors duration-200">
                                Subir imagen
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addClienteRow}
                  className="w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-center space-x-2 hover:bg-gray-800/50"
                  style={{ borderColor: '#817D79' }}
                >
                  <Plus size={20} style={{ color: '#817D79' }} />
                  <span style={descStyle}>Agregar cliente</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                28. ¿Quieren incluir una calculadora automática de precios en la web?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { calculadoraOption: "si", label: "Sí" },
                  { calculadoraOption: "no", label: "No" }
                ].map((option) => (
                  <label key={option.calculadoraOption} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="calculadoraOption"
                      value={option.calculadoraOption}
                      checked={formData.calculadoraOption === option.calculadoraOption}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleFieldValidation('calculadoraOption', e.target.value);
                      }}
                      className="w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300"
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.calculadoraOption} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                29. Si eligió &quot;Sí&quot;, indique el rango de metros cuadrados que manejan
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: 35-100 m²</p>
              <textarea
                name="rangoMetros"
                value={formData.rangoMetros}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                30. Si eligió &quot;Sí&quot;, indique el precio por m² por cada categoría
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: Categoría Básica: USD 800/m², Categoría Estándar: USD 1000/m², Categoría Premium: USD 1200/m²</p>
              <textarea
                name="precioCategoria"
                value={formData.precioCategoria}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                31. ¿Tienen precios diferenciales según la zona geográfica?<span style={asteriskStyle}>*</span>
              </label>
              <div className="space-y-3">
                {[
                  { precioDifOpcion: "si", label: "Sí" },
                  { precioDifOpcion: "no", label: "No" }
                ].map((option) => (
                  <label key={option.precioDifOpcion} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="precioDifOpcion"
                      value={option.precioDifOpcion}
                      checked={formData.precioDifOpcion === option.precioDifOpcion}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleFieldValidation('precioDifOpcion', e.target.value);
                      }}
                      className="w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300"
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity" style={labelStyle}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.precioDifOpcion} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                32. Si varía según ubicación, especifique los ajustes por zona
              </label>
              <p className="text-sm mb-3" style={descStyle}>Ejemplo: Montevideo: USD +100/m², Canelones: precio base, Maldonado: USD +150/m², Otras zonas: USD +50/m²</p>
              <textarea
                name="precioDifValor"
                value={formData.precioDifValor}
                onChange={handleInputChange}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                33. ¿Tienen alguna frase o mensaje que los identifique como empresa?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Si tienen un slogan o frase que usen habitualmente, compártanla</p>
              <textarea
                name="frase"
                value={formData.frase}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('frase')}
                onBlur={(e) => handleFieldValidation('frase', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.frase} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                34. ¿Cómo les gusta describir su trabajo cuando hablan con clientes?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>¿Qué les dicen cuando les preguntan qué hacen? ¿Cómo se describen en pocas palabras?</p>
              <textarea
                name="pitch"
                value={formData.pitch}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('pitch')}
                onBlur={(e) => handleFieldValidation('pitch', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.pitch} />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3" style={labelStyle}>
                35. ¿Hay algo importante sobre su empresa que quieran que sea visible en la web?<span style={asteriskStyle}>*</span>
              </label>
              <p className="text-sm mb-3" style={descStyle}>Certificaciones, premios, servicios especiales, garantías, o cualquier información que consideren relevante para sus clientes</p>
              <textarea
                name="importante"
                value={formData.importante}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('importante')}
                onBlur={(e) => handleFieldValidation('importante', e.target.value)}
                placeholder="Tu respuesta"
                className="w-full rounded-md px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={inputStyle}
                required
              />
              <ErrorMessage error={validationErrors.importante} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#191919" }}>
      <div className="max-w-xl mx-auto">
        <div className="mb-8 pt-28">
          <h1 className="text-[40px] font-bold leading-tight mb-2" style={labelStyle}>
            Información para desarrollo web
          </h1>
          <p style={labelStyle}>Para crear tu web personalizada necesitamos la siguiente información</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium" style={labelStyle}>
              Paso {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm" style={descStyle}>
              {steps[currentStep].title}
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: "#30302E", opacity: 0.8 }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: "#F0EFED", width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: currentStep === 0 ? "transparent" : "#30302E",
                color: "#F0EFED",
                border: "1px solid #30302E",
              }}
              onMouseEnter={(e) => {
                if (currentStep !== 0 && !e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "#3a3936";
                }
              }}
              onMouseLeave={(e) => {
                if (currentStep !== 0 && !e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "#30302E";
                }
              }}
            >
              <ChevronLeft size={20} />
              <span>Anterior</span>
            </button>

            {currentStep === totalSteps - 1 ? (
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer hover:brightness-110"
                style={{ backgroundColor: "#30302E", color: "#F0EFED", border: "1px solid #30302E" }}
                onMouseEnter={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.backgroundColor = "#3a3936";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.backgroundColor = "#30302E";
                  }
                }}
              >
                <span>Enviar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer hover:brightness-110"
                style={{ backgroundColor: "#30302E", color: "#F0EFED", border: "1px solid #30302E" }}
                onMouseEnter={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.backgroundColor = "#3a3936";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.backgroundColor = "#30302E";
                  }
                }}
              >
                <span>Siguiente</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Pantalla de confirmación */}
      {showConfirmation && confirmationData && (
        <ConfirmationScreen
          companyName={confirmationData.companyName}
          filesUploaded={confirmationData.filesUploaded}
        />
      )}
    </div>
  );
};

export default ContainerCompanyForm;