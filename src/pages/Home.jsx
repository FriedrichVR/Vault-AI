import { useState, useEffect } from 'react';

// Static Data moved outside component to prevent re-creation on render
const CHART_DATA = {
  '1s': [
    { label: 'Lun', height: '35%', active: false },
    { label: 'Mar', height: '60%', active: false },
    { label: 'Mié', height: '40%', active: false },
    { label: 'Jue', height: '85%', active: true },
    { label: 'Vie', height: '50%', active: false },
    { label: 'Sáb', height: '25%', active: false },
    { label: 'Dom', height: '15%', active: false },
  ],
  '1m': [
    { label: 'Sem 1', height: '45%', active: false },
    { label: 'Sem 2', height: '75%', active: false },
    { label: 'Sem 3', height: '90%', active: true },
    { label: 'Sem 4', height: '60%', active: false },
  ],
  '1a': [
    { label: 'E', height: '40%', active: false }, { label: 'F', height: '30%', active: false },
    { label: 'M', height: '65%', active: false }, { label: 'A', height: '45%', active: false },
    { label: 'M', height: '80%', active: false }, { label: 'J', height: '35%', active: false },
    { label: 'J', height: '55%', active: false }, { label: 'A', height: '60%', active: false },
    { label: 'S', height: '90%', active: true }, { label: 'O', height: '70%', active: false },
    { label: 'N', height: '65%', active: false }, { label: 'D', height: '50%', active: false },
  ]
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState('');
  const [activePeriod, setActivePeriod] = useState('1s');

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
  }, []);

  const currentChart = CHART_DATA[activePeriod];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Main Balance Section */}
      <section className="mb-6 animate-slide-up">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-[0.15em] mb-1 uppercase">Patrimonio Neto Consolidado</p>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">$428,942<span className="text-slate-500 dark:text-slate-400">.85</span></h1>
          <span className="text-emerald-400 text-xs font-bold flex items-center">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> <span className="ml-0.5">+2.4%</span>
          </span>
        </div>
      </section>

      {/* Flow Overview Card */}
      <section className="mb-6 animate-slide-up delay-100">
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
      <section className="mb-8 animate-slide-up delay-200">
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
            {/* Time Toggles - Modern Pill Style */}
            <div className="flex flex-col items-end gap-1.5">
              <div id="chart-toggles" className="flex gap-1 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                {['1s', '1m', '1a'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period)}
                    className={`${
                      activePeriod === period
                        ? 'bg-primary text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5'
                    } text-[10px] font-bold px-4 py-2 rounded-xl transition-all duration-300 uppercase tracking-wider`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bar Chart Section - Card Like Container */}
          <div className="relative mt-2 p-6 rounded-3xl bg-white dark:bg-surface-dark/40 shadow-sm border border-slate-100 dark:border-white/[0.02]">
            {/* Grid Reference Lines */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pr-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full border-t border-slate-100 dark:border-white/5 h-0"></div>
              ))}
              <div className="w-full h-0"></div> {/* Bottom line */}
            </div>

            {/* Bars Container */}
            <div id="chart-container" className="relative flex items-end justify-between h-48 w-full gap-2 pt-8">
              {currentChart.map((bar, index) => (
                <div key={index} className="group flex flex-col items-center justify-end flex-1 gap-3 h-full relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                      {bar.height.replace('%', '') * 10} USD
                    </div>
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[18px] rounded-sm relative ${
                      bar.active 
                        ? 'bg-primary z-10' 
                        : 'bg-slate-200/50 dark:bg-[#1e1e2d]/60'
                    }`} 
                    style={{ 
                      height: bar.height
                    }}
                  >
                  </div>

                  {/* Label */}
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                    bar.active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Monthly Budgets */}
      <section className="mb-6 animate-slide-up delay-300">
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
      <section className="mb-8 animate-slide-up delay-400">
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
