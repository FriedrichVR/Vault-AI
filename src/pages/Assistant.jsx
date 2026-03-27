import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Assistant() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(
    localStorage.getItem('userAvatar') || 
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKFeVTPWLSPgaVLGhnkPXNO3BKiEVny_1TaMamGFpVp-3SF7fFmZ2EjHxs9ayimbsucHyxXRCXKeDcu6CKZsQBRhh2sz-UgPwyIlZLpLLH0xuG-_sTJBjxOBBjNE1Y3o06TC1sCZkT49BK1xYfHCzdKr2iKCDaNxEq3ssTRZUqf-fUdl5PzN4IqqQHR2ZS25lHDi-jk-jXDbTobg4arWCxK4BlR064Xprs-_U6zwor_i1huTWfwfDxNMVnM9urJQJvWvX85cVOAIs"
  );
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hola, he analizado tus finanzas del último mes. Tu ahorro ha incrementado un 12% respecto al periodo anterior. Aquí tienes el desglose de tus gastos:',
      hasGraph: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    // Mantener el teclado activo (foco) después de que la IA responda
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    const handleUpdate = () => {
      setAvatar(localStorage.getItem('userAvatar') || avatar);
    };
    window.addEventListener('avatarUpdate', handleUpdate);
    return () => window.removeEventListener('avatarUpdate', handleUpdate);
  }, [avatar]);

  const handlePlusClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mensaje visual de usuario indicando la acción
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: `📁 Enviando documento: ${file.name}`
    }]);

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('sessionId', 'user-vault-ai');

    try {
      const response = await fetch('https://n8n.srv1202174.hstgr.cloud/webhook/b45a5a67-7e9d-4e80-9e18-09e1733eba6d', {
        method: 'POST',
        body: formData,
      });
      
      const text = await response.text();
      let finalOutput = text;
      
      try {
        const json = JSON.parse(text);
        finalOutput = json.output || json.text || json.message || json.chatOutput || text || 'Documento procesado correctamente.';
      } catch(err) {}

      if (finalOutput) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: finalOutput
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Hubo un error al enviar el documento a n8n. Intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.srv1202174.hstgr.cloud/webhook/c2086702-3663-46a7-8ed7-421446f4fd6c/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: input, sessionId: 'user-vault-ai' })
      });
      
      const text = await response.text();
      let finalOutput = text;
      try {
        const json = JSON.parse(text);
        finalOutput = json.output || json.text || json.message || json.chatOutput || text;
      } catch(e) {}

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: finalOutput
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Lo siento, hubo un error al conectar con el servidor. Intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full -mt-6 -mx-4 relative">
      {/* Input Oculto para Galería */}
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      {/* Botón Flotante Superior (Sticky en lugar de Fixed para evitar scroll con contenedores transformados) */}
      <div className="sticky top-0 z-[60] w-full h-0">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center justify-center backdrop-blur-lg shadow-lg border border-white/30 dark:border-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </div>
      </div>

      {/* Contenedor Principal (pb-40 para que nada quede trabado abajo) */}
      <div className="flex-1 p-4 pt-16 pb-40 space-y-5 scrollbar-hide">
        {messages.map(msg => (
          msg.role === 'assistant' ? (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined fill-active text-primary text-xl">smart_toy</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 items-start">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-1 uppercase tracking-wider">Asistente</p>
                <div className="text-sm font-normal leading-relaxed max-w-[85%] rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 shadow-sm whitespace-pre-wrap">
                    {msg.content}
                </div>
                
                {msg.hasGraph && (
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
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-3 flex-row-reverse">
              <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                <img className="w-full h-full object-cover" src={avatar} alt="User Avatar" />
              </div>
              <div className="flex flex-col gap-1 items-end max-w-[80%]">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-1 uppercase tracking-wider">Tú</p>
                <div className="text-sm font-normal leading-relaxed rounded-2xl px-4 py-3 bg-primary text-white shadow-md whitespace-pre-wrap break-words break-all">
                    {msg.content}
                </div>
              </div>
            </div>
          )
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined fill-active text-primary text-xl">smart_toy</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-1 uppercase tracking-wider">Asistente</p>
              <div className="text-sm rounded-2xl px-4 py-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Barra Inferior súper compacta (Achicada a pedido del usuario) */}
      <div className="fixed bottom-0 left-0 w-full z-50 pb-2">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] p-1.5 rounded-full flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-primary/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex flex-1 items-center gap-2">
              <button 
                type="button" 
                onClick={handlePlusClick}
                disabled={isLoading}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">add_circle</span>
              </button>
              
              <input 
                ref={inputRef}
                autoFocus
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 py-1 outline-none min-w-0" 
                placeholder="Escribe un mensaje..." 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              
              <button type="button" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
              
              <button type="submit" disabled={isLoading || !input.trim()} className="p-1.5 ml-1 aspect-square bg-primary text-white rounded-full shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 transition-all flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
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
