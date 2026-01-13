import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import './style/App.css';
import AreaPage from './pages/AreaPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import RoutesPage from './pages/RoutesPage';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path ="/area" element={<AreaPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/routes" element={<RoutesPage />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
