"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ContainerCompanyForm from './ContainerCompanyForm';

function HomeContent() {
  const [started, setStarted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('test') === 'true') {
    }
  }, [searchParams]);

  // Controlar el scroll del body según el estado
  useEffect(() => {
    if (!started) {
      // Prevenir scroll en la página inicial
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      // Restaurar scroll cuando se inicia el formulario
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [started]);

  if (!started) {
    return (
      <main className="initial-page theme-light paper-texture flex items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <div className="max-w-xl w-full text-left">
          <div className="px-6">
            <h1 className="text-5xl font-bold leading-none tracking-tight" style={{ color: "var(--foreground)" }}>
              Información
              <br />
              para desarrollo web
            </h1>
            <p className="text-base md:text-lg text-gray-600 mt-8">
              Los campos marcados con
              <span className="text-gray-400 ml-1">*</span>
              son obligatorios.
              <br />
              El resto son opcionales pero ayudan a que tu web sea más completa.
            </p>
            <button
              type="button"
              className="btn btn-primary mt-8"
              onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Comenzar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen theme-light paper-texture" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <ContainerCompanyForm showHeader={false} initialStep={0} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}