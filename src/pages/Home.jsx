import { useState, useEffect } from 'react';

export default function Home() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Balance Section */}
      <section className="mb-6">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-[0.15em] mb-1 uppercase">Patrimonio Neto Consolidado</p>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">$428,942<span className="text-slate-500 dark:text-slate-400">.85</span></h1>
          <span className="text-emerald-400 text-xs font-bold flex items-center">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> <span className="ml-0.5">+2.4%</span>
          </span>
        </div>
      </section>

      {/* Flow Overview Card */}
      <section className="mb-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-lg">
          <h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-5 uppercase">Resumen de Flujo</h2>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Ingresos</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xl font-bold text-emerald-400">$12,450.00</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-border-dark h-1 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Gastos</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xl font-bold text-rose-500">$8,210.40</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-border-dark h-1 rounded-full overflow-hidden flex">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
            Tu flujo neto es <span className="text-emerald-400 font-semibold">$4,239.60</span> mayor que el mes pasado.
          </p>
        </div>
      </section>

      {/* Spending Trends Card */}
      <section className="mb-8">
        <div className="px-2">
          {/* Header Area */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Tendencias de Gastos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fecha actual</p>
              <span id="current-date-display" className="text-[10px] font-medium tracking-wider text-slate-500">
                {currentDate}
              </span>
            </div>
            {/* Time Toggles */}
            <div className="flex flex-col items-end gap-1.5">
              <div id="chart-toggles" className="flex gap-1.5 bg-white dark:bg-surface-dark p-1 rounded-xl">
                <button data-period="1s" className="text-slate-500 dark:text-slate-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-white/5 transition-colors">1S</button>
                <button data-period="1m" className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-[0_4px_10px_rgba(13,13,242,0.3)]">1M</button>
                <button data-period="1a" className="text-slate-500 dark:text-slate-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-white/5 transition-colors">1A</button>
              </div>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div id="chart-container" className="flex items-end justify-between h-48 w-full gap-2 transition-opacity duration-300">
            {/* LUN */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '35%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Lun</span>
            </div>
            {/* MAR */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '60%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mar</span>
            </div>
            {/* MIÉ */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '40%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mié</span>
            </div>
            {/* JUE (Active) */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-primary rounded-md relative shadow-[0_0_20px_rgba(13,13,242,0.4)] z-10" style={{ height: '85%' }}></div>
              <span className="text-[10px] font-bold text-primary uppercase">Jue</span>
            </div>
            {/* VIE */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '50%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Vie</span>
            </div>
            {/* SÁB */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '25%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sáb</span>
            </div>
            {/* DOM */}
            <div className="flex flex-col items-center justify-end flex-1 gap-3 h-full">
              <div className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e1e2d] dark:hover:bg-[#252538] transition-colors rounded-md relative" style={{ height: '15%' }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Dom</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Budgets */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Presupuestos Mensuales</h2>
          <button className="text-primary text-[9px] font-bold uppercase tracking-wider">Ver Todos</button>
        </div>
        <div className="space-y-5 px-1">
          {/* Budget Card 1 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">local_mall</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Compras</p>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">$842 <span className="text-slate-500 font-medium">/ $1,200</span></p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          {/* Budget Card 2 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">restaurant</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Restaurantes</p>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">$320 <span className="text-slate-500 font-medium">/ $500</span></p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
          {/* Budget Card 3 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">flight</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Viajes</p>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">$1,450 <span className="text-slate-500 font-medium">/ $1,500</span></p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Actividad Reciente</h2>
          <button className="text-primary text-[9px] font-bold uppercase tracking-wider">Historial</button>
        </div>
        <div className="space-y-2">
          <TransactionItem title="Amazon AWS" category="Infraestructura Cloud" amount="-124.50" status="Analizado" icon="dns" />
          <TransactionItem title="Blue Bottle Coffee" category="Comida y Bebidas" amount="-12.00" status="Procesando" icon="coffee" isStatusIndigo />
          <TransactionItem title="Steam Purchase" category="Entretenimiento" amount="-59.99" status="Analizado" icon="sports_esports" />
        </div>
      </section>
    </div>
  );
}

function TransactionItem({ title, category, amount, status, icon, isStatusIndigo }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-slate-200 dark:bg-border-dark/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-300">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-[9px] uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mt-0.5">{category}</p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1.5">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{amount}</p>
        <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${
          isStatusIndigo 
            ? 'bg-primary/20 text-indigo-400 border-primary/20' 
            : 'bg-emerald-900/30 text-emerald-500 border-emerald-500/10'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}
