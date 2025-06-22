import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/Shop.css";

export default function Shop() {
  // جلب بيانات المستخدم الحالية من localStorage
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userId = user?.id;

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortType, setSortType] = useState("default");
  const [searchText, setSearchText] = useState("");

  // لمنع تكرار تحميل السلة أول مرة فقط
  const loadedCart = useRef(false);

  // جلب الكاتيجوريز
  useEffect(() => {
    axios.get("http://localhost:8801/categories").then(res => {
      setCategories(res.data);
    });
  }, []);

  // جلب المنتجات حسب الفئة المختارة
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

  // استرجاع السلة من localStorage عند أول تحميل فقط
  useEffect(() => {
    if (!userId) return;
    if (loadedCart.current) return;
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved && saved !== "[]") setCart(JSON.parse(saved));
    loadedCart.current = true;
  }, [userId]);

  // حفظ السلة تلقائياً في localStorage عند كل تغيير في cart
  useEffect(() => {
    if (!userId) return;
    // فقط إذا تغيرت فعلاً (أي السلة ليست undefined)
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
  }, [cart, userId]);

  // حذف السلة عند تسجيل الخروج (يفضل وضعها بمكان تسجيل الخروج الفعلي أيضاً)
  // -- لن يتم هنا لأنك ذكرت أن لديك زر تسجيل الخروج في Sidebar
  // -- لكن للتأكد يمكنك تعديل handleLogout في Sidebar كما بالأسفل 👇

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
      prev
        .map(p =>
          p.ProductCode === code
            ? { ...p, qty: Math.min(p.Stock, p.qty + val) }
            : p
        )
        .filter(p => p.qty > 0)
    );
  }

  const total = cart.reduce((sum, p) => sum + p.Price * p.qty, 0);

  const filteredProducts = products.filter(prod =>
    prod.Name.toLowerCase().includes(searchText.toLowerCase())
  );

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
            {filteredProducts.map(prod => (
              <div className="product-card" key={prod.ProductCode}>
                <img
                  src={`http://localhost:8801/uploads/${prod.ImageURL}`}
                  alt={prod.Name}
                />
                <div className="prod-name">{prod.Name}</div>
                <div className="prod-desc">{prod.Descripetion}</div>
                <div className="prod-price">{prod.Price} ₪</div>
                <button
                  className="addcart-btn"
                  onClick={() => addToCart(prod)}
                >
                  הוסף לעגלה
                </button>
              </div>
            ))}
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
          {cart.map(item => (
            <div className="cart-item" key={item.ProductCode}>
              <img
                src={`http://localhost:8801/uploads/${item.ImageURL}`}
                alt={item.Name}
              />
              <div className="cart-details">
                <div>{item.Name}</div>
                <div>{item.Price} ₪</div>
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
          ))}
          <div className="cart-total">
            סה״כ: <b>{total.toFixed(2)} ₪</b>
          </div>
        </div>
      )}
    </div>
  );
}
