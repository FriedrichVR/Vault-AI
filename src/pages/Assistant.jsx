import { useState, useEffect } from 'react';

export default function Assistant() {
  const [avatar, setAvatar] = useState(
    localStorage.getItem('userAvatar') || 
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKFeVTPWLSPgaVLGhnkPXNO3BKiEVny_1TaMamGFpVp-3SF7fFmZ2EjHxs9ayimbsucHyxXRCXKeDcu6CKZsQBRhh2sz-UgPwyIlZLpLLH0xuG-_sTJBjxOBBjNE1Y3o06TC1sCZkT49BK1xYfHCzdKr2iKCDaNxEq3ssTRZUqf-fUdl5PzN4IqqQHR2ZS25lHDi-jk-jXDbTobg4arWCxK4BlR064Xprs-_U6zwor_i1huTWfwfDxNMVnM9urJQJvWvX85cVOAIs"
  );

  useEffect(() => {
    const handleUpdate = () => {
      setAvatar(localStorage.getItem('userAvatar') || avatar);
    };
    window.addEventListener('avatarUpdate', handleUpdate);
    return () => window.removeEventListener('avatarUpdate', handleUpdate);
  }, []);

  return (
    <div className="flex flex-col h-full -mt-6 -mx-4">
      {/* Search and context handled by parent Layout Header, but this page has a lot of specific UI */}
      <div className="flex-1 p-4 space-y-6 scrollbar-hide">
        {/* AI Message with Rich Data Card */}
        <div className="flex items-start gap-3">
          <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined fill-active text-primary text-xl">smart_toy</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 items-start">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-1 uppercase tracking-wider">Asistente</p>
            <div className="text-sm font-normal leading-relaxed max-w-[85%] rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 shadow-sm">
                Hola, he analizado tus finanzas del último mes. Tu ahorro ha incrementado un 12% respecto al periodo anterior. Aquí tienes el desglose de tus gastos:
            </div>
            
            {/* Graph Card */}
            <div className="w-full max-w-md rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-5 shadow-lg">
              <div className="flex flex-col gap-2 mb-6">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Gastos Mensuales</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">€2.450,00</p>
                  <span className="text-emerald-500 text-sm font-medium flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_down</span> 5%
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-32 gap-3 px-2">
                <Bar height="60%" label="ALIM." opacity="40" />
                <Bar height="90%" label="TRANS." opacity="60" />
                <Bar height="35%" label="OCIO" opacity="30" />
                <Bar height="20%" label="FACT." opacity="20" />
                <Bar height="45%" label="OTROS" opacity="40" />
              </div>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
            <img className="w-full h-full object-cover" src={avatar} alt="User Avatar" />
          </div>
          <div className="flex flex-col gap-1 items-end max-w-[80%]">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-1 uppercase tracking-wider">Tú</p>
            <div className="text-sm font-normal leading-relaxed rounded-2xl px-4 py-3 bg-primary text-white shadow-md">
                ¿Cuál es mi saldo actual en la cuenta de ahorros y qué intereses he generado?
            </div>
          </div>
        </div>

        {/* AI Detailed Response */}
        <div className="flex items-start gap-3">
          <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-sm font-normal leading-relaxed max-w-[85%] rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 shadow-sm">
                Tu cuenta de ahorros muestra un crecimiento constante. Aquí tienes el detalle actual:
            </div>
            
            {/* Account Card */}
            <div className="max-w-md overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 shadow-lg">
              <div className="p-5 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest">Premium Savings</p>
                  <p className="text-slate-900 dark:text-white text-lg font-bold">Cuenta de Ahorros</p>
                  <p className="text-slate-500 dark:text-slate-400 text-2xl font-semibold mt-2">€12.540,00</p>
                </div>
                <div className="bg-slate-700/50 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-slate-300">account_balance_wallet</span>
                </div>
              </div>
              <div className="bg-slate-900/40 px-5 py-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] font-medium uppercase">Intereses (YTD)</span>
                  <span className="text-emerald-500 text-sm font-bold">+€142,50</span>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition-colors">
                  Ver detalles <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Chat Input Bar */}
      <div className="px-4 pt-4 pb-4 border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark z-20 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 rounded-2xl shadow-xl focus-within:border-primary/50 transition-all">
          <button className="p-2 rounded-xl hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 py-2 outline-none" 
            placeholder="Pregunta algo sobre tus finanzas..." 
            type="text"
          />
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
              <span className="material-symbols-outlined">mic</span>
            </button>
            <button className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2 font-medium tracking-wide">
          La IA puede cometer errores. Verifica la información financiera crítica.
        </p>
      </div>
    </div>
  );
}

function Bar({ height, label, opacity }) {
  const opacityClass = {
    '20': 'opacity-20',
    '30': 'opacity-30',
    '40': 'opacity-40',
    '60': 'opacity-60',
  }[opacity];

  return (
    <div className="flex flex-col items-center flex-1 gap-2">
      <div className="w-full bg-primary/20 rounded-t-sm relative group" style={{ height }}>
        <div className={`absolute inset-0 bg-primary ${opacityClass} rounded-t-sm`}></div>
      </div>
      <span className="text-slate-500 text-[10px] font-bold">{label}</span>
    </div>
  );
}
