import React, { useEffect, useState } from "react";
import "../styles/MotivationalBanner.css";

const quotes = [
  "כל מסע גדול מתחיל בצעד אחד קטן",
  "הצלחה נבנית מהחלטה שלא לוותר",
  "היום זה היום להתחיל להיות טוב יותר מאתמול",
  "אין קיצורי דרך לשום מקום ששווה להגיע אליו",
  "הגוף שלך מסוגל לעוד הרבה יותר ממה שאתה חושב",
  "כל אימון מקרב אותך למטרה שלך"
];

export default function MotivationalBanner() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[idx]);
  }, []);

  return (
    <div className="motivational-banner">
      <p>{quote}</p>
    </div>
  );
}
