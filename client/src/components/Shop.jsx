import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Shop.css';

/** زر PayPal (Sandbox) */
function PayPalButtonInline({ amount, onApprove }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!amount || !window.paypal) return;

    let buttons;
    try {
      buttons = window.paypal.Buttons({
        style: { layout: 'vertical', label: 'pay' },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: Number(amount).toFixed(2) } }],
          }),
        onApprove: async (_data, actions) => {
          const details = await actions.order.capture(); // Sandbox
          onApprove?.(details);
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          alert('שגיאה בתשלום');
        },
      });
      buttons.render(containerRef.current);
    } catch (e) {
      console.error(e);
    }
    return () => {
      try { buttons && buttons.close(); } catch {}
    };
  }, [amount, onApprove]);

  return <div ref={containerRef} />;
}

export default function Shop() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const userId = user?.id;

  const [subscriptionActive, setSubscriptionActive] = useState(null);
  const [payType, setPayType] = useState(''); // Monthly | Yearly
  const [payError, setPayError] = useState('');

  const [cartPayOpen, setCartPayOpen] = useState(false);
  const [cartPayError, setCartPayError] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortType, setSortType] = useState('default');
  const [searchText, setSearchText] = useState('');

  const loadedCart = useRef(false);

  // حالة الاشتراك
  useEffect(() => {
    if (!userId) { setSubscriptionActive(false); return; }
    if (user?.role === 'Coach') { setSubscriptionActive(true); return; }
    fetch(`http://localhost:8801/subscription/active/${userId}`)
      .then(res => res.json())
      .then(data => setSubscriptionActive(data.active))
      .catch(() => setSubscriptionActive(false));
  }, [userId, user]);

  // التصنيفات
  useEffect(() => {
    axios.get('http://localhost:8801/categories').then(res => setCategories(res.data));
  }, []);

  // المنتجات حسب التصنيف
  useEffect(() => {
    if (!selectedCat) return;
    axios.get('http://localhost:8801/products').then(res => {
      const filtered = res.data.filter(
        p => p.CategoryID === selectedCat.CategoryID && p.Stock > 0
      );
      setProducts(filtered);
      setSortType('default');
      setSearchText('');
    });
  }, [selectedCat]);

  // تحميل/حفظ السلة محلياً
  useEffect(() => {
    if (!userId || loadedCart.current) return;
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved && saved !== '[]') setCart(JSON.parse(saved));
    loadedCart.current = true;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
  }, [cart, userId]);

  // تحقّق عند فتح العربة
  useEffect(() => {
    if (!cartOpen || cart.length === 0) return;
    axios.get('http://localhost:8801/products').then(res => {
      const validProductCodes = res.data.map(p => p.ProductCode);
      const archived = cart.filter(item => !validProductCodes.includes(item.ProductCode));
      if (archived.length > 0) {
        setCart(prev => prev.filter(item => validProductCodes.includes(item.ProductCode)));
        alert('חלק מהמוצרים הוסרו מהעגלה כיוון שאינם זמינים יותר בחנות.');
      }
    });
  }, [cartOpen, cart]);

  // VAT
  const [vatPercent, setVatPercent] = useState(17);
  useEffect(() => {
    fetch('http://localhost:8801/settings/vat')
      .then(res => res.json())
      .then(data => { if (typeof data.vat === 'number') setVatPercent(data.vat); })
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(prod =>
    prod.Name.toLowerCase().includes(searchText.toLowerCase())
  );

  const baseAmount   = cart.reduce((sum, p) => sum + p.Price * p.qty, 0);
  const vatAmount    = +(baseAmount * vatPercent / 100).toFixed(2);
  const totalWithVat = +(baseAmount + vatAmount).toFixed(2);

  function handleSort(e) {
    const value = e.target.value;
    setSortType(value);
    let sorted = [...products];
    switch (value) {
      case 'priceAsc':  sorted.sort((a,b) => a.Price - b.Price); break;
      case 'priceDesc': sorted.sort((a,b) => b.Price - a.Price); break;
      case 'name':      sorted.sort((a,b) => a.Name.localeCompare(b.Name)); break;
      default:          sorted = [...products];
    }
    setProducts(sorted);
  }

  function addToCart(product) {
    setCart(prev => {
      const exist = prev.find(p => p.ProductCode === product.ProductCode);
      if (exist) {
        if (exist.qty >= product.Stock) { alert('לא ניתן להוסיף יותר מהמלאי הקיים!'); return prev; }
        return prev.map(p => p.ProductCode === product.ProductCode ? { ...p, qty: p.qty + 1 } : p);
      }
      if (product.Stock > 0) return [...prev, { ...product, qty: 1 }];
      alert('המוצר אינו זמין במלאי!');
      return prev;
    });
  }

  const removeFromCart = (code) =>
    setCart(prev => prev.filter(p => p.ProductCode !== code));

  function changeQty(code, val) {
    setCart(prev => prev.map(p => {
      if (p.ProductCode === code) {
        const newQty = Math.max(1, Math.min(p.Stock, p.qty + val));
        return { ...p, qty: newQty };
      }
      return p;
    }));
  }

  // موافقة دفع اشتراك من PopUp (PayPal) — للشوب بنسجّل اشتراك وصول "ShopAccess"
  async function handleApproveSubscriptionViaPayPal(details, amount) {
    setPayError('');
    try {
      const today = new Date();
      const endDate = new Date(today);
      if (payType === 'Monthly') endDate.setMonth(today.getMonth() + 1);
      if (payType === 'Yearly')  endDate.setFullYear(today.getFullYear() + 1);

      // اشتراك وصول للشوب
      const addRes = await fetch('http://localhost:8801/subscription/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: payType,
          startDate: today.toISOString().slice(0,10),
          endDate:   endDate.toISOString().slice(0,10),
          baseAmount: Number(amount),
          membershipType: 'ShopAccess',
          cardHolder: 'PayPalSandbox-Shop'
        }),
      });
      if (!addRes.ok) {
        const err = await addRes.json().catch(()=>({}));
        throw new Error(err?.error || 'Subscription add failed');
      }

      // تسجيل دفعة
      try {
        await fetch('http://localhost:8801/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            amount: Number(amount),
            paymentFor: 'Subscription',
            referenceId: details?.id || null,
            status: 'Completed'
          })
        });
      } catch (e) { console.warn('Payments log failed:', e); }

      setSubscriptionActive(true);
    } catch {
      setPayError('התשלום נכשל! נסי שוב.');
    }
  }

  // موافقة دفع عربة التسوّق (PayPal)
  async function handleApproveCartViaPayPal(details) {
    setCartPayError('');
    try {
      const orderRes = await axios.post('http://localhost:8801/orders', {
        userId,
        cart,
        total: totalWithVat,
      });
      await axios.post('http://localhost:8801/payments', {
        userId,
        amount: totalWithVat,
        paymentFor: 'Order',
        referenceId: orderRes.data.orderId || details?.id || null,
        status: 'Completed',
      });
      setCart([]);
      setCartPayOpen(false);
      setCartOpen(false);
      alert('התשלום בוצע בהצלחה! ההזמנה התקבלה.');
    } catch (err) {
      console.error(err);
      setCartPayError('התשלום נכשל! נסה שוב מאוחר יותר.');
    }
  }

  if (subscriptionActive === null) {
    return <div style={{ textAlign:'center', marginTop:80, fontSize:24 }}>טוען...</div>;
  }

  // PopUp اشتراك الشوب (PayPal فقط)
  if (subscriptionActive === false) {
    const amount = payType === 'Monthly' ? 70 : (payType === 'Yearly' ? 700 : 0);
    const readyForPayPal = amount > 0;

    return (
      <div className="popup-overlay">
        <div className="popup-box" style={{ maxWidth: 420, marginTop: 120 }}>
          <div className="popup-header">
            <h2 style={{margin:0}}>הצטרפי כמנויה כדי להמשיך</h2>
          </div>
          <div className="popup-content">
            <div style={{ marginBottom: 14, color:'#999' }}>
              יש להשלים תשלום מנוי כדי לגשת לחנות.
            </div>

            <select
              style={{ width:'100%', marginBottom:10 }}
              value={payType}
              onChange={e => setPayType(e.target.value)}
            >
              <option value="">בחרי סוג מנוי...</option>
              <option value="Monthly">מנוי חודשי — 70₪</option>
              <option value="Yearly">מנוי שנתי — 700₪</option>
            </select>

            <div style={{ background:'#faf7fd', border:'1px solid #eee', borderRadius:10, padding:10, marginBottom:10 }}>
              סכום לתשלום: <b>{amount || 0} ₪</b>
            </div>

            {payError && <div style={{ color:'red', fontSize:14, marginBottom:6 }}>{payError}</div>}

            <div className="paypal-wrap" style={{ opacity: readyForPayPal ? 1 : 0.5 }}>
              {readyForPayPal ? (
                <PayPalButtonInline
                  amount={amount}
                  onApprove={(details) => handleApproveSubscriptionViaPayPal(details, amount)}
                />
              ) : (
                <button style={{ width:'100%', padding:'10px 0' }} disabled>
                  בחרי סוג מנוי להצגת תשלום PayPal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // واجهة المتجر
  return (
    <div className="shop-wrapper">
      <button className="cart-btn" onClick={() => setCartOpen(true)}>
        🛒 עגלה ({cart.reduce((sum, item) => sum + item.qty, 0)})
      </button>

      {!selectedCat ? (
        <div className="categories-list">
          <h2>קטגוריות</h2>
          <div className="categories-cards">
            {categories.map(cat => (
              <div className="category-card" key={cat.CategoryID} onClick={() => setSelectedCat(cat)}>
                {cat.ImageURL ? (
                  <img src={`http://localhost:8801/uploads/${cat.ImageURL}`} alt={cat.CategoryName} />
                ) : (<span className="noimg">📦</span>)}
                <div>{cat.CategoryName}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="products-list">
          <button className="back-btn" onClick={() => setSelectedCat(null)}>← חזרה לקטגוריות</button>
          <h2>{selectedCat.CategoryName}</h2>
          <div style={{ display:'flex', gap:12, margin:'10px 0' }}>
            <select className="sort-select" onChange={handleSort} value={sortType} style={{ padding:'8px 20px' }}>
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
              style={{ padding:'8px 20px', borderRadius:10, border:'1px solid #ccc', fontSize:15 }}
            />
          </div>
          <div className="products-cards">
            {filteredProducts.length === 0 && <div>אין מוצרים זמינים כרגע.</div>}
            {filteredProducts.map(prod => {
              const priceWithVat = +(prod.Price * (1 + vatPercent / 100)).toFixed(2);
              return (
                <div className="product-card" key={prod.ProductCode}>
                  <img src={`http://localhost:8801/uploads/${prod.ImageURL}`} alt={prod.Name} />
                  <div className="prod-name">{prod.Name}</div>
                  <div className="prod-desc">{prod.Descripetion}</div>
                  <div style={{ fontWeight:'bold', color:'#8c51c7' }}>
                    מחיר לצרכן: {priceWithVat} ₪ <span style={{ fontWeight:'normal', color:'#888', fontSize:13 }}>(כולל מע״מ)</span>
                  </div>
                  <div style={{ color:'#aaa', fontSize:14 }}>מחיר לפני מע״מ: {prod.Price} ₪</div>
                  <button className="addcart-btn" onClick={() => addToCart(prod)} disabled={prod.Stock <= 0}>
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
          <button className="close-btn" onClick={() => setCartOpen(false)}>×</button>
          <h3>עגלת קניות</h3>

          {cart.length === 0 && <div>העגלה ריקה.</div>}

          {cart.map(item => {
            const itemPriceWithVat = +(item.Price * (1 + vatPercent / 100)).toFixed(2);
            return (
              <div className="cart-item" key={item.ProductCode}>
                <img src={`http://localhost:8801/uploads/${item.ImageURL}`} alt={item.Name} />
                <div className="cart-details">
                  <div>{item.Name}</div>
                  <div>מחיר: {itemPriceWithVat} ₪ <span style={{ color:'#aaa', fontSize:12 }}>(כולל מע״מ)</span></div>
                  <div className="qty-controls">
                    <button onClick={() => changeQty(item.ProductCode, -1)} disabled={item.qty === 1}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => { if (item.qty < item.Stock) changeQty(item.ProductCode, 1); else alert('לא ניתן להוסיף יותר מהמלאי הקיים!'); }}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.ProductCode)}>מחק</button>
              </div>
            );
          })}

          <div className="cart-total">
            סה״כ לתשלום: <b>{totalWithVat} ₪</b> <span style={{ color:'#888', fontSize:13 }}>(כולל מע״מ)</span>
          </div>

          <button
            className="pay-btn"
            onClick={() => setCartPayOpen(true)}
            disabled={cart.length === 0}
            style={{
              marginTop: 20, padding: '12px 28px', borderRadius: 20,
              background: '#a68cf1', color: 'white', fontWeight: 'bold',
              fontSize: 18, border: 'none', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              opacity: cart.length === 0 ? 0.5 : 1
            }}
          >
            שלם עכשיו
          </button>
        </div>
      )}

      {/* نافذة دفع السلة (PayPal فقط) */}
      {cartPayOpen && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ minWidth: 340 }}>
            <div className="popup-header">
              <h2 style={{margin:0, color:'#a68cf1'}}>לתשלום</h2>
              <button onClick={() => setCartPayOpen(false)} style={{ fontSize:22, border:'none', background:'none' }}>×</button>
            </div>

            <div className="popup-content">
              <div style={{ background:'#faf7fd', borderRadius:10, padding:10, marginBottom:8, border:'1px solid #eee', fontSize:16 }}>
                <div>סה״כ מוצרים: <b>{baseAmount} ₪</b></div>
                <div>מע״מ ({vatPercent}%): <b>{vatAmount} ₪</b></div>
                <div style={{ fontWeight:600, color:'#845ec2', fontSize:18, marginTop:7 }}>
                  סה״כ לתשלום: <b>{totalWithVat} ₪</b>
                </div>
              </div>

              {cartPayError && <div style={{ color:'red', fontSize:14, marginBottom:6 }}>{cartPayError}</div>}

              <div className="paypal-wrap">
                <PayPalButtonInline amount={totalWithVat} onApprove={handleApproveCartViaPayPal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
