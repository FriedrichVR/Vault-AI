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
  
  // Dynamic Income State
  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem('user_income');
    return saved ? parseFloat(saved) : 316000.00;
  });

  // Dynamic Gastos State
  const [gastos, setGastos] = useState(() => {
    const saved = localStorage.getItem('user_gastos');
    return saved ? parseFloat(saved) : 1051819.63;
  });
  
  // Dynamic Patrimonio Neto State
  const [patrimonio, setPatrimonio] = useState(() => {
    const saved = localStorage.getItem('user_patrimonio');
    return saved ? parseFloat(saved) : 982658.37;
  });

  const [showModal, setShowModal] = useState(false);
  const [tempIncome, setTempIncome] = useState(income.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Helper to parse CSV row respecting double quotes containing commas
  const parseCSVRow = (row) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Helper to fetch consolidated net worth, income, and expenses from Google Sheets
  const fetchFinancialData = async () => {
    // 1. Fetch Patrimonio Neto from 'resumen de flujo' tab
    try {
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&sheet=resumen%20de%20flujo';
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headers = parseCSVRow(lines[0]);
        const rowData = parseCSVRow(lines[1]);
        const patrimonioIndex = headers.findIndex(h => h.trim().toLowerCase().includes('patrimonio'));
        const targetIndex = patrimonioIndex !== -1 ? patrimonioIndex : 3;
        const patrimonioStr = rowData[targetIndex];
        if (patrimonioStr) {
          const cleanValue = patrimonioStr.replace(/[$,]/g, '');
          const val = parseFloat(cleanValue);
          if (!isNaN(val)) {
            setPatrimonio(val);
            localStorage.setItem('user_patrimonio', val.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching patrimonio from Google Sheet:', error);
    }

    // 2. Fetch transactions from base tab to calculate incomes and expenses
    try {
      const transactionsUrl = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv';
      const response = await fetch(transactionsUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headers = parseCSVRow(lines[0]);
        const tipoIndex = headers.findIndex(h => h.trim().toLowerCase().startsWith('tipo'));
        const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
        
        const targetTipoIndex = tipoIndex !== -1 ? tipoIndex : 7;
        const targetMontoIndex = montoIndex !== -1 ? montoIndex : 3;

        let calculatedIncome = 0;
        let calculatedGastos = 0;

        const rows = lines.slice(1);
        rows.forEach(row => {
          const cols = parseCSVRow(row);
          if (cols.length > Math.max(targetTipoIndex, targetMontoIndex)) {
            const tipo = cols[targetTipoIndex] ? cols[targetTipoIndex].trim().toLowerCase() : '';
            const montoStr = cols[targetMontoIndex];
            if (montoStr) {
              const cleanValue = montoStr.replace(/[$,]/g, '');
              const val = parseFloat(cleanValue);
              if (!isNaN(val)) {
                if (tipo === 'ingresos') {
                  calculatedIncome += val;
                } else if (tipo === 'gastos') {
                  calculatedGastos += val;
                }
              }
            }
          }
        });

        setIncome(calculatedIncome);
        setGastos(calculatedGastos);
        localStorage.setItem('user_income', calculatedIncome.toString());
        localStorage.setItem('user_gastos', calculatedGastos.toString());
      }
    } catch (error) {
      console.error('Error fetching transactions from Google Sheet:', error);
    }
  };

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
    
    // Fetch financial data on mount
    fetchFinancialData();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const currentChart = CHART_DATA[activePeriod];

  // Dynamic Flow and Progress Calculations
  const netFlow = income - gastos;
  const maxVal = Math.max(income, gastos, 15000);
  const incomePercent = Math.min(100, Math.max(5, Math.round((income / maxVal) * 100)));
  const gastosPercent = Math.min(100, Math.max(5, Math.round((gastos / maxVal) * 100)));
  
  const netFlowFormatted = netFlow >= 0 
    ? `$${netFlow.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-$${Math.abs(netFlow).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Split integer and decimal parts of consolidated net worth for styling
  const formattedPatrimonio = patrimonio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const patrimonioParts = formattedPatrimonio.split('.');
  const patrimonioInteger = patrimonioParts[0];
  const patrimonioDecimal = patrimonioParts[1];

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    const newAmount = parseFloat(tempIncome);
    if (isNaN(newAmount) || newAmount < 0) {
      setNotification({
        type: 'error',
        message: 'Por favor, ingresa un monto de ingresos válido.'
      });
      return;
    }

    setIsSubmitting(true);
    
    const WEBHOOK_URL = import.meta.env.DEV
      ? "/api-n8n/webhook-test/a9a37533-afa3-4395-b44a-0e91adaa46ed"
      : "https://n8n.srv1202174.hstgr.cloud/webhook-test/a9a37533-afa3-4395-b44a-0e91adaa46ed";

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingreso: newAmount,
          amount: newAmount,
          type: 'update_income',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIncome(newAmount);
        localStorage.setItem('user_income', newAmount.toString());
        setShowModal(false);
        setNotification({
          type: 'success',
          message: 'Ingresos actualizados correctamente y enviados a N8N.',
        });
        // Trigger a background refetch of Patrimonio from Sheet after N8N webhook trigger
        setTimeout(() => {
          fetchFinancialData();
        }, 2000);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en el servidor N8N');
      }
    } catch (error) {
      console.error('Error al enviar ingresos:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al conectar con N8N. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Main Balance Section */}
      <section className="mb-6 animate-slide-up">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-[0.15em] mb-1 uppercase">Patrimonio Neto Consolidado</p>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">
            ${patrimonioInteger}<span className="text-slate-500 dark:text-slate-400">.{patrimonioDecimal}</span>
          </h1>
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
                <p className="text-xl font-bold text-emerald-400">
                  ${income.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <button
                  onClick={() => {
                    setTempIncome(income.toString());
                    setShowModal(true);
                  }}
                  className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Editar ingresos"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
              <div className="w-full bg-slate-200 dark:bg-border-dark h-1 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${incomePercent}%` }}></div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Gastos</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xl font-bold text-rose-500">
                  ${gastos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-border-dark h-1 rounded-full overflow-hidden flex">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${gastosPercent}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
            Tu flujo neto es <span className={`font-semibold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{netFlowFormatted}</span> {netFlow >= 0 ? 'mayor' : 'menor'} que el mes pasado.
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

      {/* Modal para Editar Ingresos */}
      {showModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actualizar Ingresos</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Ingresa el nuevo monto de tus ingresos mensuales. Se guardará localmente y se enviará al webhook de N8N.
            </p>

            <form onSubmit={handleSaveIncome} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monto de Ingreso
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 dark:text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    autoFocus
                    className="w-full pl-8 pr-4 py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-bold outline-none focus:border-primary dark:focus:border-primary transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de Notificación */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-scale-in">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            notification.type === 'success'
              ? 'bg-emerald-500/90 border-emerald-400/20 text-white'
              : 'bg-rose-500/90 border-rose-400/20 text-white'
          }`}>
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">
                {notification.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">
                {notification.type === 'success' ? 'Éxito' : 'Error'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
