import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/ProfilePage.css";
import "../styles/PopupStyles.css";  
import defaultAvatar from "../assets/default-avatar.svg";

// مودال تغيير كلمة السر
function ChangePasswordPopup({ userId, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = async () => {
    setErr("");
    if (!oldPassword || !newPassword || !confirm) {
      setErr("אנא מלאו את כל השדות.");
      return;
    }
    if (newPassword.length < 6) {
      setErr("הסיסמה החדשה חייבת להיות באורך של לפחות 6 תווים.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("הסיסמה החדשה אינה תואמת");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8801/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה לא ידועה");
      setDone(true);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>שינוי סיסמה</h2>
        {done ? (
          <>
            <div style={{ color: "#299f37", fontWeight: "bold", margin: "16px 0" }}>
              הסיסמה שונתה בהצלחה!
            </div>
            <button className="close-btn" onClick={onClose}>סגור</button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="הסיסמה הנוכחית"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="אימות סיסמה חדשה"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            {err && <div className="error-text">{err}</div>}
            <button onClick={handleChange} disabled={loading}>
              {loading ? "מעדכן..." : "שנה סיסמה"}
            </button>
            <button className="close-btn" onClick={onClose} style={{ marginTop: 8 }}>
              ביטול
            </button>
          </>
        )}
      </div>
    </div>
  );
}
 
const API = "http://localhost:8801";
export default function ProfilePage() {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = id || currentUser.id;
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

// ============ הרשמה ==============
  const [showSubModal, setShowSubModal] = useState(false);
  const [subDetails, setSubDetails] = useState(null);

  // =========== שינוי סיסמה============
  const [showChangePw, setShowChangePw] = useState(false);

  // קבל נתוני פרופיל
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/users/${userId}`).then(res => {
      setUser(res.data);
      setPreviewImg(res.data.ImageURL ? `${API}/uploads/${res.data.ImageURL}` : null);
      if (res.data.Role === "Trainee") {
      // קבל פרטי מנוי
        axios.get(`${API}/subscription/active/${userId}`).then(sub => setSubDetails(sub.data));
      }
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
      alert("שגיאת שמירה:" + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return <div style={{ padding: 50, textAlign: "center" }}>טְעִינָה...</div>;

  const canEdit = currentUser?.id === user.id || currentUser?.role === "Admin";

 // מודל פרטי מנוי
  function SubscriptionModal() {
    if (!subDetails) return null;
    if (!subDetails.sub) {
      return (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <h3>פרטי מנוי</h3>
            <div>אין מנוי פעיל למשתמש זה.</div>
            <button className="cancel-btn" onClick={() => setShowSubModal(false)}>סגור</button>
          </div>
        </div>
      );
    }
    const start = new Date(subDetails.sub.StartDate).toLocaleDateString("he-IL");
    const end = new Date(subDetails.sub.EndDate).toLocaleDateString("he-IL");
    const daysLeft = Math.max(0, Math.ceil((new Date(subDetails.sub.EndDate) - new Date()) / (1000 * 60 * 60 * 24)));
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: 400 }}>
          <h3>פרטי מנוי</h3>
          <div>
            <b>סוג מנוי:</b> {subDetails.sub.Type === "Monthly" ? "חודשי" : "שנתי"}<br />
            <b>תאריך התחלה:</b> {start}<br />
            <b>תוקף עד:</b> {end}<br />
            <b>ימים נשארו:</b> {daysLeft}
          </div>
          <button className="cancel-btn" onClick={() => setShowSubModal(false)}>סגור</button>
        </div>
      </div>
    );
  }

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
            <>
              <button className="edit-btn-wide" onClick={openEdit}>
                ערוך פרופיל
              </button>
              <button
                className="edit-btn-wide"
                style={{
                  background: "#75c8ea",
                  marginTop: 8,
                  fontWeight: "bold",
                  fontSize: 15,
                }}
                onClick={() => setShowChangePw(true)}
              >
                שנה סיסמה
              </button>
            </>
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
          {/* כפתור פרטי מנוי */}
          {user.Role === "Trainee" && (
            <button
              className="show-sub-btn"
              style={{
                marginTop: 14,
                background: "#a68cf1",
                color: "#fff",
                padding: "7px 18px",
                border: "none",
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
              }}
              onClick={() => setShowSubModal(true)}
            >
              פרטי מנוי
            </button>
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

      {showSubModal && <SubscriptionModal />}
      {showChangePw && (
        <ChangePasswordPopup
          userId={user.id}
          onClose={() => setShowChangePw(false)}
        />
      )}
    </div>
  );
}
