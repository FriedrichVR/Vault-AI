import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function Scan() {
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const WEBHOOK_URL = "https://n8n.srv1202174.hstgr.cloud/webhook-test/b45a5a67-7e9d-4e80-9e18-09e1733eba6d";

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Archivo seleccionado:', file.name, file.type, file.size);
    setIsProcessing(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    try {
      setProgress(30);
      console.log('Enviando a N8N...');
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        // No añadimos Content-Type manual para que el navegador ponga el boundary correcto
      });

      console.log('Respuesta recibida:', response.status);
      setProgress(80);

      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          alert('¡Factura enviada con éxito! N8N la está procesando.');
          navigate('/');
        }, 500);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en el servidor N8N');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      alert('Hubo un problema al enviar la factura. Verifica tu conexión o el estado de N8N.');
      setIsProcessing(false);
      setProgress(0);
    } finally {
      // Limpiar los inputs para permitir seleccionar el mismo archivo de nuevo si falla
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background-light dark:bg-background-dark z-[100] flex flex-col overflow-hidden">
      {/* Input para Galería (Imágenes y PDFs) */}
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      {/* Input para Cámara (Directo) */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />

      {/* Header */}
      <div className="z-20 flex items-center bg-transparent p-4 justify-between backdrop-blur-md border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-slate-100 text-sm font-semibold tracking-wide uppercase flex-1 text-center">Escaneo de Facturas</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-100">
            <span className="material-symbols-outlined">flashlight_on</span>
          </button>
        </div>
      </div>

      {/* Viewfinder Area */}
      <div className="relative flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <img 
            alt="Fondo de cámara" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvzNhIt9_Y8pDqFhsbPkJEhIb5hiQO2dxbM3tibreeTynsTlm5Fnqo45HdjV5QSmljW1Kj5N9h59e2Mrxft4vcLX8ycH6QqzTqVsrLSz-uVcpUr0WkLLRBr9F_7TmYAlHQIQxKDMqbroRFMY7Avt3WspvbPOtiLXv6y9taxHqxmmMjrAI0lXaSsQDVfkYbQpC6XsU-sDIb9UBOPXSjJkNUxIEJC-8kUDNU_qcobNmRVNFmqJqbS0wjr0D1nPVjv0bH8tyYXsW4MPA" 
          />
        </div>
        
        <div className="relative w-4/5 h-3/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-[2px]">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
          <div className="scanline absolute w-full top-[40%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_2px_rgba(13,13,242,0.5)] animate-scan"></div>
        </div>

        <div className="absolute bottom-8 w-full text-center px-6">
          <p className="text-slate-300 text-sm font-medium bg-black/40 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Alinee la factura dentro del marco
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="z-20 flex flex-col gap-6 bg-background-light dark:bg-background-dark p-6 pt-8 pb-8 border-t border-white/5 rounded-t-3xl shadow-2xl">
        {isProcessing ? (
          <div className="w-full">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-none">Enviando a N8N</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-medium">Procesando archivo...</p>
                </div>
                <p className="text-primary text-sm font-bold tabular-nums">{progress}%</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between px-6 pb-2">
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => galleryInputRef.current.click()}
                className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-100 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">image</span>
              </button>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Galería</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => cameraInputRef.current.click()}
                className="flex shrink-0 items-center justify-center rounded-full size-20 bg-primary shadow-[0_0_30px_-5px_rgba(13,13,242,0.6)] text-white hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined !text-4xl">camera</span>
              </button>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Escanear</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => setShowModal(true)}
                className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-100 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Manual</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal Manual */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 w-full max-w-md shadow-2xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Cargar manualmente</h3>
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); navigate('/'); }}>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Proveedor</label>
                <input type="text" placeholder="Ej. Supermercado" className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 outline-none" required />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</label>
                <input type="date" className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 outline-none" required />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monto</label>
                <input type="number" placeholder="0.00" step="0.01" className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 outline-none" required />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-medium bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 font-medium bg-primary text-white rounded-lg shadow-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
