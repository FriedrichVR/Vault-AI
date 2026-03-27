import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname === '/escaneo' || location.pathname === '/asistente';
  
  return (
    <div className="flex flex-col flex-1 h-full w-full">
      {!hideNav && <Header />}
      
      {/* Main content wrapper with dynamic padding depending on whether BottomNav is present */}
      <main className={`flex-1 overflow-y-auto px-4 pt-6 max-w-2xl mx-auto w-full ${!hideNav ? 'pb-main-safe' : 'pb-safe'}`}>
        <Outlet />
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
