import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import './style/App.css';
import AreaPage from './pages/AreaPage';
import MapsBinsPage from './pages/MapsBinsPage'; // Import your specific page
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/area" element={<MainLayout><AreaPage /></MainLayout>} />
        
        {/* YOUR WORK: Dedicated route for Map and Bins */}
        <Route path="/maps-bins" element={<MainLayout><MapsBinsPage /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;