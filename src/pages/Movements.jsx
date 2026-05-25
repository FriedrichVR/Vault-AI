import { useState, useEffect } from 'react';

export default function Movements() {
  const [filter, setFilter] = useState('Todos'); // 'Todos', 'Ingresos', 'Gastos'
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const fetchedMovements = [];

      // 1. Fetch Incomes
      try {
        const url = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&sheet=Ingresos';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const headers = parseCSVRow(lines[0]);
          const emisorIndex = headers.findIndex(h => h.trim().toLowerCase().includes('emisor'));
          const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
          const fechaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('fecha'));
          const categoriaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('categor'));

          const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
          const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;
          const targetFechaIndex = fechaIndex !== -1 ? fechaIndex : -1;
          const targetCategoriaIndex = categoriaIndex !== -1 ? categoriaIndex : -1;

          const rows = lines.slice(1);
          rows.forEach(row => {
            const cols = parseCSVRow(row);
            const emisor = cols[targetEmisorIndex];
            const montoStr = cols[targetMontoIndex];
            if (emisor && montoStr) {
              const fecha = targetFechaIndex !== -1 && cols[targetFechaIndex] ? cols[targetFechaIndex].trim() : '';
              const categoria = targetCategoriaIndex !== -1 && cols[targetCategoriaIndex] ? cols[targetCategoriaIndex].trim() : '';
              fetchedMovements.push({
                title: emisor,
                amountStr: montoStr,
                tipo: 'ingreso',
                fecha,
                categoria: categoria || 'Ingreso Recibido',
              });
            }
          });
        }
      } catch (e) {
        console.error('Error fetching incomes:', e);
      }

      // 2. Fetch Expenses
      try {
        const url = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&sheet=Gastos';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const headers = parseCSVRow(lines[0]);
          const emisorIndex = headers.findIndex(h => h.trim().toLowerCase().includes('emisor'));
          const montoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('monto'));
          const fechaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('fecha'));
          const categoriaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('categor'));

          const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
          const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;
          const targetFechaIndex = fechaIndex !== -1 ? fechaIndex : -1;
          const targetCategoriaIndex = categoriaIndex !== -1 ? categoriaIndex : -1;

          const rows = lines.slice(1);
          rows.forEach(row => {
            const cols = parseCSVRow(row);
            const emisor = cols[targetEmisorIndex];
            const montoStr = cols[targetMontoIndex];
            if (emisor && montoStr) {
              const fecha = targetFechaIndex !== -1 && cols[targetFechaIndex] ? cols[targetFechaIndex].trim() : '';
              const categoria = targetCategoriaIndex !== -1 && cols[targetCategoriaIndex] ? cols[targetCategoriaIndex].trim() : '';
              fetchedMovements.push({
                title: emisor,
                amountStr: montoStr,
                tipo: 'gasto',
                fecha,
                categoria: categoria || 'Gasto Realizado',
              });
            }
          });
        }
      } catch (e) {
        console.error('Error fetching expenses:', e);
      }

      setMovements(fetchedMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesFilter = filter === 'Todos' 
      ? true 
      : filter === 'Ingresos' 
        ? m.tipo === 'ingreso' 
        : m.tipo === 'gasto';

    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort movements by date descending (empty dates at the end)
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    if (!a.fecha) return 1;
    if (!b.fecha) return -1;
    return b.fecha.localeCompare(a.fecha);
  });

  const formatDateHeader = (dateStr) => {
    if (!dateStr) return 'Últimos Movimientos';
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return dateStr;
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options).toUpperCase();
  };

  // Group movements by formatted date
  const groups = {};
  sortedMovements.forEach(m => {
    const header = formatDateHeader(m.fecha);
    if (!groups[header]) {
      groups[header] = [];
    }
    groups[header].push(m);
  });

  return (
    <div className="flex flex-col">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
          <input 
            className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500" 
            placeholder="Buscar transacciones..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setFilter('Todos')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'Todos' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 hover:border-slate-600'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('Ingresos')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'Ingresos' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 hover:border-slate-600'
            }`}
          >
            Ingresos
          </button>
          <button 
            onClick={() => setFilter('Gastos')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'Gastos' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 hover:border-slate-600'
            }`}
          >
            Gastos
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(groups).length > 0 ? (
          Object.keys(groups).map(header => (
            <div key={header}>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">{header}</h2>
              <div className="space-y-1">
                {groups[header].map((movement, index) => {
                  const isIngreso = movement.tipo === 'ingreso';
                  const cleanVal = movement.amountStr.replace(/[$,]/g, '');
                  const val = parseFloat(cleanVal);
                  const formattedAmount = !isNaN(val) 
                    ? `${isIngreso ? '+' : '-'}$${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : movement.amountStr;

                  return (
                    <MovementItem 
                      key={index}
                      icon={isIngreso ? 'account_balance_wallet' : 'local_mall'} 
                      iconBg={isIngreso ? 'primary' : 'red'} 
                      title={movement.title} 
                      desc={movement.categoria} 
                      amount={formattedAmount} 
                      amountColor={isIngreso ? 'emerald' : 'slate'}
                      status="Analizado" 
                      statusBg="emerald" 
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No hay movimientos registrados.</p>
        )}
      </div>
    </div>
  );
}

function MovementItem({ icon, iconBg, title, desc, amount, amountColor, status, statusBg }) {
  const bgClasses = {
    red: 'bg-red-500/10 border-red-500/20 text-red-500',
    slate: 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-100',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${bgClasses[iconBg]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${amountColor === 'emerald' ? 'text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>{amount}</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${bgClasses[statusBg]}`}>{status}</span>
      </div>
    </div>
  );
}
