"use client";
import React, { useEffect } from 'react';
import { Check, Upload, Home } from 'lucide-react';

interface ConfirmationScreenProps {
  companyName: string;
  filesUploaded: number;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  companyName,
  filesUploaded,
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
      className="fixed inset-0 z-50 p-4 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div
        className="rounded-lg shadow-lg w-full max-w-sm border"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e5e7eb' }}
      >
        <div className="p-5 text-center">
          <Check className="w-10 h-10 mx-auto mb-2" style={{ color: '#16a34a' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>¡Formulario enviado!</h2>
          <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>Tu información fue recibida. Ya estamos revisándola.</p>
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="rounded-md p-3" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
                <Home className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Empresa</h3>
                <p className="text-sm" style={{ color: '#4B5563' }}>{companyName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md p-3" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Imágenes subidas</h3>
                <p className="text-sm" style={{ color: '#4B5563' }}>{filesUploaded} imagen(es) procesada(s)</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <div className="text-xs" style={{ color: '#4B5563' }}>
              Nuestro equipo revisará tu información y se pondrá en contacto contigo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;