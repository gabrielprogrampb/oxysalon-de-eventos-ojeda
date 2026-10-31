import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavMenu from './components/NavMenu';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './src/lib/auth';
import { ThemeProvider } from './src/lib/theme';
import { ErrorBoundary, OfflineBanner } from './src/lib/app-errors';
import { ToastProvider } from './src/ui';
import { recordPageView } from './src/lib/store';

// -----------------------------------------------------------------------------
// Carga diferida por ruta: el visitante del sitio público no descarga el panel,
// y el panel no descarga las páginas de marketing.
// -----------------------------------------------------------------------------
const Home = lazy(() => import('./pages/Home'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Spaces = lazy(() => import('./pages/Spaces'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/StatusPages').then((m) => ({ default: m.NotFound })));
const Forbidden = lazy(() => import('./pages/StatusPages').then((m) => ({ default: m.Forbidden })));
const ServerError = lazy(() => import('./pages/StatusPages').then((m) => ({ default: m.ServerError })));

const AdminLayout = lazy(() => import('./src/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Overview = lazy(() => import('./src/admin/pages/Overview').then((m) => ({ default: m.Overview })));
const Analytics = lazy(() => import('./src/admin/pages/Analytics').then((m) => ({ default: m.Analytics })));
const Inquiries = lazy(() => import('./src/admin/pages/Inquiries').then((m) => ({ default: m.Inquiries })));
const InquiryDetail = lazy(() => import('./src/admin/pages/Inquiries').then((m) => ({ default: m.InquiryDetail })));
const Agenda = lazy(() => import('./src/admin/pages/Agenda').then((m) => ({ default: m.Agenda })));
const Finance = lazy(() => import('./src/admin/pages/Finance').then((m) => ({ default: m.Finance })));
const GalleryAdmin = lazy(() => import('./src/admin/pages/Gallery').then((m) => ({ default: m.Gallery })));
const Activity = lazy(() => import('./src/admin/pages/Activity').then((m) => ({ default: m.Activity })));
const Settings = lazy(() => import('./src/admin/pages/Settings').then((m) => ({ default: m.Settings })));

/** Vuelve al inicio de la página en cada cambio de ruta (SPA). */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

/** Registra la visita (métrica real, deduplicada por sesión y hora). */
const PageViewTracker: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname === '/login') return;
    void recordPageView(pathname);
  }, [pathname]);
  return null;
};

/** Pantalla de espera mientras carga el trozo de código de la ruta. */
const RouteFallback: React.FC = () => (
  <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 bg-bg text-fg">
    <span
      aria-hidden="true"
      className="material-symbols-outlined animate-spin text-3xl text-accent"
    >
      progress_activity
    </span>
    <p className="text-2xs uppercase tracking-widest text-muted">Cargando…</p>
  </div>
);

/** Ruta protegida: exige sesión válida + pertenencia a la tabla `admins`. */
const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <RouteFallback />;

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

/** Envoltura del sitio público: nav, footer y botón de WhatsApp. */
const PublicShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <Footer />
    <NavMenu />
    <FloatingWhatsApp />
  </>
);

const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-bg text-fg">
      <ScrollToTop />
      <PageViewTracker />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ---------------- Sitio público ---------------- */}
          <Route path="/" element={<PublicShell><Home /></PublicShell>} />
          <Route path="/gallery" element={<PublicShell><Gallery /></PublicShell>} />
          <Route path="/services" element={<PublicShell><Services /></PublicShell>} />
          <Route path="/services/decor" element={<PublicShell><ServiceDetail type="decor" /></PublicShell>} />
          <Route path="/services/tech" element={<PublicShell><ServiceDetail type="tech" /></PublicShell>} />
          <Route path="/services/bar" element={<PublicShell><ServiceDetail type="bar" /></PublicShell>} />
          <Route path="/spaces" element={<PublicShell><Spaces /></PublicShell>} />
          <Route path="/booking" element={<PublicShell><Booking /></PublicShell>} />
          <Route path="/calendar" element={<PublicShell><CalendarPage /></PublicShell>} />

          {/* ---------------- Autenticación ---------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ---------------- Consola ---------------- */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="solicitudes" element={<Inquiries />} />
            <Route path="solicitudes/:id" element={<InquiryDetail />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="finanzas" element={<Finance />} />
            <Route path="galeria" element={<GalleryAdmin />} />
            <Route path="analitica" element={<Analytics />} />
            <Route path="actividad" element={<Activity />} />
            <Route path="configuracion" element={<Settings />} />
          </Route>

          {/* ---------------- Compatibilidad con enlaces antiguos ---------------- */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/inquiry/:id" element={<LegacyInquiryRedirect />} />
          <Route path="/dashboard/finance/new" element={<Navigate to="/admin/finanzas" replace />} />
          <Route path="/dashboard/gallery" element={<Navigate to="/admin/galeria" replace />} />
          <Route path="/dashboard/gallery/:id" element={<Navigate to="/admin/galeria" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />

          {/* ---------------- Estado ---------------- */}
          {/* Vistas alcanzables para soporte y enlaces desde correos/avisos. */}
          <Route path="/403" element={<PublicShell><Forbidden /></PublicShell>} />
          <Route path="/500" element={<PublicShell><ServerError /></PublicShell>} />
          <Route path="*" element={<PublicShell><NotFound /></PublicShell>} />
        </Routes>
      </Suspense>
    </div>
  );
};

/** Conserva los enlaces viejos de detalle de solicitud. */
const LegacyInquiryRedirect: React.FC = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop() ?? '';
  return <Navigate to={`/admin/solicitudes/${id}`} replace />;
};

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
