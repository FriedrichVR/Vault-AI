import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const tabs = [
    { name: 'Inicio', icon: 'home', path: '/' },
    { name: 'Movimientos', icon: 'receipt_long', path: '/movimientos' },
    { name: 'Escaneo', icon: 'add', path: '/escaneo', isCentral: true },
    { name: 'Asistente', icon: 'smart_toy', path: '/asistente' },
    { name: 'Perfil', icon: 'person', path: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-border-dark px-6 pt-3 pb-safe z-50">
      <div className="flex justify-between items-center max-w-md mx-auto px-2 relative">
        {tabs.map((tab) => {
          if (tab.isCentral) {
            return (
              <NavLink 
                key={tab.name} 
                to={tab.path} 
                className="flex flex-col items-center gap-1 group relative -top-6"
              >
                <div className="w-12 h-12 bg-primary group-hover:bg-primary/90 transition-colors rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white dark:border-background-dark">
                  <span className="material-symbols-outlined text-white">{tab.icon}</span>
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) => `flex flex-col items-center gap-1 group ${isActive ? '' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary fill-active' : 'text-slate-500 group-hover:text-primary'}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`}>
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
