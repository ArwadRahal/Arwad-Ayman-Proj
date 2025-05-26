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
    Description: '',
    Price: '',
    ImageURL: '',
    Stock: ''
  });

  // קבלת המוצרים מהשרת
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8801/Product-Management');
      setProducts(response.data);
    } catch (error) {
      console.error('שגיאה בקבלת המוצרים:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // הוספת מוצר חדש
  const handleAddProduct = async () => {
    const { ProductCode, Name, Type, Description, Price, ImageURL, Stock } = newProduct;
    if (!ProductCode || !Name || !Type || !Description || !Price || !ImageURL || !Stock) {
      alert('כל השדות נדרשים');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8801/Product-Management', newProduct);
      setProducts([...products, response.data]);
      setNewProduct({
        ProductCode: '',
        Name: '',
        Type: '',
        Description: '',
        Price: '',
        ImageURL: '',
        Stock: ''
      });
      setShowPopup(false);
    } catch (error) {
      console.error('שגיאה בהוספת המוצר:', error);
    }
  };

  // מחיקת מוצר
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8801/Product-Management/${id}`);
      setProducts(products.filter((product) => product.id !== id));
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

      <table className="product-table">
        <thead>
          <tr>
            <th>מזהה</th>
            <th>קוד מוצר</th>
            <th>שם מוצר</th>
            <th>סוג</th>
            <th>תיאור</th>
            <th>מחיר (₪)</th>
            <th>תמונה</th>
            <th>מלאי</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.ProductCode}</td>
              <td>{prod.Name}</td>
              <td>{prod.Type}</td>
              <td>{prod.Description}</td>
              <td>{prod.Price}</td>
              <td><img src={prod.ImageURL} alt={prod.Name} width="50" /></td>
              <td>{prod.Stock}</td>
              <td>
                <button className="delete-button" onClick={() => handleDelete(prod.id)}>
                  מחק
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              value={newProduct.Description}
              onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })}
            />
            <input
              type="number"
              placeholder="מחיר"
              value={newProduct.Price}
              onChange={(e) => setNewProduct({ ...newProduct, Price: e.target.value })}
            />
            <input
              type="text"
              placeholder="קישור לתמונה"
              value={newProduct.ImageURL}
              onChange={(e) => setNewProduct({ ...newProduct, ImageURL: e.target.value })}
            />
            <input
              type="number"
              placeholder="מלאי"
              value={newProduct.Stock}
              onChange={(e) => setNewProduct({ ...newProduct, Stock: e.target.value })}
            />
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleAddProduct}>
                הוסף
              </button>
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
