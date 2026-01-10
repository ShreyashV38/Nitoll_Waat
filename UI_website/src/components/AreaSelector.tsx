import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginForm.css" // Reusing your form styles

function AreaSelector() {
    const navigate = useNavigate();
    const [selectedArea, setSelectedArea] = useState("");

    // You can replace these with your actual database areas later
    const areas = [
        "Panjim",
        "Margao",
        "Mapusa",
        "Vasco",
        "Ponda",
        "Porvorim"
    ];

    const handleContinue = () => {
        if (!selectedArea) {
            alert("Please select an area to continue");
            return;
        }
        console.log("User selected:", selectedArea);
        // Navigate to the main dashboard/home
        navigate('/home');
    };

    return (
        <div className="login-page-wrapper">
            {/* Top Bar: Optional Logout or Back button */}
            <div className="switchToSignUp">
                <button onClick={() => navigate('/')}>Logout</button>
            </div>

            <div className="form-wrap-center">
                <div className="form-container">
                    
                    <div className="Greetings">
                        <h2>One last step</h2>
                        <h1>Location</h1>
                    </div>

                    <div className="loginForm">
                        <h3>Select your Area</h3>
                        <p className="subtitle">This helps us connect you to the right collectors.</p>

                        <div className="inputFields">
                            
                            {/* Scrollable Area List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                {areas.map((area) => (
                                    <div 
                                        key={area}
                                        onClick={() => setSelectedArea(area)}
                                        className="input-field"
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            // Conditional Styling for selection
                                            backgroundColor: selectedArea === area ? '#e8f5e9' : '#f9f9f9',
                                            borderColor: selectedArea === area ? '#27ae60' : '#e0e0e0',
                                            color: selectedArea === area ? '#27ae60' : '#333',
                                            fontWeight: selectedArea === area ? '600' : '400',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {area}
                                        
                                        {/* Checkmark Icon if selected */}
                                        {selectedArea === area && (
                                            <span style={{ fontSize: '18px', color: '#27ae60' }}>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleContinue} className="next-btn" style={{ marginTop: '24px' }}>
                                Continue
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AreaSelector