// components/UserProfilePopup.jsx
import React from "react";
import "../styles/UserProfilePopup.css";
import defaultAvatar from '../assets/default-avatar.svg';

export default function UserProfilePopup({ user, onClose }) {
  if (!user) return null;

  const renderAvatar = () => {
    if (user.ImageURL) {
      return (
        <img
          src={`http://localhost:8801/uploads/${user.ImageURL}`}
          alt="profile"
          className="popup-avatar-img"
        />
      );
    } else {
      return (
        <div className="popup-avatar-default">
          <img src={defaultAvatar} alt="default avatar" className="popup-avatar-img" />
        </div>
      );
    }
  };

  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="popup-avatar-wrap">{renderAvatar()}</div>
        <h2 className="popup-user-name">{user.Name || user.name}</h2>
        <div className="popup-info popup-email">{user.Email}</div>
        {user.Phone && <div className="popup-info popup-phone">{user.Phone}</div>}
        {user.Description && (
          <div className="popup-desc">{user.Description}</div>
        )}
        {user.SocialLinks && (
          <div className="popup-social">
            <a href={user.SocialLinks} target="_blank" rel="noopener noreferrer">
              {user.SocialLinks}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
