import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Essential for navigation logic
import BrandingSection from "../components/BrandingSection";
import "../style/LoginPage.css";

const AuthPage = () => {
  // State to toggle between Login (true) and Sign Up (false)
  const [isLogin, setIsLogin] = useState(true);

  // Navigation hook to switch pages
  const navigate = useNavigate();

  // Function triggered by the NEXT button
  const handleNext = () => {
    if (isLogin) {
      // Logic for Login (Page 1) [cite: 5, 6]
      console.log("Navigating to Dashboard...");
      navigate("/dashboard");
    } else {
      // Logic for Sign Up (Page 2) - Moves to Area Selection [cite: 16]
      console.log("Navigating to Area Selection...");
      navigate("/select-area");
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Column: Fixed Illustration [cite: 1, 12] */}
      <div className="branding-column">
        <BrandingSection />
      </div>

      {/* Right Column: Form Area */}
      <div className="form-column">
        {/* Top Toggle: Moves user to Sign Up or Login [cite: 3, 14] */}
        <div className="top-nav">
          <span className="nav-text">
            {isLogin ? "No Account yet?" : "Already a Member?"}
          </span>
          <button className="nav-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

        <div className="auth-content-wrapper">
          <header className="page-header">
            <h2>Welcome to</h2> [cite: 4, 15]
            <h1>NitollWaat</h1> [cite: 4, 15]
          </header>

          <div className="auth-card">
            <div className="card-header">
              {/* Heading changes based on state [cite: 5, 16] */}
              <h1>{isLogin ? "Welcome Back!" : "Get Started Now"}</h1>
              <p>{isLogin ? "Authenticate to access your account" : ""}</p>{" "}
              [cite: 6]
            </div>

            <div className="input-group">
              {/* Extra fields for Sign Up Page [cite: 11, 18] */}
              {!isLogin && (
                <div className="name-row">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="First Name"
                  />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Last Name"
                  />
                </div>
              )}
              <input
                className="form-input"
                type="tel"
                placeholder="Phone Number"
              />{" "}
              [cite: 1, 12]
              <input
                className="form-input"
                type="text"
                placeholder="OTP"
              />{" "}
              [cite: 2, 13]
            </div>

            {/* FIXED: onClick event added to trigger handleNext  */}
            <button className="submit-btn" onClick={handleNext}>
              NEXT
            </button>

            <div className="social-divider">
              <p>or do it via other accounts</p> [cite: 9, 20]
              <div className="social-icons">
                <button className="icon-circle">
                  <img src="/assets/google.png" alt="G" />
                </button>{" "}
                [cite: 7, 17]
                <button className="icon-circle">
                  <img src="/assets/apple.png" alt="A" />
                </button>
                <button className="icon-circle">
                  <img src="/assets/facebook.png" alt="f" />
                </button>{" "}
                [cite: 10, 21]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
