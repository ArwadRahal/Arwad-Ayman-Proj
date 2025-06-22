// pages/ProfilePage.jsx
// pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/ProfilePage.css";
import defaultAvatar from "../assets/default-avatar.svg";

const API = "http://localhost:8801";

export default function ProfilePage() {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = id || currentUser.id;
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/users/${userId}`).then(res => {
      setUser(res.data);
      setPreviewImg(res.data.ImageURL ? `${API}/uploads/${res.data.ImageURL}` : null);
    });
  }, [userId]);

  const openEdit = () => {
    setForm({
      phone: user.Phone || "",
      description: user.Description || "",
      socialLinks: user.SocialLinks || "",
      image: null,
    });
    setPreviewImg(user.ImageURL ? `${API}/uploads/${user.ImageURL}` : null);
    setShowEdit(true);
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm(f => ({ ...f, image: files[0] }));
      setPreviewImg(files[0] ? URL.createObjectURL(files[0]) : previewImg);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // زر إزالة الصورة
  const handleRemoveImage = async () => {
    await axios.put(`${API}/users/${user.id}/remove-image`);
    setPreviewImg(null);
    setUser(u => ({ ...u, ImageURL: null }));
    setForm(f => ({ ...f, image: null }));
  };

  const handleSave = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append("phone", form.phone ?? "");
    data.append("description", form.description ?? "");
    if (user.Role === "Admin") data.append("socialLinks", form.socialLinks ?? "");
    if (form.image) data.append("image", form.image);

    try {
      await axios.put(`${API}/users/${user.id}`, data);
      setShowEdit(false);
      axios.get(`${API}/users/${user.id}`).then(res => {
        setUser(res.data);
        setPreviewImg(res.data.ImageURL ? `${API}/uploads/${res.data.ImageURL}` : null);
      });
    } catch (err) {
      alert("خطأ בשמירה: " + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return <div style={{ padding: 50, textAlign: "center" }}>טוען...</div>;

  const canEdit = currentUser?.id === user.id || currentUser?.role === "Admin";

  return (
    <div className="profile-main">
      <div className="profile-card">
        <div className="profile-img-wrap">
          <img
            src={user.ImageURL ? `${API}/uploads/${user.ImageURL}` : defaultAvatar}
            alt="profile"
            className="profile-img"
          />
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <div className="profile-email">{user.Email}</div>
          {user.Phone && <div className="profile-phone">{user.Phone}</div>}
          {user.Description && (
            <div className="profile-desc">{user.Description}</div>
          )}
          {user.Role === "Admin" && user.SocialLinks && (
            <div className="profile-social">
              <a href={user.SocialLinks} target="_blank" rel="noopener noreferrer">
                {user.SocialLinks}
              </a>
            </div>
          )}
        </div>
        {canEdit && (
          <button className="edit-btn" onClick={openEdit}>
            ערוך פרופיל
          </button>
        )}
      </div>

      {showEdit && form && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>עריכת פרופיל</h3>
            <form onSubmit={handleSave} className="edit-form">
              <label>תמונה:</label>
              <input type="file" name="image" accept="image/*" onChange={handleChange} />
              <div>
                {previewImg && <img src={previewImg} alt="" style={{ width: 70, borderRadius: 16, margin: 8 }} />}
                {/* زر إزالة الصورة */}
                {user.ImageURL &&
                  <button type="button" onClick={handleRemoveImage} className="remove-avatar-btn">
                    إزالة الصورة
                  </button>
                }
              </div>
              <label>טלפון:</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="text"
                placeholder="מס׳ טלפון"
              />
              <label>הגדרה עצמית:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="הצג את עצמך בכמה מילים..."
                rows={3}
              />
              {user.Role === "Admin" && (
                <>
                  <label>קישורים לרשתות:</label>
                  <input
                    name="socialLinks"
                    value={form.socialLinks}
                    onChange={handleChange}
                    type="text"
                    placeholder="https://instagram.com/..."
                  />
                </>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="submit" className="save-btn">שמור</button>
                <button type="button" onClick={() => setShowEdit(false)} className="cancel-btn">
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
