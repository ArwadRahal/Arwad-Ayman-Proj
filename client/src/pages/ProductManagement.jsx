// src/pages/ProductManagement.jsx
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ProductManagement.css';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'products'

  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newProduct, setNewProduct] = useState({
    Name: '',
    Type: '',
    Descripetion: '',
    Price: '',
    Stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [sortType, setSortType] = useState('default');
  const [descOpen, setDescOpen] = useState({}); // track which product desc is open

  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catImage, setCatImage] = useState(null);

  const [editCat, setEditCat] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState(null);

  // Fetch products + categories on mount
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
      console.error(err);
      toast.error('שגיאה בקבלת המוצרים');
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await axios.get('http://localhost:8801/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('שגיאה בקבלת הקטגוריות');
    }
  }

  // Sort handler
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
      sorted = sorted.filter(p => p.Type === selectedCategory);
    }
    setProducts(sorted);
  }

  // Save (add or update) product
  async function handleSaveProduct() {
    const { Name, Type, Descripetion, Price, Stock } = newProduct;
    if (!Name || !Type || !Descripetion || !Price || !Stock) {
      toast.error('כל השדות נדרשים');
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
      console.error(err);
      toast.error('שגיאה בשמירת המוצר');
    }
  }

  // Delete product
  async function handleDelete(productCode, name) {
    if (!window.confirm(`האם למחוק את המוצר "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8801/products/${productCode}`);
      toast.success('המוצר נמחק');
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('שגיאה במחיקת המוצר');
    }
  }

  // Open edit popup
  function handleEdit(product, idx) {
    setEditIndex(idx);
    setNewProduct({
      Name: product.Name,
      Type: product.Type,
      Descripetion: product.Descripetion,
      Price: product.Price,
      Stock: product.Stock
    });
    setImageFile(null);
    setShowPopup(true);
  }

  function toggleDesc(code) {
    setDescOpen(prev => ({ ...prev, [code]: !prev[code] }));
  }

  function closeProductPopup() {
    setShowPopup(false);
    setEditIndex(null);
    setNewProduct({ Name: '', Type: '', Descripetion: '', Price: '', Stock: '' });
    setImageFile(null);
  }

  // Add category
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
      console.error(err);
      toast.error('שגיאה בהוספת הקטגוריה');
    }
  }

  // Edit category
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
      console.error(err);
      toast.error('שגיאה בעדכון הקטגוריה');
    }
  }

  // Close edit category popup
  function closeEditCat() {
    setEditCat(null);
    setEditCatImage(null);
    setEditCatName('');
  }

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
                setSelectedCategory(cat.CategoryName);
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
                  ({cat.ProductsCount || 0})
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
              .filter(p => p.Type === selectedCategory)
              .map((prod, idx) => (
                <div className="product-card" key={prod.ProductCode}>
                  <img
                    className="product-image"
                    src={`http://localhost:8801/uploads/${prod.ImageURL}`}
                    alt={prod.Name}
                  />
                  <div className="product-info">
                    <h3>{prod.Name}</h3>
                    <p><b>סוג:</b> {prod.Type}</p>
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
            <select
              className="popup-select"
              value={newProduct.Type}
              onChange={e => setNewProduct({ ...newProduct, Type: e.target.value })}
            >
              <option value="">בחר קטגוריה...</option>
              {categories.map(cat => (
                <option key={cat.CategoryID} value={cat.CategoryName}>
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
              onChange={e => setNewProduct({ ...newProduct, Stock: e.target.value })}
            />
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
              <button className="confirm-btn" onClick={handleSaveProduct}>
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
