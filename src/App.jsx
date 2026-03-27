import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';

// Pages - Lazy loaded for performance
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Movements = lazy(() => import('./pages/Movements'));
const Scan = lazy(() => import('./pages/Scan'));

// Loader placeholder
const Loader = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark min-h-screen">
    <div className="size-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movimientos" element={<Movements />} />
            <Route path="/escaneo" element={<Scan />} />
            <Route path="/asistente" element={<Assistant />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
