// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/admin-orders.module.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    fetchOrders();
  }, []);
  async function fetchOrders() {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:8801/orders/admin");
      setOrders(data);
    } catch {
      alert("שגיאה בטעינת ההזמנות");
    }
    setLoading(false);
  }
  async function openOrderDetails(order) {
    setSelectedOrder(order);
    try {
      const { data } = await axios.get(`http://localhost:8801/orders/${order.OrderID}/products`);
      setProducts(data);
    } catch {
      setProducts([]);
    }
  }
  async function changeOrderStatus(orderId, newStatus) {
    setUpdating(true);
    try {
      await axios.put(`http://localhost:8801/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      setSelectedOrder(null);
    } catch {
      alert("שגיאה בעדכון סטטוס הזמנה");
    }
    setUpdating(false);
  }
  // פונקציה שמחזירה טקסט לפי הסטטוס
  function statusText(status) {
    switch (status) {
      case "Pending": return "ממתינה";
      case "Accepted": return "התקבלה";
      case "Completed": return "הושלם";
      case "Cancelled": return "בוטל";
      default: return status;
    }
  }
  return (
    <div className={styles.adminOrdersPage}>
      <h2 className={styles.pageTitle}>ניהול הזמנות</h2>
      {loading ? (
        <div className={styles.loader}>טוען...</div>
      ) : (
        <div className={styles.ordersTableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>מס'</th>
                <th>שם לקוחה</th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>תאריך הזמנה</th>
                <th>סטטוס</th>
                <th>סכום</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>אין הזמנות</td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={order.OrderID}>
                    <td>{idx + 1}</td>
                    <td>{order.Name}</td>
                    <td>{order.Phone || "-"}</td>
                    <td>{order.Email}</td>
                    <td>{new Date(order.OrderDate).toLocaleDateString("he-IL")}</td>
                    <td>
                      <span className={`${styles.status} ${styles[order.Status.toLowerCase()]}`}>
                        {statusText(order.Status)}
                      </span>
                    </td>
                    <td>{order.TotalPrice} ₪</td>
                    <td>
                      <button className={styles.viewBtn} onClick={() => openOrderDetails(order)}>
                        צפייה
                      </button>
                      {order.Status === "Pending" && (
                        <>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => changeOrderStatus(order.OrderID, "Accepted")}
                            disabled={updating}
                          >
                            קבלתי את ההזמנה
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => changeOrderStatus(order.OrderID, "Cancelled")}
                            disabled={updating}
                          >
                            בטל
                          </button>
                        </>
                      )}
                      {order.Status === "Accepted" && (
                        <button
                          className={styles.completeBtn}
                          onClick={() => changeOrderStatus(order.OrderID, "Completed")}
                          disabled={updating}
                        >
                          סמן כהושלם
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
       {selectedOrder && (
        <div className={styles.popupOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.popupBox} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button>
            <h3 style={{ margin: 0 }}>פרטי הזמנה #{selectedOrder.OrderID}</h3>
            <div style={{ marginBottom: 12 }}>
              <b>לקוחה:</b> {selectedOrder.Name} <br />
              <b>טלפון:</b> {selectedOrder.Phone || "-"}<br />
              <b>אימייל:</b> {selectedOrder.Email}<br />
              <b>תאריך:</b> {new Date(selectedOrder.OrderDate).toLocaleString("he-IL")}
            </div>
            <table className={styles.productsTable}>
              <thead>
                <tr>
                  <th>מוצר</th>
                  <th>תמונה</th>
                  <th>כמות</th>
                  <th>מחיר יח'</th>
                  <th>סה"כ</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.ProductCode}>
                    <td>{p.Name}</td>
                    <td>
                      {p.ImageURL ? (
                        <img src={`http://localhost:8801/uploads/${p.ImageURL}`} alt={p.Name} style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8 }} />
                      ) : "-"}
                    </td>
                    <td>{p.Quantity}</td>
                    <td>{(+p.Price).toFixed(2)} ₪</td>
                    <td>{(+p.Price * +p.Quantity).toFixed(2)} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.popupFooter}>
              <b>סה"כ לתשלום: {selectedOrder.TotalPrice} ₪</b>
              <span style={{ float: "left", color: "#999", fontSize: 15 }}>
                סטטוס: <b>{statusText(selectedOrder.Status)}</b>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}