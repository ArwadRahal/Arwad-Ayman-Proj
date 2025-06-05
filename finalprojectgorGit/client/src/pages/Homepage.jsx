import React, { useState, useEffect } from "react";
import "./HomePage.css";
import icon      from "../assets/P.png";
import sideImage from "../assets/1.png";
import logo from "../assets/logo.jpg"
// התמונות שקבעת במערך
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpeg";

export default function HomePage() {
  const slides = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="homepage">
      <header>
        <div className="top-buttons">
          <a href="/login"><button className="white">כניסה</button></a>
          <a href="/signup"><button className="dark-purple">הרשמה</button></a>
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

      {/* הסליידשואו החדש */}
      <h3 id="letsgo">Take a Look </h3>
      <div id="container">
        {slides.map((img, idx) => (
          <div
            key={idx}
            className={`slide-div ${current === idx ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          >
            {/* כאן תוכל לשים קישורים/טקסט לפי הצורך */}
            <a href="#" className="slide-link">
              מקום {idx + 1}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
