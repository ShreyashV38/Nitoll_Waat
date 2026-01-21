import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Google from "../../assets/google.png"
import Apple from "../../assets/apple-logo.png"
import Facebook from "../../assets/facebook.png"
import "../../style/LoginForm.css"

function SignupForm() {
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    // Unified Status State
    const [status, setStatus] = useState({ type: '', msg: '' });
    
    const navigate = useNavigate();

    const handleInput = (setter: any, value: string) => {
        setter(value);
        if (status.msg) setStatus({ type: '', msg: '' });
    };

    // 1. Simulate Sending OTP
    const handleSendOtp = () => {
        if (name.trim() === "") {
            setStatus({ type: 'error', msg: 'Please enter your full name' });
            return;
        }
        if (phoneNumber.length < 10) {
            setStatus({ type: 'error', msg: 'Please enter a valid phone number' });
            return;
        }

        setIsOtpSent(true);
        setStatus({ type: 'success', msg: `✅ Verification code sent to ${phoneNumber}` });
    };

    // 2. Simulate Final Sign Up
    const handleSignUp = () => {
        if (otp === "") {
            setStatus({ type: 'error', msg: 'Please enter the OTP code' });
            return;
        }
        
        console.log("Signing up with:", { name, phoneNumber, otp });
        setStatus({ type: 'success', msg: '🎉 Account created successfully! Redirecting...' });
        
        // Delay navigation slightly so user sees the success message
        setTimeout(() => {
            navigate('/area');
        }, 1500);
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
                        <h3>Create Account</h3>
                        <p className="subtitle">Sign up to get started</p>

                        <div className="inputFields">
                            
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name}
                                onChange={(e) => handleInput(setName, e.target.value)}
                                className="input-field"
                                disabled={isOtpSent}
                            />

                            <input 
                                type="tel" 
                                placeholder="Phone Number" 
                                value={phoneNumber}
                                onChange={(e) => handleInput(setPhoneNumber, e.target.value)}
                                className="input-field"
                                disabled={isOtpSent}
                            />

                            {isOtpSent && (
                                <input 
                                    type="text" 
                                    placeholder="Enter OTP" 
                                    value={otp}
                                    onChange={(e) => handleInput(setOtp, e.target.value)}
                                    className="input-field"
                                />
                            )}

                            {!isOtpSent ? (
                                <button onClick={handleSendOtp} className="sendOtp-btn">
                                    Send OTP
                                </button>
                            ) : (
                                <button onClick={handleSignUp} className="next-btn">
                                    Sign Up
                                </button>
                            )}

                            {/* STATUS MESSAGE UI REPLACING ALERTS */}
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
    )
}

export default SignupForm