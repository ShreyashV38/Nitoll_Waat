import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import './style/App.css';
import AreaPage from './pages/AreaPage';
<<<<<<< HEAD
import MapsBinsPage from './pages/MapsBinsPage'; // Import your specific page
import MainLayout from './components/MainLayout';
=======
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import RoutesPage from './pages/RoutesPage';
import Reports from './pages/Reports';
import Messages from "./pages/Messages";
>>>>>>> f2a4db6e964d766c90e959994cbda633cba31382

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
<<<<<<< HEAD
        
        {/* Dashboard Routes */}
        <Route path="/area" element={<MainLayout><AreaPage /></MainLayout>} />
        
        {/* YOUR WORK: Dedicated route for Map and Bins */}
        <Route path="/maps-bins" element={<MainLayout><MapsBinsPage /></MainLayout>} />
=======
        <Route path ="/area" element={<AreaPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/routes" element={<RoutesPage />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
>>>>>>> f2a4db6e964d766c90e959994cbda633cba31382
      </Routes>
    </BrowserRouter>
  );
}
export default App;
