import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Google from "../assets/google.png"
import Apple from "../assets/apple-logo.png"
import Facebook from "../assets/facebook.png"
import "../style/LoginForm.css"

function SignupForm() {
    // State for signup inputs
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate();


    // 1. Simulate Sending OTP
    const handleSendOtp = () => {
        if (phoneNumber.length < 10 || name === "") {
            alert("Please enter your name and a valid phone number");
            return;
        }
        setIsOtpSent(true);
        alert(`OTP sent to ${phoneNumber}`);
    };

    // 2. Simulate Final Sign Up
    const handleSignUp = () => {
        if (otp === "") {
            alert("Please enter the OTP");
            return;
        }
        console.log("Signing up with:", { name, phoneNumber, otp });
        alert("Account Created Successfully!");
        navigate('/area');
    };

    return (
        <div className="login-page-wrapper">
            {/* Top Bar: Switch to Login */}
            <div className="switchToSignUp">
                <h3>Already have an account?</h3>
                <button onClick={() => navigate('/')}>LogIn</button>
            </div>

            {/* Center Form Section */}
            <div className="form-wrap-center">
                <div className="form-container">
                    
                    {/* Brand Header */}
                    <div className="Greetings">
                        <h2>Join us at</h2>
                        <h1>NitollWaat</h1>
                    </div>

                    {/* The Card */}
                    <div className="loginForm">
                        <h3>Create Account</h3>
                        <p className="subtitle">Sign up to get started</p>

                        <div className="inputFields">
                            
                            {/* Name Input */}
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                disabled={isOtpSent} // Disable after OTP is sent
                            />

                            {/* Phone Input */}
                            <input 
                                type="tel" 
                                placeholder="Phone Number" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="input-field"
                                disabled={isOtpSent}
                            />

                            {/* OTP Input (Only shows after sending OTP) */}
                            {isOtpSent && (
                                <input 
                                    type="text" 
                                    placeholder="Enter OTP" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="input-field"
                                />
                            )}

                            {/* Dynamic Button Action */}
                            {!isOtpSent ? (
                                <button onClick={handleSendOtp} className="sendOtp-btn">
                                    Send OTP
                                </button>
                            ) : (
                                <button onClick={handleSignUp} className="next-btn">
                                    Sign Up
                                </button>
                            )}

                            {/* Social Login */}
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