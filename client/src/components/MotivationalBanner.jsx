import React, { useEffect, useState } from "react";
import "../styles/MotivationalBanner.css";

const quotes = [
  "כל מסע גדול מתחיל בצעד אחד קטן",
  "הצלחה נבנית מהחלטה שלא לוותר",
  "היום זה היום להתחיל להיות טוב יותר מאתמול",
  "אין קיצורי דרך לשום מקום ששווה להגיע אליו",
  "הגוף שלך מסוגל לעוד הרבה יותר ממה שאת חושבת",
  "כל אימון מקרב אותך למטרה שלך",
  "אל תשווי את עצמך לאחרים – השווי את עצמך לאתמול",
  "קצת זיעה היום – הרבה גאווה מחר",
  "תאהבי את עצמך מספיק כדי לבחור בבריאות שלך",
  "לא תמיד קל, אבל תמיד שווה את זה",
  "אין דבר בלתי אפשרי למי שמאמינה בעצמה",
  "מכשולים הם חלק מהדרך להצלחה",
  "הכוח טמון בהתמדה שלך",
  "גם מסע של אלף קילומטר מתחיל בצעד אחד קטן",
  "הגוף שלך הוא המקום היחיד שבו תצטרכי לחיות – תשקיעי בו",
  "כל צעד קטן – התקדמות ענקית",
  "כל נפילה היא הזדמנות לקום חזקה יותר",
  "מה שלא הורג – מחשל!",
  "תני לעצמך קרדיט על כל התקדמות",
  "העתיד שלך מתחיל עכשיו!"
];

export default function MotivationalBanner() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // نجرب نقرأ من localStorage
    let stored = localStorage.getItem("motivation_quote");
    if (stored && quotes.includes(stored)) {
      setQuote(stored);
    } else {
      // عشوائي جديد ونخزنه
      const idx = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[idx]);
      localStorage.setItem("motivation_quote", quotes[idx]);
    }
  }, []);

  return (
    <div className="motivational-banner">
      <p>{quote}</p>
    </div>
  );
}
