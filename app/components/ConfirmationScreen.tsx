"use client";
import React, { useEffect } from 'react';
import { Check, Upload, Home } from 'lucide-react';

interface ConfirmationScreenProps {
  companyName: string;
  sheetName: string;
  filesUploaded: number;
  onClose: () => void;
  onNewForm: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  companyName,
  sheetName,
  filesUploaded,
  onClose,
  onNewForm,
}) => {

  // Bloquear scroll del body cuando se muestra la confirmación
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      style={{ 
        overflow: 'hidden',
        height: '100vh',
        width: '100vw'
      }}
    >
      <div className="rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #817D79' }}>
        {/* Header con ícono de éxito */}
        <div className="p-6 text-center" style={{ backgroundColor: '#1a1a1a' }}>
          <Check className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#F0EFED' }}>¡Formulario enviado!</h2>
          <p className="mt-2" style={{ color: '#817D79', fontSize: '16px' }}>Tu información ha sido procesada exitosamente</p>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4" style={{ backgroundColor: '#1a1a1a' }}>
          {/* Información de la empresa */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#2a2a2a', border: '1px solid #817D79' }}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3a3a3a' }}>
                <Home className="w-4 h-4" style={{ color: '#F0EFED' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#F0EFED', fontSize: '16px' }}>Empresa</h3>
                <p style={{ color: '#817D79', fontSize: '16px' }}>{companyName}</p>
              </div>
            </div>
          </div>

          {/* Información de archivos */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#2a2a2a', border: '1px solid #817D79' }}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3a3a3a' }}>
                <Upload className="w-4 h-4" style={{ color: '#F0EFED' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#F0EFED', fontSize: '16px' }}>Imágenes subidas</h3>
                <p style={{ color: '#817D79', fontSize: '16px' }}>{filesUploaded} imagen(es) procesada(s)</p>
              </div>
            </div>
          </div>

          {/* Mensaje adicional */}
          <div className="text-center py-6">
            <p className="text-sm mb-4" style={{ color: '#F0EFED', fontSize: '16px' }}>
              Nuestro equipo revisará tu información y se pondrá en contacto contigo.
            </p>
            <p className="text-xs" style={{ color: '#817D79', fontSize: '14px' }}>
              Puedes cerrar esta pestaña cuando desees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;