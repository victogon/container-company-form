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
  descripcion: string;
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
  metodoCalculo: string;
  explicacionCalculo: string;
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

const ContainerCompanyForm = ({ showHeader = false, initialStep = 0 }: { showHeader?: boolean; initialStep?: number }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 9;

  const progressFillColor = (percent: number) =>
    percent < 34 ? "#86efac" : percent < 67 ? "#22c55e" : "#16a34a";
  const progressPercent = currentStep === 0 ? 1 : (currentStep / totalSteps) * 100;
  const uploadFillColor = "#22c55e";



  // (removido) Función auxiliar uploadToCloudinary no utilizada

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
          } catch {
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







  // (removido) Función de validación de imagen no utilizada para subir a Cloudinary



  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    companyName: string;
    sheetName: string;
    filesUploaded: number;
  } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<{ inProgress: boolean; percent: number }>({ inProgress: false, percent: 0 });
  const [uploadingModelos, setUploadingModelos] = useState<{ [index: number]: { inProgress: boolean; files: { name: string; percent: number }[] } }>({});
  const [uploadingProyectos, setUploadingProyectos] = useState<{ [index: number]: { inProgress: boolean; files: { name: string; percent: number }[] } }>({});
  const [uploadingClientes, setUploadingClientes] = useState<{ [index: number]: { inProgress: boolean; percent: number; name?: string } }>({});
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
    metodoCalculo: '',
    explicacionCalculo: '',
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
    proyectos: [{ modelo: '', ubicacion: '', anio: '', superficie: '', dormitorios: '', banios: '', descripcion: '', images: [] as { url: string; publicId: string }[] }],
    clientes: [{ nombre: '', ubicacion: '', testimonio: '', image: null }]
  });

  // Función para calcular tamaño total de imágenes eliminada

  // Función para actualizar el tracking de tamaño eliminada

  const steps = [
    { title: "Datos básicos" },
    { title: "Contacto y ubicación" },
    { title: "Historia y equipo" },
    { title: "Forma de trabajo" },
    { title: "Diseños disponibles" },
    { title: "Obras realizadas" },
    { title: "Clientes satisfechos" },
    { title: "Calculadora de precios" },
    { title: "Información adicional" }
  ];

  // Estilos
  const descStyle = { color: "#817D79" };




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

    // Inicializar estado de progreso
    setUploadingModelos((prev) => ({
      ...prev,
      [modeloIndex]: {
        inProgress: true,
        files: filesToUpload.map((f) => ({ name: f.name, percent: 0 })),
      },
    }));

    const uploaded: { url: string; publicId: string }[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Validaciones básicas de tipo y tamaño
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Tipo de archivo no permitido. Solo JPG, PNG, GIF o WebP.');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert('El archivo es demasiado grande. Máximo 10MB permitido.');
          continue;
        }

        const image = await xhrUploadImage(file, 'modelos', (loaded, total) => {
          const percent = Math.round((loaded / total) * 100);
          setUploadingModelos((prev) => {
            const entry = prev[modeloIndex];
            if (!entry) return prev;
            const files = [...entry.files];
            files[i] = { ...files[i], percent };
            return { ...prev, [modeloIndex]: { ...entry, files } };
          });
        });

        uploaded.push(image);
      }

      const updatedModelos = [...formData.modelos];
      updatedModelos[modeloIndex].images = [...currentImages, ...uploaded];
      setFormData((prev) => ({ ...prev, modelos: updatedModelos }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error subiendo imágenes');
    } finally {
      setUploadingModelos((prev) => ({
        ...prev,
        [modeloIndex]: {
          inProgress: false,
          files: (prev[modeloIndex]?.files || []).map((f) => ({ ...f, percent: 100 })),
        },
      }));
    }
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
      proyectos: [...prev.proyectos, { modelo: "", ubicacion: "", anio: "", superficie: "", dormitorios: "", banios: "", descripcion: "", images: [] }],
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

    // Inicializar estado de progreso
    setUploadingProyectos((prev) => ({
      ...prev,
      [proyectoIndex]: {
        inProgress: true,
        files: filesToUpload.map((f) => ({ name: f.name, percent: 0 })),
      },
    }));

    const uploaded: { url: string; publicId: string }[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Validaciones básicas de tipo y tamaño
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Tipo de archivo no permitido. Solo JPG, PNG, GIF o WebP.');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert('El archivo es demasiado grande. Máximo 10MB permitido.');
          continue;
        }

        const image = await xhrUploadImage(file, 'proyectos', (loaded, total) => {
          const percent = Math.round((loaded / total) * 100);
          setUploadingProyectos((prev) => {
            const entry = prev[proyectoIndex];
            if (!entry) return prev;
            const files = [...entry.files];
            files[i] = { ...files[i], percent };
            return { ...prev, [proyectoIndex]: { ...entry, files } };
          });
        });

        uploaded.push(image);
      }

      const updatedProyectos = [...formData.proyectos];
      updatedProyectos[proyectoIndex].images = [...currentImages, ...uploaded];
      setFormData((prev) => ({ ...prev, proyectos: updatedProyectos }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error subiendo imágenes');
    } finally {
      setUploadingProyectos((prev) => ({
        ...prev,
        [proyectoIndex]: {
          inProgress: false,
          files: (prev[proyectoIndex]?.files || []).map((f) => ({ ...f, percent: 100 })),
        },
      }));
    }
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
    if (!file) {
      updateCliente(index, "image", null);
      return;
    }

    // Validaciones básicas de tipo y tamaño
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo JPG, PNG, GIF o WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB permitido.');
      return;
    }

    setUploadingClientes((prev) => ({
      ...prev,
      [index]: { inProgress: true, percent: 0, name: file.name },
    }));

    try {
      const image = await xhrUploadImage(file, 'clientes', (loaded, total) => {
        const percent = Math.round((loaded / total) * 100);
        setUploadingClientes((prev) => {
          const entry = prev[index];
          if (!entry) return prev;
          return { ...prev, [index]: { ...entry, percent } };
        });
      });
      updateCliente(index, "image", image);
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[`cliente_${index}_image`];
        return copy;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error subiendo imagen');
    } finally {
      setUploadingClientes((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || { name: file.name }), inProgress: false, percent: 100 },
      }));
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
        // achievements es opcional
        break;

      case 3: // Forma de trabajo
        if (formData.specialties.length === 0) errors.specialties = 'Selecciona al menos una opción';
        if (!formData.workStyle.trim()) errors.workStyle = 'Llena este campo';
        if (!formData.workTime.trim()) errors.workTime = 'Llena este campo';
        if (formData.diferencialCompetitivo.length === 0) errors.diferencialCompetitivo = 'Selecciona al menos una opción';
        if (!formData.ventajas.trim()) errors.ventajas = 'Llena este campo';
        if (!formData.proyectosRealizados.trim()) errors.proyectosRealizados = 'Llena este campo';
        if (!formData.dominioOption.trim()) errors.dominioOption = 'Selecciona una opción';
        if (formData.dominioOption === 'tengo' && !formData.dominioName.trim()) {
          errors.dominioName = 'Llena este campo';
        }
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
            const hasAnyField = proyecto.ubicacion.trim() ||
              proyecto.superficie.trim() || proyecto.dormitorios.trim() ||
              proyecto.banios.trim() || proyecto.anio.trim();

            if (hasAnyField) {
              if (!proyecto.ubicacion.trim()) errors[`proyecto_${index}_ubicacion`] = 'Llena este campo';
              if (!proyecto.superficie.trim()) errors[`proyecto_${index}_superficie`] = 'Llena este campo';
              if (!proyecto.dormitorios.trim()) errors[`proyecto_${index}_dormitorios`] = 'Llena este campo';
              if (!proyecto.banios.trim()) errors[`proyecto_${index}_banios`] = 'Llena este campo';
              if (!proyecto.anio.trim()) errors[`proyecto_${index}_anio`] = 'Llena este campo';
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
        if (!formData.calculadoraOption.trim()) errors.calculadoraOption = 'Selecciona una opción';
        if (formData.calculadoraOption === 'si' && !formData.metodoCalculo.trim()) {
          errors.metodoCalculo = 'Selecciona una opción';
        }
        if (formData.calculadoraOption === 'si' && !formData.explicacionCalculo.trim()) {
          errors.explicacionCalculo = 'Llena este campo';
        }
        // Removidas las validaciones de campos que no están en el formulario
        break;

      case 8: // Mensajes y comunicación
        // Ambas preguntas son opcionales ahora
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
        // achievements es opcional
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
      case 'proyecto_ubicacion':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_anio':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_superficie':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_dormitorios':
        if (!value || !value.trim()) error = 'Llena este campo';
        break;
      case 'proyecto_banios':
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
        if (formData.dominioOption === 'tengo' && (!value || !value.trim())) {
          error = 'Llena este campo';
        }
        break;
      case 'calculadoraOption':
        if (!value || !value.trim()) error = 'Selecciona una opción';
        break;
      case 'metodoCalculo':
        if (formData.calculadoraOption === 'si' && (!value || !value.trim())) {
          error = 'Selecciona una opción';
        }
        break;
      case 'explicacionCalculo':
        if (formData.calculadoraOption === 'si' && (!value || !value.trim())) {
          error = 'Llena este campo';
        }
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
      case 'precioDifOpcion':
        if (formData.calculadoraOption === 'si' && (!value || !value.trim())) {
          error = 'Selecciona una opción';
        }
        break;

      // Paso 8 - Mensajes y comunicación
      case 'frase':
        // frase es opcional
        break;
      case 'importante':
        // importante es opcional
        break;
      case 'pitch':
        // pitch es opcional
        break;
      case 'pitch':
        // pitch es opcional
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
        fields.push('workStyle', 'workTime', 'diferencialCompetitivo', 'ventajas', 'proyectosRealizados', 'dominioOption');
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
          fields.push(`proyecto_${index}_ubicacion`, `proyecto_${index}_superficie`, `proyecto_${index}_dormitorios`, `proyecto_${index}_banios`, `proyecto_${index}_anio`);
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
        fields.push('calculadoraOption', 'precioDifOpcion');
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

  const handleSubmit = async () => {
    // Solo procesar el envío si estamos realmente en el último paso
    if (currentStep !== totalSteps - 1) {
      console.log('Envío cancelado: no estamos en el último paso');
      return;
    }

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

    // Buscar el botón de envío para cambiar su estado
    const submitButton = document.querySelector('.btn-secondary') as HTMLButtonElement;
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
      formDataToSend.append('metodoCalculo', formData.metodoCalculo || '');
      formDataToSend.append('explicacionCalculo', formData.explicacionCalculo || '');
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
      <div className="form-error">
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
            <div className="form-field">
              <label className="form-label text-lg font-bold">
                1. Nombre de la empresa<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('companyName', e.target.value)}
                placeholder="Contenedores del Uruguay"
                className={`form-input ${validationErrors.companyName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.companyName} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                2. Persona de contacto principal<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('contactPerson', e.target.value)}
                placeholder="María Pérez"
                className={`form-input ${validationErrors.contactPerson ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.contactPerson} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                3. Teléfono de contacto<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('phone', e.target.value)}
                placeholder="099 123 456"
                className={`form-input ${validationErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.phone} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                4. Email de contacto<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('email', e.target.value)}
                placeholder="contacto@tuempresa.com"
                className={`form-input ${validationErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.email} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                5. Suba el logo de la empresa<span className="text-gray-400 ml-1">*</span>
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
                      className="btn-icon btn-destructive absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de subida */}
              {!formData.logo && (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center upload-hover ${validationErrors.logo ? 'border-red-600' : ''}`}
                  style={{ borderColor: validationErrors.logo ? '#dc2626' : '#817D79' }}
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
                      className="mx-auto mb-2 text-gray-600 upload-icon"
                    />
                    <div className="text-sm text-gray-600 upload-text">
                      Subir logo
                    </div>
                  </label>

                  {uploadingLogo.inProgress && (
                    <div className="mt-4 text-left">
                      <div className="text-xs" style={descStyle}>Subiendo logo… {uploadingLogo.percent}%</div>
                      <div className="h-1.5 rounded-md bg-[#e5e7eb] mt-2">
                        <div
                          className="h-1.5 rounded-md"
                          style={{
                            backgroundColor: uploadFillColor,
                            width: `${uploadingLogo.percent}%`,
                            transition: "background-color 200ms ease, width 300ms ease",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ErrorMessage error={validationErrors.logo} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                6. ¿Cuáles son los colores principales de su marca?<span className="text-gray-400 ml-1">*</span>
              </label>
              <textarea
                name="brandColors"
                value={formData.brandColors}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('brandColors')}
                onBlur={(e) => handleFieldValidation('brandColors', e.target.value)}
                placeholder="Azul, naranja, blanco"
                className={`form-textarea ${validationErrors.brandColors ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.brandColors} />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="form-field">
              <label className="form-label text-lg font-bold">
                7. Dirección de la empresa<span className="text-gray-400 ml-1">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('address', e.target.value)}
                placeholder="Av. Italia 1234, Montevideo"
                className={`form-textarea ${validationErrors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.address} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                8. ¿Cuáles son sus horarios de atención?<span className="text-gray-400 ml-1">*</span>
              </label>
              <textarea
                name="businessHours"
                value={formData.businessHours}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('businessHours')}
                onBlur={(e) => handleFieldValidation('businessHours', e.target.value)}
                placeholder="Lunes a viernes 9-18hs"
                className={`form-textarea ${validationErrors.businessHours ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.businessHours} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                9. Links de redes sociales<span className="text-gray-400 ml-1">*</span>
              </label>
              <p className="form-description">Instagram, Facebook, TikTok, LinkedIn</p>
              <textarea
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('socialMedia', e.target.value)}
                placeholder="https://instagram.com/tuempresa
https://facebook.com/tuempresa"
                className={`form-textarea ${validationErrors.socialMedia ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.socialMedia} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                10. Número de WhatsApp para contacto<span className="text-gray-400 ml-1">*</span>
              </label>
              <p className="form-description">Este número aparecerá visible en tu web con el botón de WhatsApp</p>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('whatsappNumber', e.target.value)}
                placeholder="099 456 789"
                className={`form-input ${validationErrors.whatsappNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.whatsappNumber} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                11. ¿En qué zonas de Uruguay trabajan?<span className="text-gray-400 ml-1">*</span>
              </label>
              <textarea
                name="workAreas"
                value={formData.workAreas}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('workAreas')}
                onBlur={(e) => handleFieldValidation('workAreas', e.target.value)}
                placeholder="Montevideo, Canelones"
                className={`form-textarea ${validationErrors.workAreas ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.workAreas} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="form-field">
              <label className="form-label text-lg font-bold">
                12. Año de inicio<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="text"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('foundedYear', e.target.value)}
                placeholder="2015"
                className={`form-input ${validationErrors.foundedYear ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.foundedYear} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                13. ¿Cuántas personas conforman el equipo actual?<span className="text-gray-400 ml-1">*</span>
              </label>
              <div className="space-y-3">
                {[
                  { teamSize: "1-2", label: "1-2" },
                  { teamSize: "3-5", label: "3-5" },
                  { teamSize: "6-10", label: "6-10" },
                  { teamSize: "+10", label: "Más de 10" }
                ].map((option) => (
                  <label key={option.teamSize} className="form-radio-label">
                    <input
                      type="radio"
                      name="teamSize"
                      value={option.teamSize}
                      checked={formData.teamSize === option.teamSize}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleFieldValidation('calculadoraOption', e.target.value);
                      }}
                      className={`form-radio ${validationErrors.teamSize ? 'border-destructive' : ''}`}
                      required
                    />
                    <span className="form-radio-text">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.teamSize} />
            </div>

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                14. ¿Cuál es su especialidad principal?<span className="text-gray-400 ml-1">*</span>
              </label>
              <p className="form-description">
                Seleccioná todas las que apliquen
              </p>
              <div className="space-y-3">
                {[
                  { specialties: "diseño-arquitectura", label: "Diseño y arquitectura" },
                  { specialties: "construccion-montaje", label: "Construcción y montaje" },
                  { specialties: "terminaciones-interiores", label: "Terminaciones e interiores" },
                  { specialties: "asesoramiento-tecnico", label: "Asesoramiento técnico" },
                  { specialties: "gestion-proyectos", label: "Gestión de proyectos" },
                  { specialties: "ampliaciones-reformas", label: "Ampliaciones y reformas" },
                  { specialties: "transporte-logistica", label: "Transporte y logística" }
                ].map((option) => (
                  <label key={option.specialties} className="form-checkbox-label">
                    <input
                      type="checkbox"
                      name="specialties"
                      value={option.specialties}
                      checked={formData.specialties.includes(option.specialties)}
                      onChange={() => handleCheckboxChange("specialties", option.specialties)}
                      className={`form-checkbox ${validationErrors.specialties ? 'border-destructive' : ''}`}
                      required
                    />
                    <span className="form-checkbox-text">
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

            <div className="form-field">
              <label className="form-label text-lg font-bold">
                15. Historia de la empresa<span className="text-gray-400 ml-1">*</span>
              </label>
              <p className="form-description">¿Cómo comenzaron? ¿Por qué containers? ¿Qué los motiva?</p>
              <textarea
                name="companyStory"
                value={formData.companyStory}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('companyStory')}
                onBlur={(e) => handleFieldValidation('companyStory', e.target.value)}
                placeholder="Contanos tu historia en unas líneas"
                className={`form-textarea ${validationErrors.companyStory ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.companyStory} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                16. Logros destacados (opcional)
              </label>
              <input
                type="text"
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('achievements')}
                onBlur={(e) => handleFieldValidation('achievements', e.target.value)}
                placeholder="Más de 50 casas entregadas"
                className={`form-input ${validationErrors.achievements ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <ErrorMessage error={validationErrors.achievements} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="form-label text-lg font-bold">
                17. ¿Cómo trabajan principalmente?<span className="text-gray-400 ml-1">*</span>
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
                      className={`form-radio ${validationErrors.workStyle ? 'border-red-400' : ''}`}
                      style={{
                        borderColor: validationErrors.workStyle ? "#dc2626" : "#9ca3af",
                        accentColor: "#6b7280"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.workStyle} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                18. Tiempo de entrega aproximado<span className="text-gray-400 ml-1">*</span>
              </label>
              <input
                type="text"
                name="workTime"
                value={formData.workTime}
                onChange={handleInputChange}
                onBlur={(e) => handleFieldValidation('workTime', e.target.value)}
                placeholder="3-6 meses"
                className={`form-input ${validationErrors.workTime ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.workTime} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                19. ¿Cuál consideran que es su principal diferencial competitivo?<span className="text-gray-400 ml-1">*</span>
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Seleccioná todas las que apliquen
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
                  { diferencialCompetitivo: "atencion-postventa", label: "Atención post-venta" },
                  { diferencialCompetitivo: "montaje-profesional", label: "Montaje profesional" }
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
                        borderColor: validationErrors.diferencialCompetitivo ? "#dc2626" : "#817D79",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity">
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
              <label className="form-label text-lg font-bold">
                20. Principales ventajas de las casas container<span className="text-gray-400 ml-1">*</span>
                <p className="text-sm font-medium mb-3" style={descStyle}>Según tu experiencia, ¿qué beneficios destacarías?</p>
              </label>
              <textarea
                name="ventajas"
                value={formData.ventajas}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('ventajas')}
                onBlur={(e) => handleFieldValidation('ventajas', e.target.value)}
                placeholder="Construcción más rápida, menor costo"
                className={`form-textarea ${validationErrors.ventajas ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <ErrorMessage error={validationErrors.ventajas} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                21. ¿Cuántas casas han entregado?<span className="text-gray-400 ml-1">*</span>
              </label>
              <div className="space-y-3">
                {[
                  { proyectosRealizados: "1-10", label: "1-10" },
                  { proyectosRealizados: "11-25", label: "11-25" },
                  { proyectosRealizados: "26-50", label: "26-50" },
                  { proyectosRealizados: "51-100", label: "51-100" },
                  { proyectosRealizados: "+100", label: "Más de 100" }
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
                    <span className="text-sm group-hover:opacity-80 transition-opacity">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.proyectosRealizados} />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                22. ¿Tienen dominio web?<span className="text-gray-400 ml-1">*</span>
              </label>
              <div className="space-y-3">
                {[
                  { dominioOption: "tengo", label: "Sí, ya tengo dominio" },
                  { dominioOption: "no-tengo", label: "No, necesito orientación para comprarlo" }
                ].map((option) => (
                  <label key={option.dominioOption} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="dominioOption"
                      value={option.dominioOption}
                      checked={formData.dominioOption === option.dominioOption}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[var(--foreground)] bg-transparent border-2 focus:ring-2 focus:ring-gray-300"
                      style={{
                        borderColor: "#F0EFED",
                        accentColor: "#817D79"
                      }}
                      required
                    />
                    <span className="text-sm group-hover:opacity-80 transition-opacity">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.dominioOption} />
            </div>

            {formData.dominioOption === 'tengo' && (
              <div>
                <label className="form-label text-lg font-bold">
                  23. ¿Cuál es tu dominio?
                </label>
                <textarea
                  name="dominioName"
                  value={formData.dominioName}
                  onChange={handleInputChange}
                  placeholder="www.tuempresa.com.uy"
                  className="form-textarea"
                />
              </div>
            )}
          </div>
        );

      case 4: {
        const domainExtra = formData.dominioOption === 'tengo' ? 1 : 0;
        const disenosNumber = 23 + domainExtra;
        return (
          <div className="space-y-8">
            <div>
              <label className="form-label text-lg font-bold">
                {disenosNumber}. Diseños disponibles (o &quot;Catálogo&quot;)
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Si ofrecés diseños de catálogo con precios establecidos, completá esta sección (opcional)
              </p>

              <div className="space-y-4">
                {formData.modelos.map((modelo, index) => (
                  <div key={index} className="p-4 rounded-lg bg-[#f7f5f3] border border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-800 underline">Diseño {index + 1}</h4>
                      {formData.modelos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModeloRow(index)}
                          className="btn-icon btn-ghost hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Nombre del diseño</label>
                        <input
                          type="text"
                          value={modelo.nombre}
                          onChange={(e) => updateModelo(index, 'nombre', e.target.value)}
                          placeholder="Compacta"
                          className={`form-input ${validationErrors[`modelo_${index}_nombre`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_nombre`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Metros cuadrados</label>
                        <input
                          type="text"
                          value={modelo.superficie}
                          onChange={(e) => updateModelo(index, 'superficie', e.target.value)}
                          placeholder="50 m²"
                          className={`form-input ${validationErrors[`modelo_${index}_superficie`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_superficie`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Dormitorios</label>
                        <input
                          type="text"
                          value={modelo.dormitorios}
                          onChange={(e) => updateModelo(index, 'dormitorios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`modelo_${index}_dormitorios`, e.target.value)}
                          placeholder="2"
                          className={`form-input ${validationErrors[`modelo_${index}_dormitorios`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_dormitorios`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Baños</label>
                        <input
                          type="text"
                          value={modelo.banios}
                          onChange={(e) => updateModelo(index, 'banios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`modelo_${index}_banios`, e.target.value)}
                          placeholder="1"
                          className={`form-input ${validationErrors[`modelo_${index}_banios`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <ErrorMessage error={validationErrors[`modelo_${index}_banios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Precio base (opcional)</label>
                        <input
                          type="text"
                          value={modelo.preciobase}
                          onChange={(e) => updateModelo(index, 'preciobase', e.target.value)}
                          placeholder="USD 750 por m² / USD 30.000 total"
                          className="form-input"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Detalles destacados (opcional)</label>
                        <textarea
                          value={modelo.especiales}
                          onChange={(e) => updateModelo(index, 'especiales', e.target.value)}
                          placeholder="Terraza, aislación térmica"
                          className="form-textarea"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-800">
                            Fotos del diseño
                          </label>
                          <span className="text-sm text-[#817D79]">
                            {modelo.images?.length || 0}/5
                          </span>
                        </div>

                        <p className="text-xs mb-2" style={descStyle}>
                          Subí 4 fotos
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
                                  className="object-cover rounded-md"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveModeloImage(index, imgIndex)}
                                  className="btn-icon btn-destructive absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-white/80 text-[#4B5563] text-xs px-1.5 py-0.5 rounded-md">
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón de subida */}
                        {(!modelo.images || modelo.images.length < 5) && (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center upload-hover" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              multiple
                              onChange={async (e) => e.target.files && await handleModeloImagesChange(index, e.target.files)}
                              className="hidden"
                              id={`modelo-images-${index}`}
                            />
                            <label htmlFor={`modelo-images-${index}`} className={`cursor-pointer group ${uploadingModelos[index]?.inProgress ? 'opacity-60 pointer-events-none' : ''}`}>
                              <Upload
                                size={24}
                                className="mx-auto mb-2 text-[#817D79] upload-icon"
                              />
                              <div className="text-sm text-[#817D79] upload-text">
                                {modelo.images?.length > 0 ? 'Agregar más fotos' : 'Subir fotos'}
                              </div>
                              <div className="text-xs text-[#817D79]/70 mt-1">
                                Podés seleccionar varias a la vez
                              </div>
                            </label>
                            {uploadingModelos[index]?.inProgress && uploadingModelos[index]?.files?.length > 0 && (
                              <div className="mt-4 text-left space-y-2">
                                {uploadingModelos[index].files.map((f, fi) => (
                                  <div key={fi}>
                                    <div className="text-xs" style={descStyle}>{f.name}… {f.percent}%</div>
                                    <div className="h-1.5 rounded-md bg-[#e5e7eb] mt-1">
                                      <div
                                        className="h-1.5 rounded-md"
                                        style={{
                                          backgroundColor: uploadFillColor,
                                          width: `${f.percent}%`,
                                          transition: "background-color 200ms ease, width 300ms ease",
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
                  className="btn btn-outline btn-dashed w-full"
                >
                  <Plus size={20} />
                  <span>Agregar modelo</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 5: {
        const domainExtra = formData.dominioOption === 'tengo' ? 1 : 0;
        const disenosNumber = 23 + domainExtra;
        const obrasNumber = disenosNumber + 1;
        return (
          <div className="space-y-8">
            <div>
              <label className="form-label text-lg font-bold">
                {obrasNumber}. Obras realizadas
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                Casas que ya construiste y entregaste (opcional)
              </p>

              <div className="space-y-4">
                {formData.proyectos.map((project, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #817D79', backgroundColor: 'var(--background)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium underline">Obra {index + 1}</h4>
                      {formData.proyectos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProyectoRow(index)}
                          className="btn-icon btn-ghost hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Ubicación o nombre del proyecto</label>
                        <input
                          type="text"
                          value={project.ubicacion}
                          onChange={(e) => updateProyecto(index, 'ubicacion', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_ubicacion`, e.target.value)}
                          placeholder="Montevideo"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_ubicacion`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Año de entrega</label>
                        <input
                          type="text"
                          value={project.anio}
                          onChange={(e) => updateProyecto(index, 'anio', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_${index}_anio`, e.target.value)}
                          placeholder="2023"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_anio`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Metros cuadrados</label>
                        <input
                          type="text"
                          value={project.superficie}
                          onChange={(e) => updateProyecto(index, 'superficie', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_superficie`, e.target.value, index)}
                          placeholder="50 m²"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_superficie`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Dormitorios</label>
                        <input
                          type="text"
                          value={project.dormitorios}
                          onChange={(e) => updateProyecto(index, 'dormitorios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_dormitorios`, e.target.value, index)}
                          placeholder="2"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_dormitorios`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Baños</label>
                        <input
                          type="text"
                          value={project.banios}
                          onChange={(e) => updateProyecto(index, 'banios', e.target.value)}
                          onBlur={(e) => handleFieldValidation(`proyecto_banios`, e.target.value, index)}
                          placeholder="1"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_banios`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Breve descripción (opcional)</label>
                        <textarea
                          value={project.descripcion}
                          onChange={(e) => updateProyecto(index, 'descripcion', e.target.value)}
                          placeholder="Casa familiar con terminaciones de primera"
                          className="form-textarea"
                        />
                        <ErrorMessage error={validationErrors[`proyecto_${index}_descripcion`]} />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold">
                            Fotos de la obra
                          </label>
                          <span className="text-sm text-[#817D79]">
                            {project.images?.length || 0}/5
                          </span>
                        </div>

                        <p className="text-xs mb-2" style={descStyle}>
                          Subí 4 fotos
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
                                  className="btn-icon btn-destructive absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-white/80 text-[#4B5563] text-xs px-1.5 py-0.5 rounded">
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón de subida */}
                        {(!project.images || project.images.length < 5) && (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center upload-hover" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              multiple
                              onChange={async (e) => e.target.files && await handleProyectoImagesChange(index, e.target.files)}
                              className="hidden"
                              id={`proyecto-images-${index}`}
                            />
                            <label htmlFor={`proyecto-images-${index}`} className={`cursor-pointer group ${uploadingProyectos[index]?.inProgress ? 'opacity-60 pointer-events-none' : ''}`}>
                              <Upload
                                size={24}
                                className="mx-auto mb-2 text-[#817D79] upload-icon"
                              />
                              <div className="text-sm text-[#817D79] upload-text">
                                {project.images?.length > 0 ? 'Agregar más fotos' : 'Subir fotos'}
                              </div>
                              <div className="text-xs text-[#817D79]/70 mt-1">
                                Podés seleccionar varias a la vez
                              </div>
                            </label>
                            {uploadingProyectos[index]?.inProgress && uploadingProyectos[index]?.files?.length > 0 && (
                              <div className="mt-4 text-left space-y-2">
                                {uploadingProyectos[index].files.map((f, fi) => (
                                  <div key={fi}>
                                    <div className="text-xs" style={descStyle}>{f.name}… {f.percent}%</div>
                                    <div className="h-1.5 rounded-md bg-[#e5e7eb] mt-1">
                                      <div
                                        className="h-1.5 rounded-md"
                                        style={{
                                          backgroundColor: uploadFillColor,
                                          width: `${f.percent}%`,
                                          transition: "background-color 200ms ease, width 300ms ease",
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProyectoRow}
                  className="btn btn-outline btn-dashed w-full"
                >
                  <Plus size={20} />
                  <span>Agregar proyecto</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 6: {
        const domainExtra = formData.dominioOption === 'tengo' ? 1 : 0;
        const disenosNumber = 23 + domainExtra;
        const clientesNumber = disenosNumber + 2;
        return (
          <div className="space-y-8">
            <div>
              <label className="form-label text-lg font-bold">
                {clientesNumber}. Clientes satisfechos (opcional)
              </label>
              <p className="text-sm mb-4" style={descStyle}>
                3-6 testimonios reales ayudan mucho a tu web</p>

              <div className="space-y-4">
                {formData.clientes.map((cliente, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #817D79', backgroundColor: 'var(--background)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium underline">Cliente {index + 1}</h4>
                      {formData.clientes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClienteRow(index)}
                          className="btn-icon btn-ghost hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Nombre del cliente</label>
                        <input
                          type="text"
                          value={cliente.nombre}
                          onChange={(e) => updateCliente(index, 'nombre', e.target.value)}
                          placeholder="Juan Pérez"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_nombre`]} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Zona del proyecto</label>
                        <input
                          type="text"
                          value={cliente.ubicacion}
                          onChange={(e) => updateCliente(index, 'ubicacion', e.target.value)}
                          placeholder="Montevideo"
                          className="form-input"
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_ubicacion`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Testimonio</label>
                        <textarea
                          value={cliente.testimonio}
                          onChange={(e) => updateCliente(index, 'testimonio', e.target.value)}
                          placeholder="¿Qué dijeron sobre tu trabajo?"
                          className="form-textarea"
                        />
                        <ErrorMessage error={validationErrors[`cliente_${index}_testimonio`]} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">
                          Foto del cliente o del proyecto (opcional)
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
                                className="w-32 h-32 object-cover rounded-md border-2"
                                style={{ borderColor: '#817D79' }}
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveClienteImage(index)}
                                className="btn-icon btn-destructive absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Botón de subida */}
                        {!cliente.image && (
                          <div className="border-2 border-dashed rounded-lg p-4 text-center upload-hover" style={{ borderColor: '#817D79' }}>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.gif,.webp"
                              onChange={async (e) => e.target.files && await handleClienteImageChange(index, e.target.files[0])}
                              className="hidden"
                              id={`cliente-image-${index}`}
                            />
                            <label htmlFor={`cliente-image-${index}`} className={`cursor-pointer group ${uploadingClientes[index]?.inProgress ? 'opacity-60 pointer-events-none' : ''}`}>
                              <Upload
                                size={20}
                                className="mx-auto mb-2 text-[#817D79] upload-icon"
                              />
                              <div className="text-sm text-[#817D79] upload-text">
                                {uploadingClientes[index]?.name ? `Subiendo ${uploadingClientes[index]?.name}` : 'Subir imagen'}
                              </div>
                            </label>
                            {uploadingClientes[index]?.inProgress && (
                              <div className="mt-4 text-left space-y-2">
                                <div className="text-xs" style={descStyle}>{uploadingClientes[index]?.name}… {uploadingClientes[index]?.percent}%</div>
                                <div className="h-1.5 rounded-md bg-[#e5e7eb] mt-1">
                                  <div
                                    className="h-1.5 rounded-md"
                                    style={{
                                      backgroundColor: uploadFillColor,
                                      width: `${uploadingClientes[index]?.percent}%`,
                                      transition: "background-color 200ms ease, width 300ms ease",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addClienteRow}
                  className="btn btn-outline btn-dashed w-full"
                >
                  <Plus size={20} />
                  <span>Agregar cliente</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 7: {
        const domainExtra = formData.dominioOption === 'tengo' ? 1 : 0;
        const calcBase = 26 + domainExtra;
        return (
          <div className="space-y-6">
            <div>
              <label className="form-label text-lg font-bold">
                {calcBase}. ¿Quieren incluir una calculadora automática de precios en la web?<span className="text-gray-400 ml-1">*</span>
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
                    <span className="text-sm group-hover:opacity-80 transition-opacity">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <ErrorMessage error={validationErrors.calculadoraOption} />
            </div>

            {/* Preguntas condicionales cuando calculadoraOption es 'si' */}
            {formData.calculadoraOption === 'si' && (
              <>
                <div>
                  <label className="form-label text-lg font-bold">
                    {calcBase + 1}. ¿Cómo calculan los precios de las casas?<span className="text-gray-400 ml-1">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "metro_cuadrado", label: "Por metro cuadrado" },
                      { value: "modelo_fijo", label: "Por modelo/diseño fijo" },
                      { value: "personalizado", label: "Personalizado según proyecto" },
                      { value: "otro", label: "Otro (explicar)" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="metodoCalculo"
                          value={option.value}
                          checked={formData.metodoCalculo === option.value}
                          onChange={(e) => {
                            handleInputChange(e);
                            handleFieldValidation('metodoCalculo', e.target.value);
                          }}
                          className="w-4 h-4 text-white bg-transparent border-2 focus:ring-2 focus:ring-gray-300"
                          style={{
                            borderColor: "#F0EFED",
                            accentColor: "#817D79"
                          }}
                          required
                        />
                        <span className="text-sm group-hover:opacity-80 transition-opacity">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage error={validationErrors.metodoCalculo} />
                </div>

                <div>
                  <label className="form-label text-lg font-bold">
                    {calcBase + 2}. Explicá cómo funciona el cálculo de precios<span className="text-gray-400 ml-1">*</span>
                  </label>
                  <textarea
                    name="explicacionCalculo"
                    value={formData.explicacionCalculo}
                    onChange={handleInputChange}
                    onFocus={() => markFieldAsTouched('explicacionCalculo')}
                    onBlur={(e) => handleFieldValidation('explicacionCalculo', e.target.value)}
                    placeholder="Explicá cómo calculás los precios para que podamos configurar la calculadora correctamente. Incluí rangos de m², precios, categorías y cualquier factor que influya en el costo final. Ejemplo: Hasta 50m² = $X/m², 51-100m² = $Y/m². Extras como deck se cotizan aparte."
                    className={`form-textarea ${validationErrors.explicacionCalculo ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  <ErrorMessage error={validationErrors.explicacionCalculo} />
                </div>
              </>
            )}
          </div>
        );
      }

      case 8: {
        const domainExtra = formData.dominioOption === 'tengo' ? 1 : 0;
        const calcBase = 26 + domainExtra;
        const step8Base = calcBase + (formData.calculadoraOption === 'si' ? 3 : 1);
        return (
          <div className="space-y-6">
            <div>
              <label className="form-label text-lg font-bold">
                {step8Base}. Frase principal para la web (opcional)
              </label>
              <p className="text-sm font-medium mb-3" style={descStyle}>Mensaje que aparecerá en el banner principal</p>
              <textarea
                name="frase"
                value={formData.frase}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('frase')}
                placeholder="Construimos tu casa container ideal"
                className="form-textarea"
              />
            </div>

            <div>
              <label className="form-label text-lg font-bold">
                {step8Base + 1}. Información importante (opcional)
              </label>
              <p className="text-sm font-medium mb-3" style={descStyle}>Certificaciones, garantías, servicios especiales</p>
              <textarea
                name="importante"
                value={formData.importante}
                onChange={handleInputChange}
                onFocus={() => markFieldAsTouched('importante')}
                placeholder="Garantía de 10 años en estructura"
                className="form-textarea"
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-12 theme-light paper-texture" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-xl mx-auto">
        {showHeader && (
          <div className="sticky top-0 z-10 border-b border-[#817D79]/20 px-6 min-h-28 flex flex-col items-start justify-center py-4 text-left gap-1" style={{ backgroundColor: "var(--background)" }}>
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Información para desarrollo web
            </h1>
            <p className="text-sm text-[#817D79] mt-1">
              Los campos marcados con * son obligatorios.
              El resto son opcionales pero ayudan a que tu web sea más completa.
            </p>
          </div>
        )}

        <div
          className="fixed z-20 border-b border-[#817D79]/20 bg-[#f7f5f3] w-full left-0"
          style={{
            top: showHeader ? "7rem" : "0"
          }}
        >
          <div className="pt-9 pb-6">
            <div
              className="flex items-center justify-start mb-2 px-6"
              aria-label={`Paso ${Math.max(1, Math.min(currentStep + 1, totalSteps))} de ${totalSteps}`}
            >
              <label className="form-label text-lg font-bold text-gray-500">
                {steps[currentStep]?.title}
              </label>
            </div>

            <div
              className="w-full h-4 rounded-md border border-gray-300 bg-gray-100 mx-6"
              style={{
                padding: "3px",
                width: "calc(100% - 3rem)"
              }}
            >
              <div
                className="h-full rounded-md transition-all duration-300"
                style={{
                  backgroundColor: progressFillColor(progressPercent),
                  width: `${Math.max(progressPercent, 1)}%`,
                  transition: "background-color 200ms ease, width 300ms ease",
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ paddingTop: showHeader ? "13rem" : "6rem" }}>
          <div className="pt-6 px-6">
            {renderStep()}
          </div>

          <div className="flex justify-between items-center pt-8 px-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn btn-outline"
            >
              <ChevronLeft size={20} />
              <span>Anterior</span>
            </button>

            {currentStep === totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-secondary"
              >
                <span>Enviar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                <span>Siguiente</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
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