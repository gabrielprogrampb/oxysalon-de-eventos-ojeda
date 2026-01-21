import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Protected Route Component
const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Component to handle conditional footer rendering
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

const App: React.FC = () => {
  
  // Track Site Visits
  useEffect(() => {
    const currentVisits = parseInt(localStorage.getItem('site_visits') || '3400');
    localStorage.setItem('site_visits', (currentVisits + 1).toString());
  }, []);

  return (
    <HashRouter>
      <div className="w-full min-h-screen bg-background-dark text-slate-900 dark:text-white overflow-x-hidden">
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/services" element={<Services />} />
            
            {/* Specific Service Routes */}
            <Route path="/services/decor" element={<ServiceDetail type="decor" />} />
            <Route path="/services/tech" element={<ServiceDetail type="tech" />} />
            <Route path="/services/bar" element={<ServiceDetail type="bar" />} />

            <Route path="/spaces" element={<Spaces />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/calendar" element={<CalendarPage />} /> 
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
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
          </Routes>
        </LayoutWrapper>
        <NavMenu />
        <FloatingWhatsApp />
      </div>
    </HashRouter>
  );
};

export default App;