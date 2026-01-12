// src/components/LoginForm.tsx
import { useState } from "react";

const LoginForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="loginForm">
      <div className="Greetings">
        <h1 style={{ fontSize: "32px", marginBottom: "5px" }}>Welcome Back!</h1>
        <p className="subtitle" style={{ color: "#333", marginBottom: "30px" }}>
          Authenticate to access your account
        </p>
      </div>

      <div className="inputFields">
        <input
          className="input-field"
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>

      <button className="next-btn" onClick={() => setStep(2)}>
        NEXT
      </button>

      <div className="otherMethods">
        <p style={{ margin: "25px 0 15px" }}>or do it via other accounts</p>
        <div className="methods">
          {/* Use the G, Apple, and f icons from your design [cite: 7, 10] */}
          <a href="#">
            <img src="/assets/google.png" alt="G" />
          </a>
          <a href="#">
            <img src="/assets/apple-logo.png" alt="A" />
          </a>
          <a href="#">
            <img src="/assets/facebook.png" alt="f" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
