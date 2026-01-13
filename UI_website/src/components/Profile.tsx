import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../style/Profile.css";

interface ProfileData {
  name: string;
  mobile: string;
  district: string;
  taluka: string;
  zone: string;
  vehicles: number;
}

const profileData: ProfileData = {
  name: "Someone",
  mobile: "+91 9876543210",
  district: "North Goa",
  taluka: "Bardez",
  zone: "Zone A",
  vehicles: 3,
};

const Profile = () => {
  const navigate = useNavigate(); // Hook

  const handleLogout = () => {
      // Clear session data if any
      localStorage.clear(); 
      navigate("/");
  };
  return (
    <div className="layout">
      <Sidebar />

      <main className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-title">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Admin"
            />
            <h2>Admin Profile</h2>
          </div>

          <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
        </div>

        {/* Profile Information */}
        <div className="card">
          <h3>Profile Informations</h3>

          <div className="info-row">
            <div>
              <label>Name</label>
              <p>{profileData.name}</p>
            </div>

            <div>
              <label>Mobile Number</label>
              <p>{profileData.mobile}</p>
            </div>
          </div>
        </div>

        {/* Assigned Area */}
        <div className="card">
          <h3>Assigned Area</h3>

          <div className="area-grid">
            <div className="area-box">
              <label>District</label>
              <p>{profileData.district}</p>
            </div>

            <div className="area-box">
              <label>Taluka</label>
              <p>{profileData.taluka}</p>
            </div>

            <div className="area-box">
              <label>Zone</label>
              <p>{profileData.zone}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Count */}
        <div className="card small">
          <label>Registered Vehicle Count</label>
          <p className="count">{profileData.vehicles}</p>
        </div>
      </main>
    </div>
  );
};

export default Profile;
