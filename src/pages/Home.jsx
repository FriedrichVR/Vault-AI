import { useState, useEffect } from 'react';

// Static Data moved outside component to prevent re-creation on render
const MOCK_CHART_DATA = {
  ingresos: {
    '1s': [
      { label: 'Lun', height: '40%', active: false },
      { label: 'Mar', height: '30%', active: false },
      { label: 'Mié', height: '80%', active: false },
      { label: 'Jue', height: '35%', active: false },
      { label: 'Vie', height: '90%', active: true },
      { label: 'Sáb', height: '20%', active: false },
      { label: 'Dom', height: '10%', active: false },
    ],
    '1m': [
      { label: 'Sem 1', height: '60%', active: false },
      { label: 'Sem 2', height: '80%', active: false },
      { label: 'Sem 3', height: '45%', active: true },
      { label: 'Sem 4', height: '70%', active: false },
    ],
    '1a': [
      { label: 'E', height: '50%', active: false }, { label: 'F', height: '60%', active: false },
      { label: 'M', height: '40%', active: false }, { label: 'A', height: '70%', active: false },
      { label: 'M', height: '85%', active: true }, { label: 'J', height: '30%', active: false },
      { label: 'J', height: '45%', active: false }, { label: 'A', height: '55%', active: false },
      { label: 'S', height: '65%', active: false }, { label: 'O', height: '50%', active: false },
      { label: 'N', height: '75%', active: false }, { label: 'D', height: '80%', active: false },
    ]
  },
  gastos: {
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
  }
};

