import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/Profile/ProfileHeader";
import InfoSection from "../components/Profile/InfoSection";
import { useAuth } from "../context/AuthContext"; // <--- Import Context
import "../style/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, area, logout } = useAuth(); // Get real user & area

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div>Loading Profile...</div>;

  // Real Data
  const personalInfo = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Mobile Number", value: user.mobile || "Not Provided" },
    { label: "Role", value: user.role }
  ];

  const areaInfo = [
    { label: "District", value: area?.district || "..." },
    { label: "Taluka", value: area?.taluka || "..." },
    { label: "Zone Name", value: area?.area_name || "..." }
  ];

  return (
    <div className="profile-page">
      <ProfileHeader onLogout={handleLogout} />
      <InfoSection title="Profile Information" items={personalInfo} />
      <InfoSection title="Assigned Area" items={areaInfo} />
      
      <div className="card small">
        <label>System ID</label>
        <p className="count" style={{fontSize: '14px'}}>{user.id.substring(0,8)}...</p>
      </div>
    </div>
  );
};

export default Profile;