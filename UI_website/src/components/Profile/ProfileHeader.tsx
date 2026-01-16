import React from "react";
import "../../style/Profile.css";

interface Props {
  onLogout: () => void;
}

const ProfileHeader: React.FC<Props> = ({ onLogout }) => {
  return (
    <div className="profile-header">
      <div className="profile-title">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Admin"
        />
        <h2>Admin Profile</h2>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        LOGOUT
      </button>
    </div>
  );
};

export default ProfileHeader;