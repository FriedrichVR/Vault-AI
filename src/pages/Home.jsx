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
    try {
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&gid=2067457005';
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headers = parseCSVRow(lines[0]);
        const rowData = parseCSVRow(lines[1]);
        
        // Find indices dynamically based on header names
        const ingresosIndex = headers.findIndex(h => h.trim().toLowerCase().includes('ingreso'));
        const gastosIndex = headers.findIndex(h => h.trim().toLowerCase().includes('gasto'));
        const patrimonioIndex = headers.findIndex(h => h.trim().toLowerCase().includes('patrimonio'));

        const targetIngresosIndex = ingresosIndex !== -1 ? ingresosIndex : 0;
        const targetGastosIndex = gastosIndex !== -1 ? gastosIndex : 1;
        const targetPatrimonioIndex = patrimonioIndex !== -1 ? patrimonioIndex : 2;

        const ingresosStr = rowData[targetIngresosIndex];
        const gastosStr = rowData[targetGastosIndex];
        const patrimonioStr = rowData[targetPatrimonioIndex];

        if (ingresosStr) {
          const cleanValue = ingresosStr.replace(/[$,]/g, '');
          const val = parseFloat(cleanValue);
          if (!isNaN(val)) {
            setIncome(val);
            localStorage.setItem('user_income', val.toString());
          }
        }

        if (gastosStr) {
          const cleanValue = gastosStr.replace(/[$,]/g, '');
          const val = parseFloat(cleanValue);
          if (!isNaN(val)) {
            setGastos(val);
            localStorage.setItem('user_gastos', val.toString());
          }
        }

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
      console.error('Error fetching financial data from Google Sheet:', error);
    }
  };

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
    
    // Fetch financial data on mount
    fetchFinancialData();

    // Poll financial data every 1 minute (60000 ms)
    const interval = setInterval(() => {
      fetchFinancialData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);



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



  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Main Balance Section */}
      <section className="mb-6 animate-slide-up">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-[0.15em] mb-1 uppercase">Patrimonio Neto Consolidado</p>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">
            ${patrimonioInteger}<span className="text-slate-500 dark:text-slate-400">.{patrimonioDecimal}</span>
          </h1>
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
    </div>
  );
}
