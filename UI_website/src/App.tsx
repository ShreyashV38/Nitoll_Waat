import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import AreaSelection from "./pages/AreaSelection";
import Dashboard from "./pages/Dashboard";
import "./style/App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Step 1: Login/Signup [cite: 1-21] */}
        <Route path="/" element={<AuthPage />} />

        {/* Step 2: Area Selection (Appears after Signup) [cite: 22-32] */}
        <Route path="/select-area" element={<AreaSelection />} />

        {/* Step 3: Main Dashboard [cite: 34-68] */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
