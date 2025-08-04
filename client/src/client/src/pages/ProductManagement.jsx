import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ProductManagement.css';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('categories');
  const [showPopup, setShowPopup] = useState(false);
  const [editProductCode, setEditProductCode] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState(null);
  const [newProduct, setNewProduct] = useState({
    Name: '',
    CategoryID: '',
    Type: '',
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
  const [priceError, setPriceError] = useState(""); // חדש
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchProducts(showArchived);
    fetchCategories();
    // eslint-disable-next-line
  }, [showArchived]);

  async function fetchProducts(archived = false) {
    try {
      const { data } = await axios.get(`http://localhost:8801/products?archived=${archived ? 1 : 0}`);
      setProducts(data);
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
    let sorted = [...products];
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
        break;
    }
    setProducts(sorted);
  }

  function handleStockChange(e) {
    let value = e.target.value;
    if (
      value === "" ||
      isNaN(Number(value)) ||
      Number(value) < 0 ||
      value.includes(".") ||
      !Number.isInteger(Number(value))
    ) {
      setStockError("יש להזין מספר שלם אי שלילי בלבד");
    } else {
      setStockError("");
    }
    value = value.replace(/[^0-9]/g, "");
    setNewProduct({ ...newProduct, Stock: value });
  }

  function handlePriceChange(e) {
    let value = e.target.value;
    if (value === "" || isNaN(Number(value)) || Number(value) <= 0) {
      setPriceError("יש להזין מחיר חיובי בלבד");
    } else {
      setPriceError("");
    }
    setNewProduct({ ...newProduct, Price: value });
  }

  async function handleSaveProduct() {
    const { Name, CategoryID, Descripetion, Price, Stock, Type } = newProduct;

    let err = false;
    if (!Name || !CategoryID || !Descripetion || !Price || Stock === "") {
      toast.error('כל השדות נדרשים');
      err = true;
    }
    // בדיקת מלאי
    if (
      Stock === "" ||
      isNaN(Number(Stock)) ||
      Number(Stock) < 0 ||
      !Number.isInteger(Number(Stock))
    ) {
      setStockError("יש להזין מספר שלם אי שלילי בלבד");
      err = true;
    } else {
      setStockError("");
    }
    // בדיקת מחיר
    if (!Price || isNaN(Number(Price)) || Number(Price) <= 0) {
      setPriceError('יש להזין מחיר חיובי בלבד');
      err = true;
    } else {
      setPriceError("");
    }
    if (err) return;

    const formData = new FormData();
    formData.append('Name', Name);
    formData.append('CategoryID', CategoryID);
    formData.append('Type', Type);
    formData.append('Descripetion', Descripetion);
    formData.append('Price', Price);
    formData.append('Stock', Stock);
    if (imageFile) formData.append('imageFile', imageFile);

    try {
      if (!editProductCode) {
        await axios.post('http://localhost:8801/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('המוצר נוסף בהצלחה!');
      } else {
        await axios.put(`http://localhost:8801/products/${editProductCode}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('המוצר עודכן בהצלחה!');
      }
      fetchProducts(showArchived);
      closeProductPopup();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'שגיאה בשמירת המוצר');
    }
  }

  async function handleDelete(productCode, name) {
    if (!window.confirm(`האם להעביר את המוצר "${name}" לארכיון?`)) return;
    try {
      await axios.delete(`http://localhost:8801/products/${productCode}`);
      toast.success('המוצר הועבר לארכיון');
      fetchProducts(showArchived);
    } catch (err) {
      toast.error('שגיאה בארכוב המוצר');
    }
  }

  function handleEdit(product) {
    setEditProductCode(product.ProductCode);
    setNewProduct({
      Name: product.Name,
      CategoryID: product.CategoryID,
      Type: product.Type || (categories.find(c => c.CategoryID === product.CategoryID)?.CategoryName || ""),
      Descripetion: product.Descripetion,
      Price: product.Price,
      Stock: product.Stock
    });
    setOldImageUrl(product.ImageURL || null);
    setImageFile(null);
    setShowPopup(true);
    setStockError("");
    setPriceError("");
  }

  async function handleRestore(productCode) {
    try {
      await axios.put(`http://localhost:8801/products/${productCode}/restore`);
      toast.success("המוצר שוחזר בהצלחה!");
      fetchProducts(true);
    } catch (err) {
      toast.error("שגיאה בשחזור המוצר");
    }
  }

  function toggleDesc(code) {
    setDescOpen(prev => ({ ...prev, [code]: !prev[code] }));
  }

  function closeProductPopup() {
    setShowPopup(false);
    setEditProductCode(null);
    setNewProduct({ Name: '', CategoryID: '', Type: '', Descripetion: '', Price: '', Stock: '' });
    setImageFile(null);
    setStockError("");
    setPriceError("");
    setOldImageUrl(null);
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

  const filteredProducts = selectedCategory
    ? products.filter(p => (p.CategoryID + '') === (selectedCategory + ''))
    : products;

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
        <button
          style={{
            background: showArchived ? "#f3b8f3" : "#ccc",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            marginRight: 10,
            marginLeft: 10
          }}
          onClick={() => {
            setShowArchived(!showArchived);
            setViewMode('categories');
            setSelectedCategory('');
          }}
        >
          {showArchived ? "הצג מוצרים פעילים " : "הצג מוצרים מהארכיון"}
        </button>
      </div>

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

      {viewMode === 'categories' ? (
        <div className="category-cards-list">
          {categories.map(cat => (
            <div
              key={cat.CategoryID}
              className="category-card"
              onClick={() => {
                setSelectedCategory(cat.CategoryID);
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
        <>
          <button
            className="back-to-categories-btn"
            onClick={() => setViewMode('categories')}
          >← חזור לקטגוריות</button>
          <div className="product-cards-list">
            {filteredProducts.map((prod) => (
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
                  {showArchived ? (
                    <>
                      <button
                        className="edit-btn"
                        style={{ background: "#8888cc", color: "#fff" }}
                        onClick={() => handleEdit(prod)}
                      >עריכה</button>
                      <button
                        className="restore-btn"
                        style={{ background: "#5cd65c", color: "#fff", marginLeft: 8 }}
                        onClick={() => handleRestore(prod.ProductCode)}
                      >הצג</button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn" onClick={() => handleEdit(prod)}>ערוך</button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(prod.ProductCode, prod.Name)}
                      >ארכיון</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{editProductCode ? 'עריכת מוצר' : 'מוצר חדש'}</h3>
            <input
              type="text"
              placeholder="שם מוצר"
              value={newProduct.Name}
              onChange={e => setNewProduct({ ...newProduct, Name: e.target.value })}
            />
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
              min={1}
              step={1}
              onChange={handlePriceChange}
              onWheel={e => e.target.blur()}
              onKeyDown={e => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
              }}
              required
            />
            {priceError && (
              <div style={{ color: "#d93025", fontSize: 14, marginTop: 4 }}>{priceError}</div>
            )}
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
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="תצוגה מוקדמת"
                className="product-preview"
              />
            ) : oldImageUrl ? (
              <img
                src={`http://localhost:8801/uploads/${oldImageUrl}`}
                alt="מוצר קיים"
                className="product-preview"
              />
            ) : null}
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleSaveProduct}>
                {editProductCode ? 'שמור שינויים' : 'הוסף מוצר'}
              </button>
              <button className="cancel-btn" onClick={closeProductPopup}>בטל</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
