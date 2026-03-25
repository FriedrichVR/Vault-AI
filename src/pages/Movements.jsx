import { Link } from 'react-router-dom';

export default function Movements() {
  return (
    <div className="flex flex-col">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
          <input className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500" placeholder="Buscar transacciones..." type="text"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-medium whitespace-nowrap">Todos</button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap hover:border-slate-600 transition-colors">Ingresos</button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap hover:border-slate-600 transition-colors">Gastos</button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap hover:border-slate-600 transition-colors">Inversiones</button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {/* Date Group */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Hoy</h2>
          <div className="space-y-1">
            <MovementItem 
              icon="subscriptions" 
              iconBg="red" 
              title="Netflix Premium" 
              desc="Suscripción Mensual" 
              amount="-18.99" 
              status="Procesando" 
              statusBg="blue" 
            />
            <MovementItem 
              icon="laptop_mac" 
              iconBg="slate" 
              title="Apple Store" 
              desc="MacBook Air M2" 
              amount="-1,299.00" 
              status="Analizado" 
              statusBg="emerald" 
            />
          </div>
        </div>

        {/* Date Group */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Ayer</h2>
          <div className="space-y-1">
            <MovementItem 
              icon="account_balance_wallet" 
              iconBg="primary" 
              title="Nómina Mensual" 
              desc="Tech Corp Int." 
              amount="+3,450.00" 
              amountColor="emerald"
              status="Analizado" 
              statusBg="emerald" 
            />
            <MovementItem 
              icon="warning" 
              iconBg="red" 
              title="Transferencia Fallida" 
              desc="A: Juan Perez" 
              amount="-150.00" 
              amountColor="slate"
              status="Error" 
              statusBg="red" 
            />
            <MovementItem 
              icon="coffee" 
              iconBg="emerald" 
              title="Starbucks Coffee" 
              desc="Gasto en Comida" 
              amount="-5.45" 
              status="Analizado" 
              statusBg="emerald" 
            />
          </div>
        </div>

        {/* Date Group */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">12 Octubre</h2>
          <div className="space-y-1">
            <MovementItem 
              icon="electric_car" 
              iconBg="orange" 
              title="Tesla Supercharger" 
              desc="Transporte" 
              amount="-24.30" 
              status="Analizado" 
              statusBg="emerald" 
            />
          </div>
        </div>
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
