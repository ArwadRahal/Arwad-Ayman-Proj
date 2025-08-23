// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import "./HomePage.css";
import icon from "../assets/P.png";
import logo from "../assets/logo.png";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpeg";
import slide4 from "../assets/slide4.jpg";
import slide5 from "../assets/slide5.jpg";

export default function HomePage() {
  const slides = [slide1, slide2, slide3, slide4, slide5];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2700);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="homepage">
      <header>
        <div className="top-buttons">
          <a href="/login">
            <button className="white">כניסה</button>
          </a>
          <a href="/signup">
            <button className="dark-purple">הרשמה</button>
          </a>
        </div>
      </header>

      <div className="container">
        <div className="content">
          <div className="title-with-icon">
            <h1>ברוכות הבאות</h1>
            <img src={icon} alt="אייקון" className="small-icon" />
          </div>

          <p className="subtitle">
            הפלטפורמה שתלווה אותך בדרך לאורח חיים בריא, מאוזן ומהנה 💖
          </p>

          <p>
            אתר חכם לניהול אימונים והרשמה למכון כושר<br />
            תיאום נוח עם מאמנות, מעקב אישי ורכישת אביזרים ותוספי תזונה – הכל במקום אחד.
          </p>

          <p className="cta">✨ התחילי את המסע שלך כבר היום!</p>
        </div>

        <div className="image-side">
          <img src={logo} alt="Illustration" />
        </div>
      </div>

         <div className="pricing-section">
        <h3 className="pricing-title">בחרי את המסלול שמתאים לך 👑</h3>
        <p
          style={{
            color: "#846ba0",
            fontWeight: 500,
            fontSize: "1.08em",
            marginBottom: 13,
          }}
        >
          כל מסלול כולל גישה לאימונים אונליין, תמיכה ממאמנות ותוכנית מותאמת.<br />
          הרשמה מהירה, התחייבות חודשית בלבד!
        </p>
        <div className="pricing-table">
          <div className="plan group">
            <div className="plan-header">מנוי קבוצתי</div>
            <div className="plan-price">
              <span className="price-month">₪250</span>
              <span className="slash">/</span>חודשי
              <br />
              <span className="price-year">₪3600</span>
              <span className="slash">/</span>שנתי
            </div>
            <ul>
              <li>אימונים קבוצתיים מהנים</li>
              <li>תחושת קהילה ושייכות</li>
            </ul>
          </div>
          <div className="plan couple">
            <div className="plan-header">מנוי זוגי</div>
            <div className="plan-price">
              <span className="price-month">₪350</span>
              <span className="slash">/</span>חודשי
              <br />
              <span className="price-year">₪4200</span>
              <span className="slash">/</span>שנתי
            </div>
            <ul>
              <li>אימונים יחד עם חברה או בת משפחה</li>
              <li>ליווי אישי של מאמנת</li>
            </ul>
          </div>
          <div className="plan single">
            <div className="plan-header">מנוי אישי</div>
            <div className="plan-price">
              <span className="price-month">₪500</span>
              <span className="slash">/</span>חודשי
              <br />
              <span className="price-year">₪6000</span>
              <span className="slash">/</span>שנתי
            </div>
            <ul>
              <li>מסלול VIP - יחס אישי ומקיף</li>
              <li>מותאם בדיוק למטרות שלך</li>
            </ul>
          </div>
        </div>
        <div className="pricing-cta">
          רוצה להתייעץ לפני בחירת מנוי?
          <br />
          <a
            href="https://instagram.com/fittrack"
            target="_blank"
            rel="noopener noreferrer"
            className="insta-link"
          >
            <span role="img" aria-label="Instagram">
              📲
            </span>{" "}
            שלחי לנו הודעה באינסטגרם
          </a>
        </div>
      </div>
       <h3 id="letsgo">בואי להתרשם 😍💪 </h3>
      <div className="slideshow-one-img">
        <div
          className="slide-img-single"
          style={{ backgroundImage: `url(${slides[current]})` }}
        ></div>
        <div className="slider-dots">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`slider-dot${current === idx ? " active" : ""}`}
              onClick={() => setCurrent(idx)}
            ></span>
          ))}
        </div>
      </div>
 
      <footer className="footer-dev">
        <div className="devs-info">
          <span>
            פותח על ידי: <b>ארואד רחאל</b> ו־ <b>אימאן זייד</b> — פרויקט גמר, 2025
          </span>
        </div>
      </footer>
    </div>
  );
}
