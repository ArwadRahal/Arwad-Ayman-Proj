import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ProductManagement.css';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('categories');
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newProduct, setNewProduct] = useState({
    Name: '',
    CategoryID: '',
    Type: '',           // اسم الكتغوريا
    Descripetion: '',
    Price: '',
    Stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [sortType, setSortType] = useState('default');
  const [descOpen, setDescOpen] = useState({});
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catImage, setCatImage] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState(null);
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const { data } = await axios.get('http://localhost:8801/products');
      setProducts(data);
      setOriginalProducts(data);
    } catch (err) {
      toast.error('שגיאה בקבלת המוצרים');
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await axios.get('http://localhost:8801/categories');
      setCategories(data);
    } catch (err) {
      toast.error('שגיאה בקבלת הקטגוריות');
    }
  }

  function handleSort(e) {
    const sortValue = e.target.value;
    setSortType(sortValue);
    let sorted = [...originalProducts];
    switch (sortValue) {
      case 'stockAsc':
        sorted.sort((a, b) => a.Stock - b.Stock);
        break;
      case 'stockDesc':
        sorted.sort((a, b) => b.Stock - a.Stock);
        break;
      case 'priceAsc':
        sorted.sort((a, b) => a.Price - b.Price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.Price - a.Price);
        break;
      default:
        sorted = [...originalProducts];
    }
    if (selectedCategory) {
      sorted = sorted.filter(p => p.CategoryID + '' === selectedCategory + '');
    }
    setProducts(sorted);
  }

  async function handleSaveProduct() {
    const { Name, CategoryID, Descripetion, Price, Stock } = newProduct;
    if (!Name || !CategoryID || !Descripetion || !Price || Stock === "") {
      toast.error('כל השדות נדרשים');
      return;
    }
    // فحص الكمية
    if (
      Stock === "" ||
      isNaN(Number(Stock)) ||
      Number(Stock) < 0 ||
      Stock.includes(".") ||
      !Number.isInteger(Number(Stock))
    ) {
      setStockError("יש להזין מספר שלם אי שלילי בלבד");
      return;
    }
    setStockError("");

    const formData = new FormData();
    formData.append('Name', Name);
    formData.append('CategoryID', CategoryID); // مهم!
    formData.append('Type', newProduct.Type);   // لعرض اسم الكتغوريا في المنتج (اختياري)
    formData.append('Descripetion', Descripetion);
    formData.append('Price', Price);
    formData.append('Stock', Stock);
    if (imageFile) formData.append('imageFile', imageFile);

    try {
      if (editIndex === null) {
        await axios.post('http://localhost:8801/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('המוצר נוסף בהצלחה!');
      } else {
        const code = products[editIndex].ProductCode;
        await axios.put(`http://localhost:8801/products/${code}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('המוצר עודכן בהצלחה!');
      }
      fetchProducts();
      closeProductPopup();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'שגיאה בשמירת המוצר');
    }
  }

  async function handleDelete(productCode, name) {
    if (!window.confirm(`האם למחוק את המוצר "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8801/products/${productCode}`);
      toast.success('המוצר נמחק');
      fetchProducts();
    } catch (err) {
      toast.error('שגיאה במחיקת המוצר');
    }
  }

  function handleEdit(product, idx) {
    setEditIndex(idx);
    setNewProduct({
      Name: product.Name,
      CategoryID: product.CategoryID,
      Type: product.Type || (categories.find(c => c.CategoryID === product.CategoryID)?.CategoryName || ""),
      Descripetion: product.Descripetion,
      Price: product.Price,
      Stock: product.Stock
    });
    setImageFile(null);
    setShowPopup(true);
    setStockError("");
  }

  function toggleDesc(code) {
    setDescOpen(prev => ({ ...prev, [code]: !prev[code] }));
  }

  function closeProductPopup() {
    setShowPopup(false);
    setEditIndex(null);
    setNewProduct({ Name: '', CategoryID: '', Type: '', Descripetion: '', Price: '', Stock: '' });
    setImageFile(null);
    setStockError("");
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error('נא להכניס שם קטגוריה');
      return;
    }
    const formData = new FormData();
    formData.append('CategoryName', newCategoryName);
    if (catImage) formData.append('imageFile', catImage);
    try {
      await axios.post('http://localhost:8801/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('הקטגוריה נוספה בהצלחה!');
      setShowCatPopup(false);
      setNewCategoryName('');
      setCatImage(null);
      fetchCategories();
    } catch (err) {
      toast.error('שגיאה בהוספת הקטגוריה');
    }
  }

  async function handleEditCategory() {
    if (!editCatName.trim()) {
      toast.error('יש להזין שם קטגוריה');
      return;
    }
    const formData = new FormData();
    formData.append('CategoryName', editCatName);
    if (editCatImage) formData.append('imageFile', editCatImage);
    try {
      await axios.put(`http://localhost:8801/categories/${editCat.CategoryID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('הקטגוריה עודכנה בהצלחה!');
      setEditCat(null);
      setEditCatImage(null);
      fetchCategories();
    } catch (err) {
      toast.error('שגיאה בעדכון הקטגוריה');
    }
  }

  function closeEditCat() {
    setEditCat(null);
    setEditCatImage(null);
    setEditCatName('');
  }

  function handleStockChange(e) {
    let value = e.target.value;
    // فقط أرقام صحيحة موجبة أو صفر
    if (value === "" || isNaN(Number(value)) || Number(value) < 0 || value.includes(".") || !Number.isInteger(Number(value))) {
      setStockError("יש להזין מספר שלם אי שלילי בלבד");
    } else {
      setStockError("");
    }
    value = value.replace(/[^0-9]/g, "");
    setNewProduct({ ...newProduct, Stock: value });
  }

  // هنا التعديل في طريقة عرض اسم التصنيف وعد المنتجات
  return (
    <div className="product-management-cards">
      <div className="product-management-header">
        <h2>ניהול מוצרים</h2>
        <button
          className="add-product-btn"
          onClick={() => {
            closeProductPopup();
            setShowPopup(true);
          }}
        >+ הוספת מוצר</button>

        <select
          className="sort-select"
          onChange={handleSort}
          value={sortType}
          disabled={viewMode === 'categories'}
        >
          <option value="default">סדר לפי...</option>
          <option value="stockAsc">כמות (מהנמוך לגבוה)</option>
          <option value="stockDesc">כמות (מהגבוה לנמוך)</option>
          <option value="priceAsc">מחיר (זול→יקר)</option>
          <option value="priceDesc">מחיר (יקר→זול)</option>
        </select>

        <button
          className="add-category-btn"
          onClick={() => setShowCatPopup(true)}
        >+ קטגוריה חדשה</button>
      </div>

      {/* ADD CATEGORY POPUP */}
      {showCatPopup && (
        <div className="popup-overlay">
          <div className="popup-box popup-box-category">
            <h3>הוספת קטגוריה</h3>
            <input
              type="text"
              placeholder="שם קטגוריה"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setCatImage(e.target.files[0])}
            />
            {catImage && <img
              src={URL.createObjectURL(catImage)}
              alt="תצוגה"
              style={{ width: 60, height: 60, borderRadius: 14, margin: '12px auto' }}
            />}
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleAddCategory}>הוסף</button>
              <button
                className="cancel-btn"
                onClick={() => { setShowCatPopup(false); setCatImage(null); }}
              >ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY POPUP */}
      {editCat && (
        <div className="popup-overlay">
          <div className="popup-box popup-box-category">
            <h3>עריכת קטגוריה</h3>
            <input
              type="text"
              value={editCatName}
              onChange={e => setEditCatName(e.target.value)}
              placeholder="שם קטגוריה"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setEditCatImage(e.target.files[0])}
            />
            {editCatImage ? (
              <img
                src={URL.createObjectURL(editCatImage)}
                alt="תצוגה"
                style={{ width: 60, height: 60, borderRadius: 14 }}
              />
            ) : editCat.ImageURL ? (
              <img
                src={`http://localhost:8801/uploads/${editCat.ImageURL}`}
                alt={editCat.CategoryName}
                style={{ width: 60, height: 60, borderRadius: 14 }}
              />
            ) : null}
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleEditCategory}>שמור</button>
              <button className="cancel-btn" onClick={closeEditCat}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES VIEW */}
      {viewMode === 'categories' ? (
        <div className="category-cards-list">
          {categories.map(cat => (
            <div
              key={cat.CategoryID}
              className="category-card"
              onClick={() => {
                setSelectedCategory(cat.CategoryID);  // CategoryID
                setViewMode('products');
              }}
            >
              <div className="category-image">
                {cat.ImageURL ? (
                  <img
                    src={`http://localhost:8801/uploads/${cat.ImageURL}`}
                    alt={cat.CategoryName}
                    className="category-img"
                  />
                ) : (
                  <span style={{ fontSize: '38px', color: '#b78fce' }}>📦</span>
                )}
              </div>
              <div className="category-name">
                {cat.CategoryName}
                <span style={{ fontSize: '12px', color: '#888', marginLeft: 6 }}>
                  (
                    {
                      products.filter(p => (p.CategoryID + '') === (cat.CategoryID + '')).length
                    }
                  )
                </span>
              </div>
              <button
                className="edit-cat-btn"
                onClick={e => {
                  e.stopPropagation();
                  setEditCat(cat);
                  setEditCatName(cat.CategoryName);
                  setEditCatImage(null);
                }}
              >ערוך</button>
            </div>
          ))}
        </div>
      ) : (
        /* PRODUCTS VIEW */
        <>
          <button
            className="back-to-categories-btn"
            onClick={() => setViewMode('categories')}
          >← חזור לקטגוריות</button>

          <div className="product-cards-list">
            {products
              .filter(p => (p.CategoryID + '') === (selectedCategory + ''))
              .map((prod, idx) => (
                <div className="product-card" key={prod.ProductCode}>
                  <img
                    className="product-image"
                    src={`http://localhost:8801/uploads/${prod.ImageURL}`}
                    alt={prod.Name}
                  />
                  <div className="product-info">
                    <h3>{prod.Name}</h3>
                    <p><b>סוג:</b> {categories.find(c => c.CategoryID === prod.CategoryID)?.CategoryName || ""}</p>
                    <button
                      className="desc-toggle-btn"
                      onClick={() => toggleDesc(prod.ProductCode)}
                    >
                      {descOpen[prod.ProductCode] ? 'הסתר תיאור' : 'הצג תיאור'}
                    </button>
                    {descOpen[prod.ProductCode] && (
                      <p className="desc-text">{prod.Descripetion}</p>
                    )}
                    <p><b>מחיר:</b> <span className="price">{prod.Price} ₪</span></p>
                    <p><b>מלאי:</b> <span className={prod.Stock <= 3 ? 'low-stock' : 'stock'}>{prod.Stock}</span></p>
                  </div>
                  <div className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(prod, idx)}>ערוך</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(prod.ProductCode, prod.Name)}
                    >מחק</button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* ADD / EDIT PRODUCT POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{editIndex !== null ? 'עריכת מוצר' : 'מוצר חדש'}</h3>
            <input
              type="text"
              placeholder="שם מוצר"
              value={newProduct.Name}
              onChange={e => setNewProduct({ ...newProduct, Name: e.target.value })}
            />
            {/* هنا التصحيح - يجب أن يختار الـ CategoryID */}
            <select
              className="popup-select"
              value={newProduct.CategoryID}
              onChange={e => {
                const catId = e.target.value;
                const cat = categories.find(c => c.CategoryID + '' === catId + '');
                setNewProduct({
                  ...newProduct,
                  CategoryID: catId,
                  Type: cat ? cat.CategoryName : ""
                });
              }}
            >
              <option value="">בחר קטגוריה...</option>
              {categories.map(cat => (
                <option key={cat.CategoryID} value={cat.CategoryID}>
                  {cat.CategoryName}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="תיאור"
              value={newProduct.Descripetion}
              onChange={e => setNewProduct({ ...newProduct, Descripetion: e.target.value })}
            />
            <input
              type="number"
              placeholder="מחיר"
              value={newProduct.Price}
              onChange={e => setNewProduct({ ...newProduct, Price: e.target.value })}
            />
            <input
              type="number"
              placeholder="מלאי"
              value={newProduct.Stock}
              min={0}
              step={1}
              onChange={handleStockChange}
              onWheel={e => e.target.blur()}
              required
              onKeyDown={e => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
              }}
            />
            {stockError && (
              <div style={{ color: "#d93025", fontSize: 14, marginTop: 4 }}>{stockError}</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files[0])}
            />
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="תצוגה מוקדמת"
                className="product-preview"
              />
            )}
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleSaveProduct} disabled={!!stockError}>
                {editIndex !== null ? 'שמור שינויים' : 'הוסף מוצר'}
              </button>
              <button className="cancel-btn" onClick={closeProductPopup}>בטל</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
