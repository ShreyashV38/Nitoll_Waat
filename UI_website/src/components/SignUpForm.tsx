import { useState } from "react";

const SignUpForm = () => {
  const [phone, setPhone] = useState("");

  return (
    <div className="auth-card">
      <div className="card-header">
        <h1>Welcome Back!</h1>
        <p>Authenticate to access your account</p>
      </div>

      <div className="input-group">
        <input
          className="form-input"
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input className="form-input" type="text" placeholder="OTP" />
      </div>

      <button className="submit-btn">NEXT</button>

      <div className="social-divider">
        <p>or do it via other accounts</p>
        <div className="social-icons">
          <button className="icon-circle">
            <img src="/assets/google.png" alt="G" />
          </button>
          <button className="icon-circle">
            <img src="/assets/apple.png" alt="A" />
          </button>
          <button className="icon-circle">
            <img src="/assets/facebook.png" alt="f" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
