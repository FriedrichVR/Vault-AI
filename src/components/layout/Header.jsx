import { useState, useEffect } from 'react';

export default function Header() {
  const [avatar, setAvatar] = useState(
    localStorage.getItem('userAvatar') || 
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAMNAODnQiQLygHCe2YDhVrrmV30EoIRNXXBlCE_JwsgG7vZJpg7dsBKlDeCGIFp061hfJcTJ_XGKLY8X2JMrx1k8dPAuGSQGuHcOasb-8NddvR2k3EU2va067AMF6LVFGlNvxEgDUQr8m002sBPvhVclzjjN8tKRdAWzuw4B26GY5TQHJ8BCKMYd7xdICGFG5P41Z615nmhAMFoCBN6pEcGUIA0trBvCbkj-HFHqjflPSd9Ti_uZUFxDfYKD20GCjeyX13YlqOQl0"
  );

  useEffect(() => {
    const handleUpdate = () => {
      setAvatar(localStorage.getItem('userAvatar') || avatar);
    };
    window.addEventListener('avatarUpdate', handleUpdate);
    return () => window.removeEventListener('avatarUpdate', handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
        </div>
        <span className="text-xl font-black italic tracking-[-0.05em] text-slate-900 dark:text-white">VAULT AI</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button className="text-slate-500 dark:text-slate-400 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
        </button>
        <div className="size-8 rounded-full bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-border-dark overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            src={avatar} 
            alt="Profile Avatar" 
          />
        </div>
      </div>
    </header>
  );
}
