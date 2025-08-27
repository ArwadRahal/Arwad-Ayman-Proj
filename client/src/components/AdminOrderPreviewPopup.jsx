import React from "react";

function onlyDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("he-IL");
  } catch {
    return "";
  }
}

export default function AdminOrderPreviewPopup({ open, onClose, data, onAccept }) {
  if (!open || !data) return null;
  const { order, products } = data;
  const total = Number(order?.TotalPrice || 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "min(860px, 95vw)",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 12px 40px #0001",
          padding: 18
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>פרטי הזמנה #{order?.OrderID}</h3>
          <button onClick={onClose} style={{ fontSize: 22, border: "none", background: "none" }}>×</button>
        </div>

        {/* Customer & meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, color: "#555" }}>
          <div>לקוחה: <b>{order?.Name}</b></div>
          <div>אימייל: <b>{order?.Email}</b></div>
          <div>טלפון: <b>{order?.Phone || "-"}</b></div>
          <div>תאריך: <b>{onlyDate(order?.OrderDate)}</b></div>
          <div>
            סטטוס:{" "}
            <b>
              {order?.Status === "Pending"
                ? "ממתינה"
                : order?.Status === "Accepted"
                ? "התקבלה"
                : order?.Status}
            </b>
          </div>
        </div>

        {/* Products table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
          <thead>
            <tr style={{ background: "#f7f2ff" }}>
              <th style={{ textAlign: "right", padding: 8 }}>מוצר</th>
              <th style={{ textAlign: "center", padding: 8 }}>תמונה</th>
              <th style={{ textAlign: "center", padding: 8 }}>כמות</th>
              <th style={{ textAlign: "center", padding: 8 }}>מחיר יח׳</th>
              <th style={{ textAlign: "center", padding: 8 }}>סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.ProductCode} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{p.Name}</td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  {p.ImageURL ? (
                    <img
                      src={`http://localhost:8801/uploads/${p.ImageURL}`}
                      alt={p.Name}
                      style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8 }}
                    />
                  ) : "—"}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>{p.Quantity}</td>
                <td style={{ padding: 8, textAlign: "center" }}>{(+p.Price).toFixed(2)} ₪</td>
                <td style={{ padding: 8, textAlign: "center" }}>{(+p.Price * +p.Quantity).toFixed(2)} ₪</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#888" }}>
            סה״כ לתשלום: <b style={{ color: "#222" }}>{total.toLocaleString()} ₪</b>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {order?.Status === "Pending" && (
              <button
                onClick={() => onAccept?.(order.OrderID)}
                style={{
                  background: "#7a57d1",
                  border: "none",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                התקבלה
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "#eee",
                border: "none",
                color: "#333",
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              סגירה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
