import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/Shop.css";

export default function Shop() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userId = user?.id;

  const [subscriptionActive, setSubscriptionActive] = useState(null);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [payType, setPayType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [cartPayOpen, setCartPayOpen] = useState(false);
  const [cartPayLoading, setCartPayLoading] = useState(false);
  const [cartPayError, setCartPayError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortType, setSortType] = useState("default");
  const [searchText, setSearchText] = useState("");

  const loadedCart = useRef(false);

  function formatCardNumber(str) {
    return str.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

   useEffect(() => {
    if (!userId) {
      setSubscriptionActive(false);
      return;
    }
     if (user?.role === "Coach") {
      setSubscriptionActive(true);
      return;
    }
     fetch(`http://localhost:8801/subscription/active/${userId}`)
      .then(res => res.json())
      .then(data => setSubscriptionActive(data.active))
      .catch(() => setSubscriptionActive(false));
  }, [userId, user]);

  useEffect(() => {
    axios.get("http://localhost:8801/categories").then(res => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    axios.get("http://localhost:8801/products").then(res => {
      const filtered = res.data.filter(
        p => p.CategoryID === selectedCat.CategoryID && p.Stock > 0
      );
      setProducts(filtered);
      setSortType("default");
      setSearchText("");
    });
  }, [selectedCat]);

  useEffect(() => {
    if (!userId) return;
    if (loadedCart.current) return;
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved && saved !== "[]") setCart(JSON.parse(saved));
    loadedCart.current = true;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
  }, [cart, userId]);

  useEffect(() => {
    if (!cartOpen || cart.length === 0) return;
    axios.get("http://localhost:8801/products").then(res => {
      const validProductCodes = res.data.map(p => p.ProductCode);
      const archived = cart.filter(item => !validProductCodes.includes(item.ProductCode));
      if (archived.length > 0) {
        setCart(prev => prev.filter(item => validProductCodes.includes(item.ProductCode)));
        alert("חלק מהמוצרים הוסרו מהעגלה כיוון שאינם זמינים יותר בחנות.");
      }
    });
  }, [cartOpen, cart]);

  async function handleFakePayment() {
    setPayLoading(true);
    setPayError('');
    if (!payType || !cardNumber || !exp || !cvv) {
      setPayError("נא למלא את כל השדות");
      setPayLoading(false);
      return;
    }
    try {
      const today = new Date();
      let endDate;
      if (payType === 'Monthly') {
        endDate = new Date(today); endDate.setMonth(today.getMonth() + 1);
      } else if (payType === 'Yearly') {
        endDate = new Date(today); endDate.setFullYear(today.getFullYear() + 1);
      }
      const start = today.toISOString().slice(0, 10);
      const end = endDate.toISOString().slice(0, 10);
      await fetch('http://localhost:8801/subscription/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: payType,
          startDate: start,
          endDate: end,
          totalAmount: payType === 'Monthly' ? 70 : 700
        })
      });
      setSubscriptionActive(true);
      setShowPayPopup(false);
    } catch {
      setPayError('התשלום נכשל! נסי שוב.');
    }
    setPayLoading(false);
  }

  function handleSort(e) {
    const value = e.target.value;
    setSortType(value);

    let sorted = [...products];
    switch (value) {
      case "priceAsc":
        sorted.sort((a, b) => a.Price - b.Price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.Price - a.Price);
        break;
      case "name":
        sorted.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      default:
        sorted = [...products];
    }
    setProducts(sorted);
  }

  function addToCart(product) {
    setCart(prev => {
      const exist = prev.find(p => p.ProductCode === product.ProductCode);
      if (exist) {
        if (exist.qty >= product.Stock) {
          alert("לא ניתן להוסיף יותר מהמלאי הקיים!");
          return prev;
        }
        return prev.map(p =>
          p.ProductCode === product.ProductCode
            ? { ...p, qty: p.qty + 1 }
            : p
        );
      }
      if (product.Stock > 0) {
        return [...prev, { ...product, qty: 1 }];
      }
      alert("המוצר אינו זמין במלאי!");
      return prev;
    });
  }

  function removeFromCart(code) {
    setCart(prev => prev.filter(p => p.ProductCode !== code));
  }

  function changeQty(code, val) {
    setCart(prev =>
      prev.map(p => {
        if (p.ProductCode === code) {
          let newQty = Math.max(1, Math.min(p.Stock, p.qty + val));
          return { ...p, qty: newQty };
        }
        return p;
      })
    );
  }

  const vatPercent = 17;
  const filteredProducts = products.filter(prod =>
    prod.Name.toLowerCase().includes(searchText.toLowerCase())
  );

  // סכומים עם מע״מ
  const baseAmount = cart.reduce((sum, p) => sum + p.Price * p.qty, 0);
  const vatAmount = +(baseAmount * vatPercent / 100).toFixed(2);
  const totalWithVat = +(baseAmount + vatAmount).toFixed(2);

  async function handleCartPayment({ name, card, exp, cvv }) {
    setCartPayLoading(true);
    setCartPayError('');
    if (!name || !card || !exp || !cvv) {
      setCartPayError("נא למלא את כל השדות");
      setCartPayLoading(false);
      return;
    }
    try {
      const orderRes = await axios.post("http://localhost:8801/orders", {
        userId,
        cart,
        total: totalWithVat,
      });
      await axios.post("http://localhost:8801/payments", {
        userId,
        amount: totalWithVat,
        paymentFor: "Order",
        referenceId: orderRes.data.orderId,
        status: "Completed"
      });
      setCart([]);
      setCartPayOpen(false);
      setCartOpen(false);
      alert("התשלום בוצע בהצלחה! ההזמנה התקבלה.");
    } catch (err) {
      setCartPayError("התשלום נכשל! נסה שוב מאוחר יותר.");
    }
    setCartPayLoading(false);
  }

  function CartPayPopup({ open, onClose, onConfirm, loading, error }) {
    const [name, setName] = useState("");
    const [card, setCard] = useState("");
    const [exp, setExp] = useState("");
    const [cvv, setCvv] = useState("");

    useEffect(() => {
      if (!open) {
        setName(""); setCard(""); setExp(""); setCvv("");
      }
    }, [open]);

    if (!open) return null;

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "white", padding: 32, borderRadius: 20, minWidth: 340, boxShadow: "0 0 14px #ccc",
          display: "flex", flexDirection: "column", gap: 16
        }}>
          <button onClick={onClose} style={{ alignSelf: "end", fontSize: 22, border: "none", background: "none" }}>×</button>
          <h2 style={{ color: "#a68cf1", marginBottom: 8 }}>לתשלום</h2>
          <div style={{
            background: '#faf7fd', borderRadius: 10, padding: 10, marginBottom: 8, border: '1px solid #eee', fontSize: 16
          }}>
            <div>סה״כ מוצרים: <b>{baseAmount} ₪</b></div>
            <div>מע״מ ({vatPercent}%): <b>{vatAmount} ₪</b></div>
            <div style={{ fontWeight: 600, color: '#845ec2', fontSize: 18, marginTop: 7 }}>סה״כ לתשלום: <b>{totalWithVat} ₪</b></div>
          </div>
          <input placeholder="שם בעל הכרטיס" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <input
            placeholder="מספר כרטיס"
            dir="ltr"
            value={card}
            onChange={e => setCard(formatCardNumber(e.target.value))}
            maxLength={19}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="MM/YY"
              dir="ltr"
              value={exp}
              onChange={e => setExp(e.target.value.replace(/[^0-9/]/g, '').slice(0, 5))}
              maxLength={5}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              placeholder="CVV"
              dir="ltr"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          {error && <div style={{ color: "red", fontSize: 14, marginBottom: 6 }}>{error}</div>}
          <button
            style={{
              background: "#a68cf1", color: "white", fontWeight: "bold", padding: "10px 0", border: "none", borderRadius: 14,
              fontSize: 18
            }}
            onClick={() => onConfirm({ name, card, exp, cvv })}
            disabled={loading}
          >
            {loading ? "מעדכן..." : "אישור תשלום"}
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    padding: "10px 12px", borderRadius: 10, border: "1px solid #bbb", fontSize: 16
  };

  if (subscriptionActive === null) {
    return <div style={{ textAlign: "center", marginTop: 80, fontSize: 24 }}>טוען...</div>;
  }
  if (subscriptionActive === false || showPayPopup) {
    return (
      <div className="popup-overlay">
        <div className="popup-box" style={{ maxWidth: 400, marginTop: 120 }}>
          <h2 style={{ margin: "0 0 10px" }}>הצטרפי כמנויה כדי להמשיך</h2>
          <div style={{ marginBottom: 14, color: "#999" }}>
            יש להשלים תשלום מנוי כדי לגשת לחנות.
          </div>
          <select
            style={{ width: "100%", marginBottom: 10 }}
            value={payType}
            onChange={e => setPayType(e.target.value)}
          >
            <option value="">בחרי סוג מנוי...</option>
            <option value="Monthly">מנוי חודשי — 70₪</option>
            <option value="Yearly">מנוי שנתי — 700₪</option>
          </select>
          <input
            type="text"
            placeholder="מספר כרטיס אשראי"
            dir="ltr"
            value={formatCardNumber(cardNumber)}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            style={{ width: "100%", marginBottom: 8 }}
            maxLength={19}
          />
          <input
            type="text"
            placeholder="תוקף (MM/YY)"
            dir="ltr"
            value={exp}
            onChange={e => setExp(e.target.value.replace(/[^0-9/]/g, '').slice(0, 5))}
            style={{ width: "100%", marginBottom: 8 }}
            maxLength={5}
          />
          <input
            type="text"
            placeholder="CVV"
            dir="ltr"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ width: "100%", marginBottom: 8 }}
            maxLength={4}
          />
          {payError && <div style={{ color: "red", fontSize: 14, marginBottom: 6 }}>{payError}</div>}
          <button
            onClick={handleFakePayment}
            style={{ width: "100%", background: "#8c51c7", color: "#fff", fontWeight: 600, padding: "10px 0", marginTop: 4 }}
            disabled={payLoading}
          >
            {payLoading ? "מעדכן..." : "לתשלום"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-wrapper">
      <button className="cart-btn" onClick={() => setCartOpen(true)}>
        🛒 עגלה (
        {cart.reduce((sum, item) => sum + item.qty, 0)}
        )
      </button>

      {!selectedCat ? (
        <div className="categories-list">
          <h2>קטגוריות</h2>
          <div className="categories-cards">
            {categories.map(cat => (
              <div
                className="category-card"
                key={cat.CategoryID}
                onClick={() => setSelectedCat(cat)}
              >
                {cat.ImageURL ? (
                  <img
                    src={`http://localhost:8801/uploads/${cat.ImageURL}`}
                    alt={cat.CategoryName}
                  />
                ) : (
                  <span className="noimg">📦</span>
                )}
                <div>{cat.CategoryName}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="products-list">
          <button className="back-btn" onClick={() => setSelectedCat(null)}>
            ← חזרה לקטגוריות
          </button>
          <h2>{selectedCat.CategoryName}</h2>
          <div style={{ display: "flex", gap: 12, margin: "10px 0" }}>
            <select
              className="sort-select"
              onChange={handleSort}
              value={sortType}
              style={{ padding: "8px 20px" }}
            >
              <option value="default">מיון...</option>
              <option value="priceAsc">מחיר: מהזול ליקר</option>
              <option value="priceDesc">מחיר: מהיקר לזול</option>
              <option value="name">שם: א-ת</option>
            </select>
            <input
              type="text"
              className="search-bar"
              placeholder="חפש מוצר..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #ccc", fontSize: 15 }}
            />
          </div>
          <div className="products-cards">
            {filteredProducts.length === 0 && <div>אין מוצרים זמינים כרגע.</div>}
            {filteredProducts.map(prod => {
              const priceWithVat = +(prod.Price * (1 + vatPercent / 100)).toFixed(2);
              return (
                <div className="product-card" key={prod.ProductCode}>
                  <img
                    src={`http://localhost:8801/uploads/${prod.ImageURL}`}
                    alt={prod.Name}
                  />
                  <div className="prod-name">{prod.Name}</div>
                  <div className="prod-desc">{prod.Descripetion}</div>
                  <div style={{ fontWeight: "bold", color: "#8c51c7" }}>
                    מחיר לצרכן: {priceWithVat} ₪ <span style={{ fontWeight: "normal", color: "#888", fontSize: 13 }}>(כולל מע״מ)</span>
                  </div>
                  <div style={{ color: "#aaa", fontSize: 14 }}>
                    מחיר לפני מע״מ: {prod.Price} ₪
                  </div>
                  <button
                    className="addcart-btn"
                    onClick={() => addToCart(prod)}
                    disabled={prod.Stock <= 0}
                  >
                    הוסף לעגלה
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-sidebar">
          <button className="close-btn" onClick={() => setCartOpen(false)}>
            ×
          </button>
          <h3>עגלת קניות</h3>
          {cart.length === 0 && <div>העגלה ריקה.</div>}
          {cart.map(item => {
            const itemPriceWithVat = +(item.Price * (1 + vatPercent / 100)).toFixed(2);
            return (
              <div className="cart-item" key={item.ProductCode}>
                <img
                  src={`http://localhost:8801/uploads/${item.ImageURL}`}
                  alt={item.Name}
                />
                <div className="cart-details">
                  <div>{item.Name}</div>
                  <div>מחיר: {itemPriceWithVat} ₪ <span style={{ color: "#aaa", fontSize: 12 }}>(כולל מע״מ)</span></div>
                  <div className="qty-controls">
                    <button
                      onClick={() => changeQty(item.ProductCode, -1)}
                      disabled={item.qty === 1}
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => {
                        if (item.qty < item.Stock) changeQty(item.ProductCode, 1);
                        else alert("לא ניתן להוסיף יותר מהמלאי הקיים!");
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.ProductCode)}
                >
                  מחק
                </button>
              </div>
            );
          })}
          <div className="cart-total">
            סה״כ לתשלום: <b>{totalWithVat} ₪</b> <span style={{color:"#888", fontSize:13}}>(כולל מע״מ)</span>
          </div>
          <button
            className="pay-btn"
            onClick={() => setCartPayOpen(true)}
            disabled={cart.length === 0}
            style={{
              marginTop: 20,
              padding: '12px 28px',
              borderRadius: 20,
              background: '#a68cf1',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
              border: 'none',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              opacity: cart.length === 0 ? 0.5 : 1
            }}
          >
            שלם עכשיו
          </button>
        </div>
      )}

      <CartPayPopup
        open={cartPayOpen}
        onClose={() => setCartPayOpen(false)}
        onConfirm={handleCartPayment}
        loading={cartPayLoading}
        error={cartPayError}
      />
    </div>
  );
}
