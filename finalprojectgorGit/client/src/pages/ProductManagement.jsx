// ProductManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newProduct, setNewProduct] = useState({
    ProductCode: '',
    Name: '',
    Type: '',
    Descripetion: '',
    Price: '',
    Stock: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8801/products');
      setProducts(response.data);
    } catch (error) {
      console.error('שגיאה בקבלת המוצרים:', error);
    }
  };

  const handleAddProduct = async () => {
    const { ProductCode, Name, Type, Descripetion, Price, Stock } = newProduct;
    if (!ProductCode || !Name || !Type || !Descripetion || !Price || !Stock || !imageFile) {
      alert('כל השדות נדרשים');
      return;
    }

    const formData = new FormData();
    formData.append('ProductCode', ProductCode);
    formData.append('Name', Name);
    formData.append('Type', Type);
    formData.append('Descripetion', Descripetion);
    formData.append('Price', Price);
    formData.append('Stock', Stock);
    formData.append('imageFile', imageFile);

    try {
      const response = await axios.post('http://localhost:8801/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts([...products, response.data]);

       alert('המוצר נוסף בהצלחה!');
      setNewProduct({
        ProductCode: '',
        Name: '',
        Type: '',
        Descripetion: '',
        Price: '',
        Stock: ''
      });
      setImageFile(null);
      setShowPopup(false);
    } catch (error) {
      console.error('שגיאה בהוספת המוצר:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8801/products/${id}`);
setProducts(products.filter((product) => product.ProductCode !== id));
    } catch (error) {
      console.error('שגיאה במחיקת המוצר:', error);
    }
  };

  return (
    <div className="product-management">
      <h2>ניהול מוצרים</h2>

      <button className="add-product-btn" onClick={() => setShowPopup(true)}>
        הוספת מוצר
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>מוצר חדש</h3>
            <input
              type="text"
              placeholder="קוד מוצר"
              value={newProduct.ProductCode}
              onChange={(e) => setNewProduct({ ...newProduct, ProductCode: e.target.value })}
            />
            <input
              type="text"
              placeholder="שם מוצר"
              value={newProduct.Name}
              onChange={(e) => setNewProduct({ ...newProduct, Name: e.target.value })}
            />
            <input
              type="text"
              placeholder="סוג"
              value={newProduct.Type}
              onChange={(e) => setNewProduct({ ...newProduct, Type: e.target.value })}
            />
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

            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleAddProduct}>
                הוסף מוצר
              </button>
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                בטל
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="product-table">
        <thead>
          <tr>
            <th>קוד מוצר</th>
            <th>שם</th>
            <th>סוג</th>
            <th>תיאור</th>
            <th>מחיר</th>
            <th>תמונה</th>
            <th>מלאי</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
              <tr key={prod.ProductCode}>
              <td>{prod.ProductCode}</td>
              <td>{prod.Name}</td>
              <td>{prod.Type}</td>
              <td>{prod.Descripetion}</td>
              <td>{prod.Price} ₪</td>
              <td>
                <img
                  src={`http://localhost:8801/uploads/${prod.ImageURL}`}
                  alt={prod.Name}
                  className="product-image"
                />
              </td>
              <td>{prod.Stock}</td>
              <td>
             <button
  onClick={() => {
    const confirmDelete = window.confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${prod.Name}"?`);
    if (confirmDelete) {
      handleDelete(prod.ProductCode);
    }
  }}
>
  מחק
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
