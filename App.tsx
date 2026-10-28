import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Booking from './pages/Booking';
import Spaces from './pages/Spaces';
import Dashboard from './pages/Dashboard';
import DashboardGallery from './pages/DashboardGallery';
import DashboardFinance from './pages/DashboardFinance';
import DashboardInquiry from './pages/DashboardInquiry';
import CalendarPage from './pages/CalendarPage';
import Login from './pages/Login';
import NavMenu from './components/NavMenu';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './src/lib/auth';
import { recordPageView } from './src/lib/store';

/** Vuelve al inicio de la página en cada cambio de ruta (SPA). */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

/** Registra la visita (métrica real, reemplaza el contador falso anterior). */
const PageViewTracker: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/dashboard') || pathname === '/login') return;
    void recordPageView(pathname);
  }, [pathname]);
  return null;
};

/** Ruta protegida: exige sesión válida + rol de administrador. */
const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background-dark text-white gap-4">
        <span className="material-symbols-outlined text-4xl text-gold animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-gray-400 uppercase tracking-widest">Verificando acceso…</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

/** Oculta el footer en el panel y en el login. */
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/dashboard');
  const isLoginPath = location.pathname === '/login';
  const showFooter = !isAdminPath && !isLoginPath;

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
};

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <ScrollToTop />
    <PageViewTracker />
    <div className="w-full min-h-screen bg-background-dark text-slate-900 dark:text-white overflow-x-hidden">
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/services" element={<Services />} />

          {/* Rutas específicas de servicio */}
          <Route path="/services/decor" element={<ServiceDetail type="decor" />} />
          <Route path="/services/tech" element={<ServiceDetail type="tech" />} />
          <Route path="/services/bar" element={<ServiceDetail type="bar" />} />

          <Route path="/spaces" element={<Spaces />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas administrativas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/gallery/:id?"
            element={
              <PrivateRoute>
                <DashboardGallery />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/finance/new"
            element={
              <PrivateRoute>
                <DashboardFinance />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/inquiry/:id"
            element={
              <PrivateRoute>
                <DashboardInquiry />
              </PrivateRoute>
            }
          />

          {/* Cualquier otra ruta vuelve al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
      <NavMenu />
      <FloatingWhatsApp />
    </div>
  </BrowserRouter>
);

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
