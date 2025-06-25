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
      alert("خطأ بالحفظ: " + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return <div style={{ padding: 50, textAlign: "center" }}>טְעִינָה...</div>;

  const canEdit = currentUser?.id === user.id || currentUser?.role === "Admin";

  return (
    <div className="profile-main-wide">
      <div className="profile-card-wide">
        <div className="profile-image-section">
          <div className="profile-img-wrap-wide">
            <img
              src={user.ImageURL ? `${API}/uploads/${user.ImageURL}` : defaultAvatar}
              alt="profile"
              className="profile-img-wide"
            />
          </div>
          {canEdit && (
            <button className="edit-btn-wide" onClick={openEdit}>
            ערוך פרופיל
            </button>
          )}
        </div>
        <div className="profile-details-section">
          <h2 className="profile-name">{user.name}</h2>
          <div className="profile-row">
            <span className="profile-icon">📧</span>
            <span className="profile-email">{user.Email}</span>
            {user.Phone && (
              <>
                <span className="profile-divider">|</span>
                <span className="profile-icon">📱</span>
                <span className="profile-phone">{user.Phone}</span>
              </>
            )}
          </div>
          {user.Description && (
            <div className="profile-desc-wide">{user.Description}</div>
          )}
          {user.Role === "Admin" && user.SocialLinks && (
            <div className="profile-social-wide">
              <a href={user.SocialLinks} target="_blank" rel="noopener noreferrer">
                {user.SocialLinks}
              </a>
            </div>
          )}
        </div>
      </div>

      {showEdit && form && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ערוך פרופיל </h3>
             <form onSubmit={handleSave} className="edit-form">
              <label>התמונה:</label>
              <input type="file" name="image" accept="image/*" onChange={handleChange} />
              <div>
                {previewImg && <img src={previewImg} alt="" style={{ width: 70, borderRadius: 16, margin: 8 }} />}
                {user.ImageURL &&
                  <button type="button" onClick={handleRemoveImage} className="remove-avatar-btn">
                  הסר תמונה
                  </button>
                }
              </div>
              <label>טֵלֵפוֹן:</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="text"
                placeholder="מספר טלפון"
              />
              <label> פרופיל אישי:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="תציג את עצמך בקצרה..."
                rows={3}
              />
              {user.Role === "Admin" && (
                <>
                  <label>קישורים חברתיים:</label>
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
                <button type="submit" className="save-btn">שמירה</button>
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
