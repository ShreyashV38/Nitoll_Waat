import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import './style/App.css';
import AreaPage from './pages/AreaPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path ="/area" element={<AreaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;