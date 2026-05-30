import { useState, useEffect } from 'react';

// Helper to assign a mock date if the sheet doesn't provide one
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
  // Generic fallback: today minus index days
  const d = new Date();
  d.setDate(d.getDate() - (index + (tipo === 'gasto' ? 3 : 0)));
  return d.toISOString().slice(0, 10);
};

const getSpreadsheetId = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
  if (!envUrl) return '1RXLR_5kmdVgLP9Mej6E7UZKHYuZsCIFrkKailYUVnDo';
  const cleanUrl = envUrl.trim().replace(/^['"]|['"]$/g, '');
  const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : cleanUrl;
};

const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  
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
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return '';
};

export default function Movements() {
  const [filter, setFilter] = useState('Todos'); // 'Todos', 'Ingresos', 'Gastos'
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [savingToSheet, setSavingToSheet] = useState(false);

  useEffect(() => {
    if (editingMovement) {
      const cleanVal = editingMovement.amountStr.replace(/[$,]/g, '');
      const val = parseFloat(cleanVal);
      setEditAmount(isNaN(val) ? '' : val.toString());
      setEditDate(formatDateToInput(editingMovement.originalFecha || editingMovement.fecha || ''));
    } else {
      setEditAmount('');
      setEditDate('');
    }
  }, [editingMovement]);
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

  useEffect(() => {
    const handleCurrencyUpdate = () => {
      const code = localStorage.getItem('userCurrency') || 'ARS';
      const configs = {
        ARS: { symbol: '$', label: 'ARS (Pesos Argentinos)' },
        USD: { symbol: 'US$', label: 'USD (Dólares)' },
        EUR: { symbol: '€', label: 'EUR (Euros)' },
        CLP: { symbol: 'CLP$', label: 'CLP (Pesos Chilenos)' }
      };
      setCurrency(configs[code] || configs.ARS);
    };
    window.addEventListener('currencyUpdate', handleCurrencyUpdate);
    return () => window.removeEventListener('currencyUpdate', handleCurrencyUpdate);
  }, []);

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
      const sheetId = getSpreadsheetId();

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
          const categoriaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('categor'));

          const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
          const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;
          const targetFechaIndex = fechaIndex !== -1 ? fechaIndex : -1;
          const targetCategoriaIndex = categoriaIndex !== -1 ? categoriaIndex : -1;

          const rows = lines.slice(1);
          rows.forEach((row, idx) => {
            const cols = parseCSVRow(row);
            const emisor = cols[targetEmisorIndex];
            const montoStr = cols[targetMontoIndex];
            if (emisor && montoStr) {
              let fecha = targetFechaIndex !== -1 && cols[targetFechaIndex] ? cols[targetFechaIndex].trim() : '';
              const categoria = targetCategoriaIndex !== -1 && cols[targetCategoriaIndex] ? cols[targetCategoriaIndex].trim() : '';
              
              if (!fecha) {
                fecha = getMockDate(emisor, montoStr, idx, 'ingreso');
              }

              fetchedMovements.push({
                id: `ingreso-${idx}`,
                sheetRow: idx + 2,
                title: emisor,
                amountStr: montoStr,
                originalAmountStr: montoStr,
                originalFecha: fecha,
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
          const categoriaIndex = headers.findIndex(h => h.trim().toLowerCase().includes('categor'));

          const targetEmisorIndex = emisorIndex !== -1 ? emisorIndex : 0;
          const targetMontoIndex = montoIndex !== -1 ? montoIndex : 1;
          const targetFechaIndex = fechaIndex !== -1 ? fechaIndex : -1;
          const targetCategoriaIndex = categoriaIndex !== -1 ? categoriaIndex : -1;

          const rows = lines.slice(1);
          rows.forEach((row, idx) => {
            const cols = parseCSVRow(row);
            const emisor = cols[targetEmisorIndex];
            const montoStr = cols[targetMontoIndex];
            if (emisor && montoStr) {
              let fecha = targetFechaIndex !== -1 && cols[targetFechaIndex] ? cols[targetFechaIndex].trim() : '';
              const categoria = targetCategoriaIndex !== -1 && cols[targetCategoriaIndex] ? cols[targetCategoriaIndex].trim() : '';
              
              if (!fecha) {
                fecha = getMockDate(emisor, montoStr, idx, 'gasto');
              }

              fetchedMovements.push({
                id: `gasto-${idx}`,
                sheetRow: idx + 2,
                title: emisor,
                amountStr: montoStr,
                originalAmountStr: montoStr,
                originalFecha: fecha,
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

      const overrides = JSON.parse(localStorage.getItem('movements_overrides') || '{}');
      const mergedMovements = fetchedMovements.map(m => {
        if (overrides[m.id]) {
          return {
            ...m,
            amountStr: overrides[m.id].amountStr !== undefined ? overrides[m.id].amountStr : m.amountStr,
            fecha: overrides[m.id].fecha !== undefined ? overrides[m.id].fecha : m.fecha
          };
        }
        return m;
      });
      setMovements(mergedMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMovement) return;
    const cleanAmount = editAmount.trim();
    const cleanDate = editDate.trim();
    if (!cleanAmount || isNaN(parseFloat(cleanAmount))) {
      alert('Por favor, ingresa un monto válido.');
      return;
    }
    if (!cleanDate) {
      alert('Por favor, ingresa una fecha válida.');
      return;
    }

    let appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      appsScriptUrl = appsScriptUrl.trim().replace(/^['"]|['"]$/g, '');
      try {
        setSavingToSheet(true);
        const sheetName = editingMovement.tipo === 'ingreso' ? 'Ingresos' : 'Gastos';
        const payload = {
          sheet: sheetName,
          row: editingMovement.sheetRow,
          amount: parseFloat(cleanAmount),
          date: cleanDate
        };

        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        alert('Error al sincronizar con Google Sheets. Los cambios se aplicarán solo de forma local.');
      } finally {
        setSavingToSheet(false);
      }
    }

    const overrides = JSON.parse(localStorage.getItem('movements_overrides') || '{}');
    overrides[editingMovement.id] = {
      amountStr: cleanAmount,
      fecha: cleanDate
    };
    localStorage.setItem('movements_overrides', JSON.stringify(overrides));
    
    setMovements(prev => prev.map(m => {
      if (m.id === editingMovement.id) {
        return {
          ...m,
          amountStr: cleanAmount,
          fecha: cleanDate
        };
      }
      return m;
    }));

    window.dispatchEvent(new Event('movementsUpdate'));
    setEditingMovement(null);
  };

  const handleResetEdit = async () => {
    if (!editingMovement) return;
    
    let appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      appsScriptUrl = appsScriptUrl.trim().replace(/^['"]|['"]$/g, '');
      try {
        setSavingToSheet(true);
        const cleanOriginalAmount = editingMovement.originalAmountStr.replace(/[$,]/g, '');
        const payload = {
          sheet: editingMovement.tipo === 'ingreso' ? 'Ingresos' : 'Gastos',
          row: editingMovement.sheetRow,
          amount: parseFloat(cleanOriginalAmount),
          date: editingMovement.originalFecha
        };

        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Error resetting Google Sheets:', error);
        alert('Error al restaurar en Google Sheets. Los cambios se aplicarán de forma local.');
      } finally {
        setSavingToSheet(false);
      }
    }

    const overrides = JSON.parse(localStorage.getItem('movements_overrides') || '{}');
    delete overrides[editingMovement.id];
    localStorage.setItem('movements_overrides', JSON.stringify(overrides));

    fetchMovements();
    window.dispatchEvent(new Event('movementsUpdate'));
    setEditingMovement(null);
  };

  useEffect(() => {
    fetchMovements();

    const handleMovementsUpdate = () => {
      fetchMovements();
    };
    window.addEventListener('movementsUpdate', handleMovementsUpdate);

    const interval = setInterval(() => {
      fetchMovements();
    }, 300000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('movementsUpdate', handleMovementsUpdate);
    };
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
    if (!a.fecha && !b.fecha) return 0;
    if (!a.fecha) return 1;
    if (!b.fecha) return -1;
    const dateA = formatDateToInput(a.fecha);
    const dateB = formatDateToInput(b.fecha);
    return dateB.localeCompare(dateA);
  });

  const formatDateHeader = (dateStr) => {
    if (!dateStr) return 'Últimos Movimientos';
    const inputDate = formatDateToInput(dateStr);
    const date = new Date((inputDate || dateStr) + 'T12:00:00');
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
      const data = sortedMovements;
      
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
    <div className="flex flex-col">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
            <input 
              className={`w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 pl-10 ${searchTerm ? 'pr-9' : 'pr-4'} text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500`}
              placeholder="Buscar transacciones..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          <button 
            onClick={fetchMovements}
            disabled={loading}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm disabled:opacity-50"
            title="Actualizar desde Google Sheets"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>sync</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm"
            title="Exportar Reportes"
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
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
              <h2 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] mb-3 px-1">{header}</h2>
              <div className="space-y-1">
                {groups[header].map((movement, index) => {
                  const isIngreso = movement.tipo === 'ingreso';
                  const cleanVal = movement.amountStr.replace(/[$,]/g, '');
                  const val = parseFloat(cleanVal);
                  const formattedAmount = !isNaN(val) 
                    ? `${isIngreso ? '+' : '-'}${currency.symbol}${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
                      onClick={() => setEditingMovement(movement)}
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

      {/* Modal de Exportar Reportes */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !exportLoading && setShowExportModal(false)}
          />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-border-dark transform transition-all scale-100 opacity-100 flex flex-col gap-5">
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
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
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
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
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
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
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
                  className="mt-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-center text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Editar Movimiento */}
      {editingMovement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingMovement(null)}
          />
          <div className="relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200/80 dark:border-border-dark transform transition-all scale-100 opacity-100 flex flex-col gap-5 animate-scale-in">
            <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-white/[0.05]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                editingMovement.tipo === 'ingreso' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {editingMovement.tipo === 'ingreso' ? 'account_balance_wallet' : 'local_mall'}
                </span>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                    editingMovement.tipo === 'ingreso' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {editingMovement.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium truncate">
                    {editingMovement.categoria}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {editingMovement.title}
                </h3>
              </div>
            </div>

            <div className="space-y-5">
              {/* Input Monto */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest px-1">
                  Monto ({currency.symbol})
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="text-base font-bold select-none">{currency.symbol}</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    disabled={savingToSheet}
                    className="w-full bg-slate-50 dark:bg-background-dark/30 border border-slate-200 dark:border-border-dark rounded-xl py-3 pl-11 pr-4 text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Input Fecha */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest px-1">
                  Fecha
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                  </div>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    disabled={savingToSheet}
                    className="w-full bg-slate-50 dark:bg-background-dark/30 border border-slate-200 dark:border-border-dark rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={savingToSheet}
                className="w-full py-3 px-5 rounded-xl bg-primary text-white font-bold hover:brightness-105 active:scale-[0.98] transition-all text-center text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingToSheet ? (
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                )}
                {savingToSheet ? 'Guardando en la nube...' : 'Guardar Cambios'}
              </button>

              {(() => {
                const overrides = JSON.parse(localStorage.getItem('movements_overrides') || '{}');
                const isModified = !!overrides[editingMovement.id];
                return isModified && (
                  <button
                    onClick={handleResetEdit}
                    disabled={savingToSheet}
                    className="w-full py-2 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold transition-colors text-center text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingToSheet ? (
                      <div className="size-3.5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined text-base">restore</span>
                    )}
                    {savingToSheet ? 'Restaurando...' : 'Restaurar Original'}
                  </button>
                );
              })()}

              <button
                onClick={() => setEditingMovement(null)}
                disabled={savingToSheet}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-center text-xs active:scale-[0.98] disabled:opacity-50"
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

function MovementItem({ icon, iconBg, title, desc, amount, amountColor, status, statusBg, onClick }) {
  const bgClasses = {
    red: 'bg-red-500/10 border-red-500/20 text-red-500',
    slate: 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-100',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div 
      onClick={onClick}
      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
    >
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
