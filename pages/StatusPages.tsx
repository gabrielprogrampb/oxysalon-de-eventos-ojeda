/**
 * Pantallas de estado: 404, 403 y error de servidor.
 * Comparten la misma estructura para que el usuario siempre sepa dónde está
 * y qué puede hacer a continuación.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Glyph } from '../src/ui';

const Shell: React.FC<{
  code: string;
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}> = ({ code, icon, title, description, children }) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <span
          aria-hidden="true"
          className="material-symbols-outlined mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-3xl text-accent"
        >
          {icon}
        </span>
        <p className="tabular text-5xl font-black tracking-tight text-fg/15">{code}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white"
          >
            <Glyph name="home" /> Ir al inicio
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-fg"
          >
            <Glyph name="arrow_back" /> Volver
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => (
  <Shell
    code="404"
    icon="explore_off"
    title="Esta página no existe"
    description="El enlace puede estar mal escrito o la página se movió. Revisa la dirección o vuelve al inicio."
  />
);

export const Forbidden: React.FC = () => (
  <Shell
    code="403"
    icon="lock"
    title="No tienes acceso a esta sección"
    description="Tu cuenta no tiene permisos para ver este contenido. Si crees que es un error, contacta al administrador."
  />
);

export const ServerError: React.FC = () => (
  <Shell
    code="500"
    icon="cloud_off"
    title="Algo falló de nuestro lado"
    description="El problema no es tuyo. Intenta recargar en unos segundos; si persiste, escríbenos por WhatsApp."
  />
);
