import React, { useState, useEffect } from "react";
import "./HomePage.css";
import icon from "../assets/P.png";
import logo from "../assets/logo.png";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpeg";
import arwadAvatar from "../assets/arwad-avatar.jpeg";
import imanAvatar from "../assets/ayman-avatar.jpeg";
import slide4 from "../assets/slide4.jpg";
import slide5 from "../assets/slide5.jpg";

export default function HomePage() {
  const slides = [slide1, slide2, slide3,slide4,slide5];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 2700);
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
          <img src={arwadAvatar} alt="Arwad" className="dev-avatar" />
          <img src={imanAvatar} alt="Iman" className="dev-avatar" />
          <span>
            פותח על ידי: <b>ארואד רחאל</b> ו־ <b>אימאן זייד</b> — פרויקט גמר, 2025
          </span>
        </div>
      </footer>
    </div>
  );
}
