// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import AreaPage from './pages/AreaPage';
import MainLayout from './components/MainLayout';
// Import pages
import Dashboard from './pages/Dashboard';
import MapsBinsPage from './pages/MapsBinsPage';
import RoutesPage from './pages/RoutesPage';
import Vehicles from './pages/Vehicles';
import Messages from "./pages/Messages";
import Profile from "./pages/Profile"; 
import './style/App.css';
import PublicHome from './pages/PublicHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        {/* Public Routes (No Sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/area" element={<AreaPage />} />
        
        {/* Protected Routes (Wrapped in MainLayout) */}
        <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/maps-bins" element={<MapsBinsPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;