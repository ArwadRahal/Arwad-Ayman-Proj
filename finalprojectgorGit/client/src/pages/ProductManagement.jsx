import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [descOpen, setDescOpen] = useState({});
  const [newProduct, setNewProduct] = useState({
    Name: '',
    Type: '',
    Descripetion: '',
    Price: '',
    Stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [sortType, setSortType] = useState('default');

  // --- جديد --- //
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8801/products');
      setProducts(response.data);
      setOriginalProducts(response.data);
    } catch (error) {
      console.error('שגיאה בקבלת המוצרים:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8801/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('שגיאה בקבלת הקטגוריות:', err);
    }
  };

  const handleSort = (e) => {
    const sortValue = e.target.value;
    setSortType(sortValue);
    let sortedProducts = [...originalProducts];
    switch (sortValue) {
      case "stockAsc":
        sortedProducts.sort((a, b) => a.Stock - b.Stock);
        break;
      case "stockDesc":
        sortedProducts.sort((a, b) => b.Stock - a.Stock);
        break;
      case "priceAsc":
        sortedProducts.sort((a, b) => a.Price - b.Price);
        break;
      case "priceDesc":
        sortedProducts.sort((a, b) => b.Price - a.Price);
        break;
      default:
        sortedProducts = [...originalProducts];
    }
    if (selectedCategory !== 'all') {
      sortedProducts = sortedProducts.filter(p => p.Type === selectedCategory);
    }
    setProducts(sortedProducts);
  };

  const handleCategoryFilter = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    let filteredProducts = [...originalProducts];
    if (value !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.Type === value);
    }
    if (sortType !== 'default') {
      switch (sortType) {
        case "stockAsc":
          filteredProducts.sort((a, b) => a.Stock - b.Stock);
          break;
        case "stockDesc":
          filteredProducts.sort((a, b) => b.Stock - a.Stock);
          break;
        case "priceAsc":
          filteredProducts.sort((a, b) => a.Price - b.Price);
          break;
        case "priceDesc":
          filteredProducts.sort((a, b) => b.Price - a.Price);
          break;
        default:
          break;
      }
    }
    setProducts(filteredProducts);
  };

  const handleSaveProduct = async () => {
    const { Name, Type, Descripetion, Price, Stock } = newProduct;
    if (!Name || !Type || !Descripetion || !Price || !Stock) {
      alert('כל השדות נדרשים');
      return;
    }
    const formData = new FormData();
    formData.append('Name', Name);
    formData.append('Type', Type);
    formData.append('Descripetion', Descripetion);
    formData.append('Price', Price);
    formData.append('Stock', Stock);
    if (imageFile) formData.append('imageFile', imageFile);

    try {
      if (editIndex === null) {
        await axios.post('http://localhost:8801/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchProducts();
        alert('המוצר נוסף בהצלחה!');
      } else {
        await axios.put(`http://localhost:8801/products/${products[editIndex].ProductCode}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchProducts();
        alert('המוצר עודכן בהצלחה!');
      }
      setNewProduct({
        Name: '',
        Type: '',
        Descripetion: '',
        Price: '',
        Stock: ''
      });
      setImageFile(null);
      setShowPopup(false);
      setEditIndex(null);
    } catch (error) {
      console.error('שגיאה בשמירת המוצר:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8801/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('שגיאה במחיקת המוצר:', error);
    }
  };

  const handleEdit = (product, idx) => {
    setEditIndex(idx);
    setShowPopup(true);
    setNewProduct({
      Name: product.Name,
      Type: product.Type,
      Descripetion: product.Descripetion,
      Price: product.Price,
      Stock: product.Stock
    });
    setImageFile(null);
  };

  const toggleDesc = (code) => {
    setDescOpen((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // دالة لإضافة קטגוריה جديدة
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('נא להכניס שם קטגוריה');
      return;
    }
    try {
      await axios.post('http://localhost:8801/categories', { CategoryName: newCategoryName });
      setShowCatPopup(false);
      setNewCategoryName('');
      fetchCategories();
      alert('הקטגוריה נוספה בהצלחה!');
    } catch (err) {
      alert('שגיאה בהוספת הקטגוריה');
      console.error(err);
    }
  };

  return (
    <div className="product-management-cards">
      <div className="product-management-header">
        <h2>ניהול מוצרים</h2>
        <button className="add-product-btn" onClick={() => {
          setShowPopup(true);
          setEditIndex(null);
          setNewProduct({
            Name: '',
            Type: '',
            Descripetion: '',
            Price: '',
            Stock: ''
          });
          setImageFile(null);
        }}>
          + הוספת מוצר
        </button>
        <select className="sort-select" onChange={handleSort} value={sortType}>
          <option value="default">סדר לפי...</option>
          <option value="stockAsc">כמות (מהנמוך לגבוה)</option>
          <option value="stockDesc">כמות (מהגבוה לנמוך)</option>
          <option value="priceAsc">מחיר (מהזול ליקר)</option>
          <option value="priceDesc">מחיר (מהיקר לזול)</option>
        </select>
        <select
          className="category-select"
          value={selectedCategory}
          onChange={handleCategoryFilter}
        >
          <option value="all">כל הקטגוריות</option>
          {categories.map(cat => (
            <option value={cat.CategoryName} key={cat.CategoryID}>
              {cat.CategoryName}
            </option>
          ))}
        </select>
        <button className="add-category-btn" onClick={() => setShowCatPopup(true)}>
          + קטגוריה חדשה
        </button>
      </div>

      {/* --- نافذة הוספת קטגוריה --- */}
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
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleAddCategory}>הוסף</button>
              <button className="cancel-btn" onClick={() => setShowCatPopup(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div className="product-cards-list">
        {products.map((prod, idx) => (
          <div className="product-card" key={prod.ProductCode}>
            <img
              src={`http://localhost:8801/uploads/${prod.ImageURL}`}
              alt={prod.Name}
              className="product-image"
            />
            <div className="product-info">
              <h3>{prod.Name}</h3>
              <p><b>סוג:</b> {prod.Type}</p>
              <button
                className="desc-toggle-btn"
                onClick={() => toggleDesc(prod.ProductCode)}
              >
                {descOpen[prod.ProductCode] ? "הסתר תיאור" : "הצג תיאור"}
              </button>
              {descOpen[prod.ProductCode] && (
                <p className="desc-text">{prod.Descripetion}</p>
              )}
              <p>
                <b>מחיר:</b>{" "}
                <span className="price">{prod.Price} ₪</span>
              </p>
              <p>
                <b>מלאי:</b>{" "}
                <span className={prod.Stock <= 3 ? "low-stock" : "stock"}>
                  {prod.Stock}
                </span>
              </p>
            </div>
            <div className="actions">
              <button
                className="edit-btn"
                onClick={() => handleEdit(prod, idx)}
              >ערוך</button>
              <button
                className="delete-btn"
                onClick={() => {
                  const confirmDelete = window.confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${prod.Name}"?`);
                  if (confirmDelete) {
                    handleDelete(prod.ProductCode);
                  }
                }}
              >מחק</button>
            </div>
          </div>
        ))}
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{editIndex !== null ? "עריכת מוצר" : "מוצר חדש"}</h3>
            <input
              type="text"
              placeholder="שם מוצר"
              value={newProduct.Name}
              onChange={(e) => setNewProduct({ ...newProduct, Name: e.target.value })}
            />
            <select
              className="popup-select"
              value={newProduct.Type}
              onChange={e => setNewProduct({ ...newProduct, Type: e.target.value })}
              required
            >
              <option value="">בחר קטגוריה...</option>
              {categories.map(cat => (
                <option value={cat.CategoryName} key={cat.CategoryID}>
                  {cat.CategoryName}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="תיאור"
              value={newProduct.Descripetion}
              onChange={(e) => setNewProduct({ ...newProduct, Descripetion: e.target.value })}
            />
            <input
              type="number"
              placeholder="מחיר"
              value={newProduct.Price}
              onChange={(e) => setNewProduct({ ...newProduct, Price: e.target.value })}
            />
            <input
              type="number"
              placeholder="מלאי"
              value={newProduct.Stock}
              onChange={(e) => setNewProduct({ ...newProduct, Stock: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="תצוגה מוקדמת"
                className="product-preview"
              />
            )}
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleSaveProduct}>
                {editIndex !== null ? "שמור שינויים" : "הוסף מוצר"}
              </button>
              <button className="cancel-btn" onClick={() => {
                setShowPopup(false);
                setEditIndex(null);
              }}>
                בטל
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
