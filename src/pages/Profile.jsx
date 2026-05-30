import { useState } from 'react';

export default function Profile() {
  const [avatar, setAvatar] = useState(
    localStorage.getItem('userAvatar') || 
    "images/Fede.jpg"
  );
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currency, setCurrency] = useState(() => {
    const code = localStorage.getItem('userCurrency') || 'ARS';
    const configs = {
      ARS: { symbol: '$', label: 'ARS (Pesos Argentinos)' },
      USD: { symbol: 'US$', label: 'USD (Dólares)' },
      EUR: { symbol: '€', label: 'EUR (Euros)' },
      CLP: { symbol: 'CLP$', label: 'CLP (Pesos Chilenos)' }
    };
    return configs[code] || configs.ARS;
  });

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

  const handleCurrencyChange = (code) => {
    const configs = {
      ARS: { symbol: '$', label: 'ARS (Pesos Argentinos)' },
      USD: { symbol: 'US$', label: 'USD (Dólares)' },
      EUR: { symbol: '€', label: 'EUR (Euros)' },
      CLP: { symbol: 'CLP$', label: 'CLP (Pesos Chilenos)' }
    };
    const selected = configs[code] || configs.ARS;
    localStorage.setItem('userCurrency', code);
    setCurrency(selected);
    window.dispatchEvent(new Event('currencyUpdate'));
    setShowCurrencyModal(false);
  };

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

  const getMovementsData = async () => {
    const fetchedMovements = [];

    // 1. Fetch Incomes
    try {
      const url = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&sheet=Ingresos';
      const response = await fetch(url, { credentials: 'omit' });
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
      console.error('Error fetching incomes for export:', e);
    }

    // 2. Fetch Expenses
    try {
      const url = 'https://docs.google.com/spreadsheets/d/1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo/gviz/tq?tqx=out:csv&sheet=Gastos';
      const response = await fetch(url, { credentials: 'omit' });
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
      console.error('Error fetching expenses for export:', e);
    }

    // Sort movements by date descending
    return fetchedMovements.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return b.fecha.localeCompare(a.fecha);
    });
  };

  const exportToCSV = (data) => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Fecha,Tipo,Concepto/Emisor,Monto,Categoría\n';
    
    data.forEach(m => {
      const isIngreso = m.tipo === 'ingreso';
      const cleanVal = m.amountStr.replace(/[$,]/g, '');
      const val = parseFloat(cleanVal);
      const amountStrFormatted = !isNaN(val) 
        ? `${isIngreso ? '' : '-'}${val}`
        : m.amountStr;

      const title = m.title.replace(/"/g, '""');
      const categoria = m.categoria.replace(/"/g, '""');
      const date = m.fecha || '';
      const type = isIngreso ? 'Ingreso' : 'Gasto';

      csvContent += `"${date}","${type}","${title}",${amountStrFormatted},"${categoria}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_vaultai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data) => {
    const rowsHtml = data.map(m => {
      const isIngreso = m.tipo === 'ingreso';
      const cleanVal = m.amountStr.replace(/[$,]/g, '');
      const val = parseFloat(cleanVal);
      const amountFormatted = !isNaN(val) 
        ? `${isIngreso ? '' : '-'}${val}`
        : m.amountStr;
      
      const typeText = isIngreso ? 'Ingreso' : 'Gasto';
      const amountStyle = isIngreso ? 'color: #10B981;' : 'color: #EF4444;';

      return `
        <tr>
          <td style="border: 1px solid #E2E8F0; padding: 10px; font-family: sans-serif; font-size: 13px;">${m.fecha || ''}</td>
          <td style="border: 1px solid #E2E8F0; padding: 10px; font-family: sans-serif; font-size: 13px;">${typeText}</td>
          <td style="border: 1px solid #E2E8F0; padding: 10px; font-family: sans-serif; font-size: 13px; font-weight: 500;">${m.title}</td>
          <td style="border: 1px solid #E2E8F0; padding: 10px; font-family: sans-serif; font-size: 13px; font-weight: bold; ${amountStyle}">${amountFormatted}</td>
          <td style="border: 1px solid #E2E8F0; padding: 10px; font-family: sans-serif; font-size: 13px;">${m.categoria}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Movimientos</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="background-color: #F8FAFC;">
        <h2 style="font-family: sans-serif; color: #0F172A; margin-bottom: 5px;">Reporte de Movimientos - Vault AI</h2>
        <p style="font-family: sans-serif; color: #64748B; font-size: 12px; margin-top: 0; margin-bottom: 20px;">
          Usuario: Federico Sastre Heer | Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}
        </p>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #4F46E5; color: white;">
              <th style="border: 1px solid #E2E8F0; padding: 12px; font-family: sans-serif; font-size: 14px; text-align: left;">Fecha</th>
              <th style="border: 1px solid #E2E8F0; padding: 12px; font-family: sans-serif; font-size: 14px; text-align: left;">Tipo</th>
              <th style="border: 1px solid #E2E8F0; padding: 12px; font-family: sans-serif; font-size: 14px; text-align: left;">Concepto / Emisor</th>
              <th style="border: 1px solid #E2E8F0; padding: 12px; font-family: sans-serif; font-size: 14px; text-align: left;">Monto</th>
              <th style="border: 1px solid #E2E8F0; padding: 12px; font-family: sans-serif; font-size: 14px; text-align: left;">Categoría</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_vaultai_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes (popups) para exportar a PDF.');
      return;
    }

    const rowsHtml = data.map(m => {
      const isIngreso = m.tipo === 'ingreso';
      const cleanVal = m.amountStr.replace(/[$,]/g, '');
      const val = parseFloat(cleanVal);
      const amountFormatted = !isNaN(val) 
        ? `${isIngreso ? '+' : '-'}${currency.symbol}${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : m.amountStr;

      const typeText = isIngreso ? 'Ingreso' : 'Gasto';
      const amountColorClass = isIngreso ? 'color-emerald' : 'color-rose';

      return `
        <tr>
          <td>${m.fecha || ''}</td>
          <td><span class="badge ${m.tipo}">${typeText}</span></td>
          <td class="font-medium">${m.title}</td>
          <td class="font-bold ${amountColorClass}">${amountFormatted}</td>
          <td>${m.categoria}</td>
        </tr>
      `;
    }).join('');

    let totalIncomes = 0;
    let totalExpenses = 0;
    data.forEach(m => {
      const cleanVal = m.amountStr.replace(/[$,]/g, '');
      const val = parseFloat(cleanVal);
      if (!isNaN(val)) {
        if (m.tipo === 'ingreso') totalIncomes += val;
        else totalExpenses += val;
      }
    });
    const balance = totalIncomes - totalExpenses;

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Movimientos - Vault AI</title>
        <meta charset="utf-8"/>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            padding: 40px;
            margin: 0;
            background: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            font-style: italic;
            letter-spacing: -0.05em;
            color: #4f46e5;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
          }
          .meta-info {
            font-size: 13px;
            color: #64748b;
            margin-top: 5px;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px 20px;
          }
          .card-title {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.05em;
            margin: 0 0 5px 0;
          }
          .card-value {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
          }
          .value-emerald { color: #10b981; }
          .value-rose { color: #ef4444; }
          .value-indigo { color: #4f46e5; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 12px 15px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 12px 15px;
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
          }
          .font-medium { font-weight: 500; }
          .font-bold { font-weight: 700; }
          .color-emerald { color: #10b981; }
          .color-rose { color: #ef4444; }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
          }
          .badge.ingreso {
            background-color: #d1fae5;
            color: #065f46;
          }
          .badge.gasto {
            background-color: #fee2e2;
            color: #991b1b;
          }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
          
          .print-btn-container {
            margin-bottom: 20px;
            text-align: right;
          }
          .print-btn {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .print-btn:hover {
            background-color: #4338ca;
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container no-print">
          <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
        </div>
        
        <div class="header">
          <div>
            <h1 class="title">Reporte de Movimientos Financieros</h1>
            <div class="meta-info">
              Usuario: Federico Sastre Heer | Exportado el: ${new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
          <div class="logo">VAULT AI</div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h4 class="card-title">Total Ingresos</h4>
            <p class="card-value value-emerald">${currency.symbol}${totalIncomes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="card">
            <h4 class="card-title">Total Gastos</h4>
            <p class="card-value value-rose">${currency.symbol}${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="card">
            <h4 class="card-title">Balance Neto</h4>
            <p class="card-value ${balance >= 0 ? 'value-emerald' : 'value-rose'}">
              ${balance >= 0 ? '+' : ''}${currency.symbol}${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Fecha</th>
              <th style="width: 15%;">Tipo</th>
              <th style="width: 35%;">Concepto / Emisor</th>
              <th style="width: 15%;">Monto</th>
              <th style="width: 20%;">Categoría</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const data = await getMovementsData();
      
      if (data.length === 0) {
        alert('No hay movimientos para exportar.');
        setExportLoading(false);
        return;
      }

      if (format === 'csv') {
        exportToCSV(data);
      } else if (format === 'excel') {
        exportToExcel(data);
      } else if (format === 'pdf') {
        exportToPDF(data);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Hubo un error al generar el reporte.');
    } finally {
      setExportLoading(false);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Federico Sastre Heer</h1>
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
          <MenuLink icon="security" color="emerald" label="Seguridad y Contraseña" isLast />
        </div>

        <h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-8 mb-2 px-1">Preferencias Financieras</h2>
        
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-lg">
          <MenuLink icon="payments" color="indigo" label="Moneda Principal" sub={currency.label} onClick={() => setShowCurrencyModal(true)} />
          <MenuLink icon="download" color="rose" label="Exportar Reportes" sub="PDF, Excel, CSV" isLast onClick={() => setShowExportModal(true)} />
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

      {/* Modal de Exportar Reportes */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !exportLoading && setShowExportModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100 opacity-100 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">download</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Exportar Reporte</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Selecciona el formato en el que deseas descargar tus movimientos de cuenta hasta la fecha.
                </p>
              </div>
            </div>

            {exportLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Generando reporte...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Documento PDF</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Formato de lectura y presentación</p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">table_chart</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Excel (Hoja de cálculo)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Hoja de cálculo formateada (.xls)</p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">csv</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Archivo CSV</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Valores separados por comas (UTF-8)</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="mt-2 w-full py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cambio de Moneda */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCurrencyModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100 opacity-100 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                <span className="material-symbols-outlined text-4xl">payments</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Moneda Principal</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Selecciona la moneda principal para mostrar tus balances y movimientos.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { code: 'ARS', label: 'ARS (Pesos Argentinos)', symbol: '$' },
                { code: 'USD', label: 'USD (Dólares)', symbol: 'US$' },
                { code: 'EUR', label: 'EUR (Euros)', symbol: '€' },
                { code: 'CLP', label: 'CLP (Pesos Chilenos)', symbol: 'CLP$' }
              ].map(c => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    currency.code === c.code 
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-sm font-semibold">{c.label}</span>
                  <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{c.symbol}</span>
                </button>
              ))}

              <button
                onClick={() => setShowCurrencyModal(false)}
                className="mt-2 w-full py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ icon, color, label, sub, isLast, onClick }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    rose: 'bg-rose-500/10 text-rose-500',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-300',
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a href="#" onClick={handleClick} className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!isLast ? 'border-b border-slate-200 dark:border-border-dark' : ''}`}>
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
