import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/AdminNewUsersBell.css";
import AdminUserPreviewModal from "./AdminUserPreviewModal";

export default function AdminNotificationsBell({ pollMs = 15000 }) {
  const navigate = useNavigate();

  // UI
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Data
  const [users, setUsers] = useState([]);
  const [stock, setStock] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  // Preview (user)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function fetchNewUsers() {
    try {
      setLoadingUsers(true);
      const res = await fetch("http://localhost:8801/admin/new-users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchLowStock() {
    try {
      setLoadingStock(true);
      const res = await fetch("http://localhost:8801/products/low-stock");
      const data = await res.json();
      setStock(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStock(false);
    }
  }

  useEffect(() => {
    fetchNewUsers();
    fetchLowStock();
    const id = setInterval(() => {
      fetchNewUsers();
      fetchLowStock();
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);


  const placePopover = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const W = 340;
    const margin = 8;
    let top = Math.round(r.bottom + margin);
    let left = Math.round(r.right - W);
    if (left < 8) left = 8;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - 8 - W;

    const popH = popRef.current ? popRef.current.offsetHeight : 420;
    if (top + popH > window.innerHeight - 8) {
      top = Math.round(r.top - margin - popH);
      if (top < 8) top = 8;
    }
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    placePopover();
    const onResize = () => placePopover();
    const onScroll = () => placePopover();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, users.length, stock.length]);


  useEffect(() => {
    function handleClickOutside(e) {
      if (!open) return;
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        popRef.current &&
        !popRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);


  async function handleClickUser(u) {
    try {
      await fetch("http://localhost:8801/admin/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id }),
      });
      setUsers(prev => prev.filter(x => x.id !== u.id));

      setPreviewLoading(true);
      const res = await fetch(`http://localhost:8801/admin/user/${u.id}`);
      const data = await res.json();
      setPreviewData(data);
      setPreviewOpen(true);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  }

   function handleClickStock(p) {
    setOpen(false);
    navigate(`/product-management?focus=${p.ProductCode}`);
  }

  const totalCount = users.length + stock.length;

  return (
    <div className="admin-newusers">
      <button
        ref={btnRef}
        className="nu-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="התראות"
        title="התראות"
      >
        <span className="nu-bell">🔔</span>
        {totalCount > 0 && <span className="nu-badge">{totalCount}</span>}
      </button>

      {open && (
        <div
          ref={popRef}
          className="nu-dropdown fixed"
          style={{ top: pos.top, left: pos.left }}
          role="dialog"
          aria-modal="true"
        >
          <div className="nu-header">התראות</div>

          <div className="nu-section-title">משתמשות חדשות {loadingUsers ? "…": `(${users.length})`}</div>
          {users.length === 0 ? (
            <div className="nu-empty small">אין נרשמות חדשות</div>
          ) : (
            <ul className="nu-list">
              {users.map(u => (
                <li key={u.id} className="nu-item" onClick={() => handleClickUser(u)}>
                  <img
                    src={u.imageURL ? `http://localhost:8801/uploads/${u.imageURL}` : defaultAvatar}
                    alt={u.name || "user"}
                    className="nu-avatar"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                  />
                  <div className="nu-meta">
                    <div className="nu-name">{u.name || "(ללא שם)"}</div>
                    <div className="nu-sub">
                      {u.email}
                      {u.created_at && (
                        <>
                          {" · "}
                          {new Date(u.created_at).toLocaleString("he-IL")}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="nu-divider" />

          <div className="nu-section-title">התראות מלאי {loadingStock ? "…": `(${stock.length})`}</div>
          {stock.length === 0 ? (
            <div className="nu-empty small">אין התראות מלאי</div>
          ) : (
            <ul className="nu-list">
              {stock.map(p => (
                <li key={p.ProductCode} className="nu-item" onClick={() => handleClickStock(p)}>
                  <div className="nu-prod-icon">⚠️</div>
                  <div className="nu-meta">
                    <div className="nu-name">{p.Name}</div>
                    <div className="nu-sub">מלאי נותר: <b>{p.Stock}</b></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <AdminUserPreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewData(null); }}
        data={previewData}
      />
      {previewLoading && <div style={{ display: 'none' }} aria-hidden="true" />}
    </div>
  );
}
