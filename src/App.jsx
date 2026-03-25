import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import Movements from './pages/Movements';
import Scan from './pages/Scan';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
