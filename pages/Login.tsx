import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas. Intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-dark text-white font-display p-4 relative overflow-hidden">
      {/* Background Ambience with Parallax */}
      <div 
        className="absolute inset-0 parallax-bg z-0 opacity-40 blur-sm"
        style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDwYDZS9J96ZRrKG23lumANkWuo4yY4sWpeHe8d3MnER59ehdbZDUoI3MRt4t0W_8mkB_7oRdCaUGFuSEcRlIHvcdyZwkfeRi6gFfcj7BP59hGrkH8ZCp3ZoHgf4pLuj2SoocXIpKUoVt3JesOZju2R1ZEFTpQI2l3hNjZ68Gd5r3O72SyA0_yFvm8kSHp4J4-7ONpxTKSiwqRfen1RK83NlCDsW9tLI2MMltPhUrPIVwtGQXOP62Ebdkfkx6661pjZL1xgC0_V_xXL")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>

      <div className="relative z-20 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
        <div className="text-center mb-10">
           <h2 className="text-2xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>
            OXYSALON <span className="text-gold font-light block md:inline">DE EVENTOS</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2">Acceso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="material-symbols-outlined text-xl">mail</span>
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-gold focus:ring-0 transition-colors"
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="material-symbols-outlined text-xl">lock</span>
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-gold focus:ring-0 transition-colors"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] mt-4"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;