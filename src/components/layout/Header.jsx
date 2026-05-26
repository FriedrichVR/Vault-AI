export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark px-4 pt-safe pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
        </div>
        <span className="text-xl font-black italic tracking-[-0.05em] text-slate-900 dark:text-white">VAULT AI</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </header>
  );
}
