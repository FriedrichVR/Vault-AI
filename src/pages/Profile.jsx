import { useState, useEffect } from 'react';

export default function Profile() {
  const [avatar, setAvatar] = useState(
    localStorage.getItem('userAvatar') || 
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKFeVTPWLSPgaVLGhnkPXNO3BKiEVny_1TaMamGFpVp-3SF7fFmZ2EjHxs9ayimbsucHyxXRCXKeDcu6CKZsQBRhh2sz-UgPwyIlZLpLLH0xuG-_sTJBjxOBBjNE1Y3o06TC1sCZkT49BK1xYfHCzdKr2iKCDaNxEq3ssTRZUqf-fUdl5PzN4IqqQHR2ZS25lHDi-jk-jXDbTobg4arWCxK4BlR064Xprs-_U6zwor_i1huTWfwfDxNMVnM9urJQJvWvX85cVOAIs"
  );
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setAvatar(base64);
        localStorage.setItem('userAvatar', base64);
        window.dispatchEvent(new Event('avatarUpdate'));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Profile Header */}
      <section className="flex flex-col items-center justify-center p-6 text-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-surface-dark shadow-2xl overflow-hidden mb-6 relative hover:scale-105 transition-transform duration-300">
            <img id="avatar-image" src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-surface-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]">edit</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Federico Sastre</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">fsastre@vaultai.com</p>
        <div className="mt-4 bg-emerald-900/30 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">verified</span> Plan Pro Activo
        </div>
      </section>

      {/* Settings Menu */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mb-2 px-1">Configuración de Cuenta</h2>
        
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-lg">
          <MenuLink icon="person" color="primary" label="Información Personal" />
          <MenuLink icon="security" color="emerald" label="Seguridad y Contraseña" />
          <MenuLink icon="notifications" color="amber" label="Notificaciones" isLast />
        </div>

        <h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-8 mb-2 px-1">Preferencias Financieras</h2>
        
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-lg">
          <MenuLink icon="account_balance" color="blue" label="Cuentas y Bancos" sub="2 vinculados" />
          <MenuLink icon="payments" color="indigo" label="Moneda Principal" sub="ARS (Pesos Argentinos)" />
          <MenuLink icon="download" color="rose" label="Exportar Reportes" sub="PDF, Excel, CSV" isLast />
        </div>

        <h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-8 mb-2 px-1">App</h2>
        
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300 text-[18px]">dark_mode</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Modo Oscuro</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <MenuLink icon="help" color="slate" label="Ayuda y Soporte" isLast />
        </div>

        <button className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-sm font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors border border-rose-500/20 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Cerrar Sesión
        </button>
      </section>
    </div>
  );
}

function MenuLink({ icon, color, label, sub, isLast }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    rose: 'bg-rose-500/10 text-rose-500',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-300',
  };

  return (
    <a href="#" className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!isLast ? 'border-b border-slate-200 dark:border-border-dark' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
          {sub && <p className="text-[10px] text-slate-500 font-medium">{sub}</p>}
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
    </a>
  );
}
