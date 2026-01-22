import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { Eye, EyeOff } from "lucide-react"; // <--- IMPORT ICONS
import Google from "../../assets/google.png"
import Apple from "../../assets/apple-logo.png"
import Facebook from "../../assets/facebook.png"
import "../../style/LoginForm.css"

// --- GOA LOCATION DATA ---
const LOCATION_DATA: any = {
  "North Goa": {
    "Tiswadi": ["Panaji", "Old Goa", "Dona Paula", "Bambolim", "Merces"],
    "Bardez": ["Mapusa", "Calangute", "Candolim", "Porvorim", "Siolim"],
    "Pernem": ["Pernem City", "Arambol", "Mandrem", "Morjim"],
    "Bicholim": ["Bicholim City", "Sanquelim", "Mayem"],
    "Sattari": ["Valpoi", "Birondem", "Pissurlem"],
    "Ponda": ["Ponda City", "Farmagudi", "Shiroda", "Marcaim"]
  },
  "South Goa": {
    "Salcete": ["Margao", "Fatorda", "Verna", "Colva", "Navelim"],
    "Mormugao": ["Vasco da Gama", "Dabolim", "Chicalim", "Cansaulim"],
    "Quepem": ["Quepem City", "Curchorem", "Balli"],
    "Canacona": ["Canacona City", "Palolem", "Agonda"],
    "Sanguem": ["Sanguem City", "Netravali"],
    "Dharbandora": ["Dharbandora City", "Mollem"]
  }
};

function SignupForm() {
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "ADMIN",
        password: "" 
    });

    // --- NEW STATE FOR PASSWORD VISIBILITY ---
    const [showPassword, setShowPassword] = useState(false);

    // Location State
    const [district, setDistrict] = useState("");
    const [taluka, setTaluka] = useState("");
    const [areaName, setAreaName] = useState("");

    // Dropdown Options State
    const [talukaOptions, setTalukaOptions] = useState<string[]>([]);
    const [villageOptions, setVillageOptions] = useState<string[]>([]);

    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    // 1. Handle District Change -> Update Talukas
    const handleDistrictChange = (e: any) => {
        const selectedDist = e.target.value;
        setDistrict(selectedDist);
        setTaluka(""); 
        setAreaName(""); 
        
        if (selectedDist && LOCATION_DATA[selectedDist]) {
            setTalukaOptions(Object.keys(LOCATION_DATA[selectedDist]));
        } else {
            setTalukaOptions([]);
        }
    };

    // 2. Handle Taluka Change -> Update Villages
    const handleTalukaChange = (e: any) => {
        const selectedTaluka = e.target.value;
        setTaluka(selectedTaluka);
        setAreaName(""); 

        if (district && selectedTaluka && LOCATION_DATA[district][selectedTaluka]) {
            setVillageOptions(LOCATION_DATA[district][selectedTaluka]);
        } else {
            setVillageOptions([]);
        }
    };

    const handleSignup = async () => {
        // Validation
        if (!formData.email || !formData.name || !formData.mobile || !formData.password || !district || !taluka || !areaName) {
            setStatus({ type: 'error', msg: 'Please fill in all fields including Password & Location' });
            return;
        }

        try {
            setStatus({ type: 'success', msg: 'Creating Account...' });
            
            // Send complete data to backend
            const payload = {
                ...formData,
                district,
                taluka,
                area_name: areaName
            };

            await authAPI.register(payload);
            
            setStatus({ type: 'success', msg: '🎉 Account created! Redirecting...' });
            
            setTimeout(() => {
                navigate('/'); 
            }, 2000);

        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Signup failed';
            setStatus({ type: 'error', msg: errorMsg });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="switchToSignUp">
                <h3>Already have an account?</h3>
                <button onClick={() => navigate('/')}>LogIn</button>
            </div>

            <div className="form-wrap-center">
                <div className="form-container">
                    <div className="Greetings">
                        <h2>Join us at</h2>
                        <h1>NitollWaat</h1>
                    </div>

                    <div className="loginForm">
                        <h3>Create Admin Account</h3>
                        <div className="inputFields">
                            {/* Personal Info */}
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="input-field"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="input-field"
                            />
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                value={formData.mobile}
                                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                className="input-field"
                            />

                            {/* --- PASSWORD FIELD WITH TOGGLE --- */}
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"} // Toggles Type
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="input-field"
                                />
                                <button 
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* --- CASCADING DROPDOWNS --- */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {/* District */}
                                <select 
                                    className="input-field"
                                    value={district}
                                    onChange={handleDistrictChange}
                                >
                                    <option value="">Select District</option>
                                    <option value="North Goa">North Goa</option>
                                    <option value="South Goa">South Goa</option>
                                </select>

                                {/* Taluka */}
                                <select 
                                    className="input-field"
                                    value={taluka}
                                    onChange={handleTalukaChange}
                                    disabled={!district}
                                >
                                    <option value="">Select Taluka</option>
                                    {talukaOptions.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Village/City */}
                            <select 
                                className="input-field"
                                value={areaName}
                                onChange={(e) => setAreaName(e.target.value)}
                                disabled={!taluka}
                            >
                                <option value="">Select City / Village</option>
                                {villageOptions.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>

                            <button onClick={handleSignup} className="next-btn">
                                Sign Up
                            </button>

                            {status.msg && (
                                <div className={`message-text ${status.type}`}>
                                    {status.msg}
                                </div>
                            )}
                            
                            <div className="otherMethods">
                                <p>Or sign up via</p>
                                <div className="methods">
                                    <a href="#"><img src={Google} alt="Google" /></a>
                                    <a href="#"><img src={Apple} alt="Apple" /></a>
                                    <a href="#"><img src={Facebook} alt="Facebook" /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;