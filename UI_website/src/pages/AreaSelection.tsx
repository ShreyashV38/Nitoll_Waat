import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandingSection from "../components/BrandingSection";
import "../style/LoginPage.css";

const AreaSelection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: "",
    taluka: "",
    zone: "",
    vehicles: "",
  });

  const handleNext = () => {
    // Basic validation to ensure areas are selected [cite: 23, 27]
    if (!formData.district || !formData.zone) {
      alert("Please select your District and Zone to proceed.");
      return;
    }
    // Navigate to Dashboard upon successful selection
    console.log("Onboarding complete. Navigating to Dashboard...");
    navigate("/dashboard");
  };

  return (
    <div className="login-page-container">
      <div className="branding-column">
        <BrandingSection />
      </div>

      <div className="form-column">
        <div className="auth-content-wrapper">
          <header className="page-header">
            <h2>Welcome to</h2> [cite: 22]
            <h1>NitollWaat</h1> [cite: 22]
          </header>

          <div className="auth-card area-card">
            <div className="card-header">
              <h1>Select your Area</h1> [cite: 23]
              <p>Area selected can be changed later</p> [cite: 24]
            </div>

            <div className="selection-grid">
              <div className="select-group">
                <label>District</label> [cite: 26]
                <select
                  className="form-input"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select District
                  </option>{" "}
                  [cite: 27]
                  <option value="north-goa">North Goa</option>
                  <option value="south-goa">South Goa</option>
                </select>
              </div>

              <div className="select-group">
                <label>Taluka</label> [cite: 28]
                <select
                  className="form-input"
                  value={formData.taluka}
                  onChange={(e) =>
                    setFormData({ ...formData, taluka: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Taluka
                  </option>{" "}
                  [cite: 30]
                  <option value="bardez">Bardez</option>
                  <option value="tiswadi">Tiswadi</option>
                </select>
              </div>

              <div className="select-group">
                <label>Municipal Area/Panchayat/Zone</label> [cite: 25]
                <select
                  className="form-input"
                  value={formData.zone}
                  onChange={(e) =>
                    setFormData({ ...formData, zone: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Zone
                  </option>{" "}
                  [cite: 31]
                  <option value="zone-a">Zone A</option>
                  <option value="zone-b">Zone B</option>
                </select>
              </div>
            </div>

            <div className="vehicle-section">
              <label>Number of vehicles</label> [cite: 29]
              <input
                type="number"
                className="form-input small"
                placeholder="Number of vehicles"
                value={formData.vehicles}
                onChange={(e) =>
                  setFormData({ ...formData, vehicles: e.target.value })
                }
              />
            </div>

            <button className="submit-btn" onClick={handleNext}>
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaSelection;
