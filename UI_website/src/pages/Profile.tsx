import { useNavigate } from "react-router-dom";
// Sidebar is handled by MainLayout now, so we don't strictly need it here if wrapped
import ProfileHeader from "../components/Profile/ProfileHeader";
import InfoSection from "../components/Profile/InfoSection";
import "../style/Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Profile Data
  const personalInfo = [
    { label: "Name", value: "Someone" },
    { label: "Mobile Number", value: "+91 9876543210" }
  ];

  const areaInfo = [
    { label: "District", value: "North Goa" },
    { label: "Taluka", value: "Bardez" },
    { label: "Zone", value: "Zone A" }
  ];

  return (
    <div className="profile-page">
      {/* 1. Header Section */}
      <ProfileHeader onLogout={handleLogout} />

      {/* 2. Personal Info Card */}
      <InfoSection title="Profile Information" items={personalInfo} />

      {/* 3. Area Info Card */}
      <InfoSection title="Assigned Area" items={areaInfo} />

      {/* 4. Simple Stat Card */}
      <div className="card small">
        <label>Registered Vehicle Count</label>
        <p className="count">3</p>
      </div>
    </div>
  );
};

export default Profile;