const getSpreadsheetId = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
  if (!envUrl) return '1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo';
  const cleanUrl = envUrl.trim().replace(/^['"]|['"]$/g, '');
  const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : cleanUrl;
};

const getMockDate = (title, amountStr, index, tipo) => {
  const cleanTitle = title.trim();
  if (cleanTitle === 'Sueldo1') return '2026-05-29';
  if (cleanTitle === 'XR') return '2026-05-28';
  if (cleanTitle === 'Sal24') return '2026-05-27';
  if (cleanTitle === 'Super LA') {
    const cleanVal = amountStr.replace(/[$,]/g, '');
    const val = parseFloat(cleanVal);
    if (val === 555600) return '2026-05-26';
    if (val === 23471563) return '2026-05-25';
  }
  const d = new Date();
  d.setDate(d.getDate() - (index + (tipo === 'gasto' ? 3 : 0)));
  return d.toISOString().slice(0, 10);
};

const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const ymdMatch = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const [_, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
};

export default function Home() {
  const [incomeMovements, setIncomeMovements] = useState([]);
  const [expenseMovements, setExpenseMovements] = useState([]);
  const [chartMode, setChartMode] = useState('gastos'); // 'ingresos' or 'gastos'
  const [currentDate, setCurrentDate] = useState('');
  const [activePeriod, setActivePeriod] = useState('1s');
  const [currency, setCurrency] = useState(() => {
    const code = localStorage.getItem('userCurrency') || 'ARS';
    const configs = {
      ARS: { code: 'ARS', symbol: '$', label: 'ARS (Pesos Argentinos)' },
      USD: { code: 'USD', symbol: 'US$', label: 'USD (Dólares)' },
      EUR: { code: 'EUR', symbol: '€', label: 'EUR (Euros)' },
      CLP: { code: 'CLP', symbol: 'CLP$', label: 'CLP (Pesos Chilenos)' }
    };
    return configs[code] || configs.ARS;
  });

  useEffect(() => {
    const handleCurrencyUpdate = () => {
      const code = localStorage.getItem('userCurrency') || 'ARS';
      const configs = {
        ARS: { code: 'ARS', symbol: '$', label: 'ARS (Pesos Argentinos)' },
        USD: { code: 'USD', symbol: 'US$', label: 'USD (Dólares)' },
        EUR: { code: 'EUR', symbol: '€', label: 'EUR (Euros)' },
        CLP: { code: 'CLP', symbol: 'CLP$', label: 'CLP (Pesos Chilenos)' }
      };
      setCurrency(configs[code] || configs.ARS);
    };
    window.addEventListener('currencyUpdate', handleCurrencyUpdate);
    return () => window.removeEventListener('currencyUpdate', handleCurrencyUpdate);
  }, []);
  
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
    let totalIncomes = 0;
    let totalExpenses = 0;
    const overrides = JSON.parse(localStorage.getItem('movements_overrides') || '{}');
    const sheetId = getSpreadsheetId();
    const fetchedIncomes = [];
    const fetchedExpenses = [];

    // 1. Fetch Incomes
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Ingresos`;
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headers = parseCSVRow(lines[0]);
        const emisorIndex = headers.findIndex(h => h.trim().toLowerCase().includes('emisor'));
        const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
        const fechaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('fecha'));
        const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
        const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;

        const rows = lines.slice(1);
        rows.forEach((row, idx) => {
          const cols = parseCSVRow(row);
          const emisor = cols[targetEmisorIndex];
          const montoStr = cols[targetMontoIndex];
          if (emisor && montoStr) {
            let fecha = fechaIndex !== -1 && cols[fechaIndex] ? cols[fechaIndex].trim() : '';
            if (!fecha) {
              fecha = getMockDate(emisor, montoStr, idx, 'ingreso');
            }
            
            const movementId = `ingreso-${idx}`;
            const cleanVal = overrides[movementId]?.amountStr !== undefined 
              ? overrides[movementId].amountStr.replace(/[$,]/g, '')
              : montoStr.replace(/[$,]/g, '');
            const cleanFecha = overrides[movementId]?.fecha !== undefined
              ? overrides[movementId].fecha
              : fecha;
            const val = parseFloat(cleanVal);
            if (!isNaN(val)) {
              totalIncomes += val;
              fetchedIncomes.push({ fecha: cleanFecha, val });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }

    // 2. Fetch Expenses
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Gastos`;
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headers = parseCSVRow(lines[0]);
        const emisorIndex = headers.findIndex(h => h.trim().toLowerCase().includes('emisor'));
        const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
        const fechaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('fecha'));
        const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
        const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;

        const rows = lines.slice(1);
        rows.forEach((row, idx) => {
          const cols = parseCSVRow(row);
          const emisor = cols[targetEmisorIndex];
          const montoStr = cols[targetMontoIndex];
          if (emisor && montoStr) {
            let fecha = fechaIndex !== -1 && cols[fechaIndex] ? cols[fechaIndex].trim() : '';
            if (!fecha) {
              fecha = getMockDate(emisor, montoStr, idx, 'gasto');
            }

            const movementId = `gasto-${idx}`;
            const cleanVal = overrides[movementId]?.amountStr !== undefined 
              ? overrides[movementId].amountStr.replace(/[$,]/g, '')
              : montoStr.replace(/[$,]/g, '');
            const cleanFecha = overrides[movementId]?.fecha !== undefined
              ? overrides[movementId].fecha
              : fecha;
            const val = parseFloat(cleanVal);
            if (!isNaN(val)) {
              totalExpenses += val;
              fetchedExpenses.push({ fecha: cleanFecha, val });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }

    // 3. Fetch Scans
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Scans`;
      const response = await fetch(url, { credentials: 'omit' });
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const headers = parseCSVRow(lines[0]);
          const emisorIndex = headers.findIndex(h => h.trim().toLowerCase().includes('emisor'));
          const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
          const fechaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('fecha') || h.trim().toLowerCase().includes('emisi'));
          const tipoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('tipo'));

          const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
          const targetMontoIndex = montoIndex !== -1 ? montoIndex : 3;
          const targetFechaIndex = fechaIndex !== -1 ? fechaIndex : 2;
          const targetTipoIndex = tipoIndex !== -1 ? tipoIndex : 7;

          const rows = lines.slice(1);
          rows.forEach((row, idx) => {
            const cols = parseCSVRow(row);
            const emisor = cols[targetEmisorIndex];
            const montoStr = cols[targetMontoIndex];
            const tipoStr = targetTipoIndex !== -1 && cols[targetTipoIndex] ? cols[targetTipoIndex].trim().toLowerCase() : 'gasto';
            const isIngreso = tipoStr.includes('ingreso');

            if (emisor && montoStr) {
              let fecha = targetFechaIndex !== -1 && cols[targetFechaIndex] ? cols[targetFechaIndex].trim() : '';
              if (!fecha) {
                fecha = getMockDate(emisor, montoStr, idx, isIngreso ? 'ingreso' : 'gasto');
              }

              const movementId = `scan-${idx}`;
              const cleanVal = overrides[movementId]?.amountStr !== undefined 
                ? overrides[movementId].amountStr.replace(/[$,]/g, '')
                : montoStr.replace(/[$,]/g, '');
              const cleanFecha = overrides[movementId]?.fecha !== undefined
                ? overrides[movementId].fecha
                : fecha;
              const val = parseFloat(cleanVal);
              if (!isNaN(val)) {
                if (isIngreso) {
                  totalIncomes += val;
                  fetchedIncomes.push({ fecha: cleanFecha, val });
                } else {
                  totalExpenses += val;
                  fetchedExpenses.push({ fecha: cleanFecha, val });
                }
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }

    // Update Movements List States
    setIncomeMovements(fetchedIncomes);
    setExpenseMovements(fetchedExpenses);

    // 3. Update States and LocalStorage
    setIncome(totalIncomes);
    setGastos(totalExpenses);
    const calculatedPatrimonio = totalIncomes - totalExpenses;
    setPatrimonio(calculatedPatrimonio);

    localStorage.setItem('user_income', totalIncomes.toString());
    localStorage.setItem('user_gastos', totalExpenses.toString());
    localStorage.setItem('user_patrimonio', calculatedPatrimonio.toString());
  };

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
    
    // Fetch financial data on mount
    fetchFinancialData();

    // Listen to movement modifications
    const handleMovementsUpdate = () => {
      fetchFinancialData();
    };
    window.addEventListener('movementsUpdate', handleMovementsUpdate);

    // Poll financial data every 1 minute (60000 ms)
    const interval = setInterval(() => {
      fetchFinancialData();
    }, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('movementsUpdate', handleMovementsUpdate);
    };
  }, []);



  const getChartData = () => {
    const movements = chartMode === 'ingresos' ? incomeMovements : expenseMovements;
    const total = movements.reduce((acc, curr) => acc + curr.val, 0);
    if (total === 0) {
      return MOCK_CHART_DATA[chartMode][activePeriod];
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    if (activePeriod === '1s') {
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const values = Array(7).fill(0);
      
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      
      movements.forEach(m => {
        if (!m.fecha) return;
        const inputDate = formatDateToInput(m.fecha);
        const d = new Date(inputDate + 'T12:00:00');
        if (d >= startOfWeek && d <= endOfWeek) {
          const dayIdx = (d.getDay() + 6) % 7;
          values[dayIdx] += m.val;
        }
      });
      
      const maxVal = Math.max(...values, 100);
      const currentDayIdx = (now.getDay() + 6) % 7;
      
      return days.map((label, idx) => ({
        label,
        val: values[idx],
        height: `${Math.max(5, Math.round((values[idx] / maxVal) * 100))}%`,
        active: idx === currentDayIdx
      }));
    }
    
    if (activePeriod === '1m') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      const values = Array(4).fill(0);
      
      movements.forEach(m => {
        if (!m.fecha) return;
        const inputDate = formatDateToInput(m.fecha);
        const d = new Date(inputDate + 'T12:00:00');
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          const weekIdx = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          values[weekIdx] += m.val;
        }
      });
      
      const maxVal = Math.max(...values, 100);
      const currentWeekIdx = Math.min(3, Math.floor((now.getDate() - 1) / 7));
      
      return weeks.map((label, idx) => ({
        label,
        val: values[idx],
        height: `${Math.max(5, Math.round((values[idx] / maxVal) * 100))}%`,
        active: idx === currentWeekIdx
      }));
    }
    
    if (activePeriod === '1a') {
      const monthsLabels = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      const values = Array(12).fill(0);
      
      movements.forEach(m => {
        if (!m.fecha) return;
        const inputDate = formatDateToInput(m.fecha);
        const d = new Date(inputDate + 'T12:00:00');
        if (d.getFullYear() === currentYear) {
          const monthIdx = d.getMonth();
          values[monthIdx] += m.val;
        }
      });
      
      const maxVal = Math.max(...values, 100);
      const currentMonthIdx = now.getMonth();
      
      return monthsLabels.map((label, idx) => ({
        label,
        val: values[idx],
        height: `${Math.max(5, Math.round((values[idx] / maxVal) * 100))}%`,
        active: idx === currentMonthIdx
      }));
    }
    return [];
  };

  const currentChart = getChartData();

  // Dynamic Flow and Progress Calculations
  const netFlow = income - gastos;
  const maxVal = Math.max(income, gastos, 15000);
  const incomePercent = Math.min(100, Math.max(5, Math.round((income / maxVal) * 100)));
  const gastosPercent = Math.min(100, Math.max(5, Math.round((gastos / maxVal) * 100)));
  
  const netFlowFormatted = netFlow >= 0 
    ? `${currency.symbol}${netFlow.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-${currency.symbol}${Math.abs(netFlow).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Split integer and decimal parts of consolidated net worth for styling
  const formattedPatrimonio = patrimonio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const patrimonioParts = formattedPatrimonio.split('.');
  const patrimonioInteger = patrimonioParts[0];
  const patrimonioDecimal = patrimonioParts[1];



  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Main Balance Section */}
      <section className="mb-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-[0.15em] uppercase">Patrimonio Neto Consolidado</p>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">{currency.code}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">
            {currency.symbol}{patrimonioInteger}<span className="text-slate-500 dark:text-slate-400">.{patrimonioDecimal}</span>
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
                  {currency.symbol}{income.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {currency.symbol}{gastos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        {/* Header Area */}
        <div className="flex items-start justify-between mb-8 px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Tendencias de {chartMode === 'ingresos' ? 'Ingresos' : 'Gastos'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fecha actual</p>
            <span id="current-date-display" className="text-[10px] font-medium tracking-wider text-slate-500">
              {currentDate}
            </span>
          </div>
          {/* Time & Flow Toggles - Modern Pill Style */}
          <div className="flex flex-col items-end gap-2">
            {/* Period Toggles (1s, 1m, 1a) */}
            <div id="chart-toggles" className="flex w-[150px] gap-0.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
              {['1s', '1m', '1a'].map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`${
                    activePeriod === period
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'
                  } flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wider text-center flex items-center justify-center`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Flow Toggles (Ingresos / Gastos) */}
            <div className="flex w-[150px] gap-0.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
              <button
                onClick={() => setChartMode('ingresos')}
                className={`${
                  chartMode === 'ingresos'
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'
                } flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wider text-center flex items-center justify-center`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setChartMode('gastos')}
                className={`${
                  chartMode === 'gastos'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'
                } flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wider text-center flex items-center justify-center`}
              >
                Gastos
              </button>
            </div>
          </div>
        </div>
        
        {/* Bar Chart Section - Card Like Container */}
        <div className="relative p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-lg">
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
                    {currency.symbol}{(bar.val !== undefined ? Math.round(bar.val) : Math.round(parseFloat(bar.height) * 120)).toLocaleString('es-ES')}
                  </div>
                </div>

                {/* Bar */}
                <div 
                  className={`w-full max-w-[18px] rounded-t-sm relative transition-all duration-300 ${
                    chartMode === 'ingresos'
                      ? bar.active
                        ? 'bg-emerald-500 z-10 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-emerald-500/25 dark:bg-emerald-500/20 hover:bg-emerald-500/45'
                      : bar.active
                        ? 'bg-rose-500 z-10 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'bg-rose-500/25 dark:bg-rose-500/20 hover:bg-rose-500/45'
                  }`} 
                  style={{ 
                    height: bar.height
                  }}
                >
                </div>

                {/* Label */}
                <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
                  bar.active 
                    ? chartMode === 'ingresos' ? 'text-emerald-500' : 'text-rose-500' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
