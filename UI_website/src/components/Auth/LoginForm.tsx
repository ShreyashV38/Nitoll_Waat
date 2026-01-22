// src/components/Auth/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // <--- IMPORT ICONS
import Google from "../../assets/google.png"
import Apple from "../../assets/apple-logo.png"
import Facebook from "../../assets/facebook.png"
import "../../style/LoginForm.css"

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    
    // --- NEW STATE ---
    const [showPassword, setShowPassword] = useState(false);
    
    const [status, setStatus] = useState({ type: '', msg: '' });

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInput = (setter: any, value: string) => {
        setter(value);
        if (status.msg) setStatus({ type: '', msg: '' });
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setStatus({ type: 'error', msg: 'Please enter email and password' });
            return;
        }

        try {
            setStatus({ type: 'success', msg: 'Verifying credentials...' });
            
            // Send Email AND Password
            await authAPI.login(email, password); 
            
            setOtpSent(true);
            setStatus({ type: 'success', msg: `✅ Password Verified. OTP sent to ${email}` });
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Invalid Email or Password';
            setStatus({ type: 'error', msg: errorMsg });
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setStatus({ type: 'error', msg: 'Please enter the OTP' });
            return;
        }

        try {
            const res = await authAPI.verify(email, otp);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setStatus({ type: 'error', msg: 'Invalid OTP. Please try again.' });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="switchToSignUp">
                <h3>No Account yet?</h3>
                <button onClick={() => navigate('/signup')}>Sign Up</button>
            </div>

            <div className="form-wrap-center">
                <div className="form-container">
                    <div className="Greetings">
                        <h2>Welcome to </h2>
                        <h1>NitollWaat</h1>
                    </div>

                    <div className="loginForm">
                        <h3>Welcome back!</h3>
                        <p className="subtitle">Login via Password + OTP</p>

                        <div className="inputFields">
                            {/* STEP 1: Email & Password */}
                            {!otpSent ? (
                                <>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => handleInput(setEmail, e.target.value)}
                                        className="input-field"
                                    />
                                    
                                    {/* --- PASSWORD FIELD WITH TOGGLE --- */}
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => handleInput(setPassword, e.target.value)}
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

                                    <button onClick={handleLogin} className="sendOtp-btn">
                                        Login & Send OTP
                                    </button>
                                </>
                            ) : (
                                /* STEP 2: Enter OTP */
                                <>
                                    <div style={{textAlign: 'center', marginBottom: '10px', fontSize: '14px', color: '#666'}}>
                                        Enter code sent to <strong>{email}</strong>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit Code"
                                        value={otp}
                                        onChange={(e) => handleInput(setOtp, e.target.value)}
                                        className="input-field"
                                        autoFocus
                                    />
                                    <button onClick={handleVerifyOtp} className="next-btn">
                                        Verify & Enter
                                    </button>
                                    <button 
                                        onClick={() => setOtpSent(false)} 
                                        style={{background: 'none', border: 'none', color: '#666', fontSize: '12px', marginTop: '10px', textDecoration: 'underline'}}
                                    >
                                        Back to Login
                                    </button>
                                </>
                            )}

                            {status.msg && (
                                <div className={`message-text ${status.type}`}>
                                    {status.msg}
                                </div>
                            )}

                            <div className="otherMethods">
                                <p>Or do it via other accounts</p>
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

export default LoginForm;