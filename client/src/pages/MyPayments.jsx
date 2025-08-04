// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import "../styles/MyPayments.css";
const API = "http://localhost:8801";

export default function MyOrders() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userId = currentUser?.id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchOrders();
    // eslint-disable-next-line
  }, [userId]);

  function fetchOrders() {
    setLoading(true);
    fetch(`${API}/orders/user/${userId}`)
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  async function cancelOrder(orderId) {
    if (!window.confirm("האם את בטוחה שברצונך לבטל את ההזמנה?")) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert(data.error || "שגיאה בביטול ההזמנה");
      }
    } catch {
      alert("שגיאה בביטול ההזמנה");
    }
    setCancelLoading(false);
  }

  async function openOrderDetails(order) {
    setSelectedOrder(order);

    fetch(`${API}/orders/${order.OrderID}/products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));

    fetch(`${API}/payments/order/${order.OrderID}`)
      .then(res => res.json())
      .then(setPayment)
      .catch(() => setPayment(null));
  }

  if (!userId) return <div>משתמש לא מזוהה</div>;

  function StatusBadge({ status }) {
    let label = "";
    let cls = "status-badge ";
    switch (status) {
      case "Pending": label = "ממתינה"; cls += "pending"; break;
      case "Accepted": label = "התקבלה"; cls += "accepted"; break;
      case "Completed": label = "הושלם"; cls += "completed"; break;
      case "Cancelled": label = "בוטלה"; cls += "cancelled"; break;
      default: label = status;
    }
    return <span className={cls}>{label}</span>;
  }

  return (
    <div className="payments-history">
      <h2 style={{textAlign:"center", color:"#845ec2"}}>ההזמנות שלי</h2>
      {loading ? (
        <div style={{textAlign:"center", margin:50}}>טוען...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>מס'</th>
              <th>תאריך</th>
              <th>סכום</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{textAlign:'center', color:'#999', padding:20}}>אין הזמנות להצגה</td>
              </tr>
            )}
            {orders.map((order, i) => (
              <tr key={order.OrderID}>
                <td>{order.OrderID}</td>
                <td>{order.OrderDate ? new Date(order.OrderDate).toLocaleDateString("he-IL") : '-'}</td>
                <td>{order.TotalPrice} ₪</td>
                <td><StatusBadge status={order.Status} /></td>
                <td>
                  <div className="action-group">
                    <button
                      className="actionBtn viewBtn"
                      onClick={() => openOrderDetails(order)}
                    >צפייה</button>
                    {order.Status === "Pending" &&
                      <button
                        className="actionBtn cancelBtn"
                        onClick={() => cancelOrder(order.OrderID)}
                        disabled={cancelLoading}
                      >בטלי הזמנה</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {selectedOrder && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button
              className="closeBtn"
              onClick={() => setSelectedOrder(null)}
              title="סגור"
            >×</button>
            <h3>פרטי הזמנה #{selectedOrder.OrderID}</h3>
            <div style={{marginBottom:12}}>
             <b>תאריך:</b> {selectedOrder.OrderDate ? new Date(selectedOrder.OrderDate).toLocaleDateString("he-IL") : '-'}
              <br />
              <b>סטטוס:</b> <StatusBadge status={selectedOrder.Status} />
            </div>
            <table>
              <thead>
                <tr>
                  <th>מוצר</th>
                  <th>כמות</th>
                  <th>מחיר יח'</th>
                  <th>סה"כ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.Name}</td>
                    <td>{p.Quantity}</td>
                    <td>{(+p.Price).toFixed(2)} ₪</td>
                    <td>{(+p.Price * +p.Quantity).toFixed(2)} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payment && (
              <div style={{
                marginTop:24, borderTop:'1px solid #eee', paddingTop:10,
                fontSize:16, background:'#faf7fd', borderRadius:10
              }}>
                <h4 style={{margin:"0 0 8px 0", color:"#845ec2"}}>חשבונית מס / קבלה</h4>
                <table>
                  <tbody>
                    <tr><td>מס׳ תשלום:</td><td>{payment.PaymentID}</td></tr>
                    <tr><td>סכום לתשלום:</td><td>{payment.Amount} ₪</td></tr>
                    <tr><td>סטטוס:</td><td>{payment.Status === "Completed" ? "שולם" : payment.Status}</td></tr>
                    <tr><td>תאריך תשלום:</td><td>{payment.PaymentDate ? new Date(payment.PaymentDate).toLocaleString("he-IL") : "-"}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
