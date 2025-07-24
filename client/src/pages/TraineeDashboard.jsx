import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import MotivationalBanner from '../components/MotivationalBanner';
import defaultAvatar from '../assets/default-avatar.svg';
import '../styles/TraineeDashboard.css';

export default function TraineeView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // סטטוס ונתונים של מנוי
  const [subscription, setSubscription] = useState(null);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [payType, setPayType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  // נתוני אמאמנת
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const traineeName = currentUser?.name || "";
  const traineeId = currentUser?.id;
  const traineeImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

      // קבל את סטטוס המנוי המלא
  useEffect(() => {
    if (!traineeId) return;
    fetch(`http://localhost:8801/subscription/active/${traineeId}`)
      .then(res => res.json())
      .then(data => setSubscription(data))
      .catch(() => setSubscription({ active: false }));
  }, [traineeId]);

  // אחזור הדרכה אםיש מנוי
  useEffect(() => {
    if (!traineeId || !subscription?.active) return;
    fetch(`http://localhost:8801/schedule/trainee/${traineeId}`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [traineeId, subscription]);

// חשב את התאריכים של השבוע הנוכחי
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

 // פונקציית פורמט זמן hh:mm
  function formatTime(time) {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  }

 // פרטי מנוי חשבון
  let showRenewBtn = false;
  let daysLeft = null;
  let endDateStr = "";
  if (subscription?.sub) {
    const end = new Date(subscription.sub.EndDate);
    endDateStr = end.toLocaleDateString("he-IL");
    daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (!subscription.active) {
      showRenewBtn = true;
    } else if (daysLeft <= 7) {
      showRenewBtn = true;
    } else {
      showRenewBtn = false;
    }
  } else if (subscription?.active === false) {
    showRenewBtn = true;
  }

 // פונקציית תשלום מנוי
  async function handleFakePayment() {
    setPayLoading(true);
    setPayError('');
    if (!payType || !cardNumber || !exp || !cvv) {
      setPayError("אנא מלאו את כל השדות.");
      setPayLoading(false);
      return;
    }
    try {
      const today = new Date();
      let endDate;
      if (payType === 'Monthly') {
        endDate = new Date(today); endDate.setMonth(today.getMonth() + 1);
      } else if (payType === 'Yearly') {
        endDate = new Date(today); endDate.setFullYear(today.getFullYear() + 1);
      }
      const start = today.toISOString().slice(0,10);
      const end = endDate.toISOString().slice(0,10);
      await fetch('http://localhost:8801/subscription/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: traineeId,
          type: payType,
          startDate: start,
          endDate: end,
          totalAmount: payType === 'Monthly' ? 70 : 700
        })
      });
  // הבא מנוי חדש:
      fetch(`http://localhost:8801/subscription/active/${traineeId}`)
        .then(res => res.json())
        .then(data => setSubscription(data));
      setShowPayPopup(false);
    } catch {
      setPayError('فشل الدفع! حاول مجدداً');
    }
    setPayLoading(false);
  }

// הורד... או הירשם כמנוי
  if (!subscription) {
    return <div style={{textAlign:"center",marginTop:80,fontSize:24}}>טוען...</div>;
  }
  if (!subscription.active || showPayPopup) {
    return (
      <div className="popup-overlay">
        <div className="popup-box" style={{maxWidth: 400, marginTop: 120}}>
          <h2 style={{margin: "0 0 10px"}}>הצטרפי כמנויה כדי להמשיך</h2>
          <div style={{marginBottom: 14, color:"#999"}}>
            יש להשלים תשלום מנוי כדי לגשת לאימונים.
          </div>
          <select
            style={{width:"100%",marginBottom:10}}
            value={payType}
            onChange={e=>setPayType(e.target.value)}
          >
            <option value="">בחרי סוג מנוי...</option>
            <option value="Monthly">מנוי חודשי — 70₪</option>
            <option value="Yearly">מנוי שנתי — 700₪</option>
          </select>
          <input
            type="text"
            placeholder="מספר כרטיס אשראי"
            value={cardNumber}
            onChange={e=>setCardNumber(e.target.value)}
            style={{width:"100%",marginBottom:8}}
            maxLength={16}
          />
          <input
            type="text"
            placeholder="תוקף (MM/YY)"
            value={exp}
            onChange={e=>setExp(e.target.value)}
            style={{width:"100%",marginBottom:8}}
            maxLength={5}
          />
          <input
            type="text"
            placeholder="CVV"
            value={cvv}
            onChange={e=>setCvv(e.target.value)}
            style={{width:"100%",marginBottom:8}}
            maxLength={4}
          />
          {payError && <div style={{color:"red", fontSize:14,marginBottom:6}}>{payError}</div>}
          <button
            onClick={handleFakePayment}
            style={{width:"100%",background:"#8c51c7",color:"#fff",fontWeight:600,padding:"10px 0",marginTop:4}}
            disabled={payLoading}
          >
            {payLoading ? "מעדכן..." : "לתשלום"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trainee-dashboard" style={{position:'relative'}}>
      <div className={
        "subscription-status"
        + (daysLeft !== null && daysLeft <= 0 ? " expired"
          : daysLeft !== null && daysLeft <= 7 ? " soon" : "")
      }>
        <span className="icon">
          {daysLeft !== null && daysLeft <= 0
            ? "⚠️"
            : daysLeft !== null && daysLeft <= 7
              ? "⏰"
              : "✅"}
        </span>
        <span>
          {daysLeft !== null && daysLeft <= 0
            ? "המנוי שלך הסתיים"
            : daysLeft !== null && daysLeft <= 7
              ? `המנוי מסתיים בעוד ${daysLeft} ימים`
              : `מנוי בתוקף עד ${endDateStr}`}
        </span>
        {showRenewBtn && (
          <button
            className="renew-btn"
            onClick={() => setShowPayPopup(true)}
          >חדש</button>
        )}
      </div>

      <div className="main-content">
        <div className="trainee-header">
          <img
            src={traineeImg}
            alt="Trainee"
            className="trainee-avatar"
            onError={e => { e.target.src = defaultAvatar; }}
          />
          <h2>שלום {traineeName}!</h2>
        </div>
        <MotivationalBanner />

        <h3 className="schedule-title">לוח אימונים לשבוע זה</h3>
        <section className="calendar-weekly">
          <div className="week-header">
            {weekDates.map((d, i) => (
              <div key={i} className="weekday">
                <div className="day-name">{days[i]}</div>
                <div className="day-date">
                  {d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}
                </div>
              </div>
            ))}
          </div>
          <div className="week-grid">
            {weekDates.map((d, i) => {
              const dayKey = d.toISOString().slice(0, 10);
              const dayEvents = events.filter(ev =>
                new Date(ev.session_date).toISOString().slice(0, 10) === dayKey
              );
              return (
                <div key={i} className="day-column">
                  {dayEvents.length === 0 ? (
                    <div className="empty-day">אין אימון</div>
                  ) : (
                    dayEvents.map((ev, j) => (
                      <div
                        key={j}
                        className="session-card"
                        onClick={() => { setSelectedEvent(ev); setIsModalOpen(true); }}
                      >
                        <div>
                          <b>{formatTime(ev.start_time)} - {formatTime(ev.end_time)}</b>
                        </div>
                        <div>מאמנת: {ev.coach_name}</div>
                        <div>{ev.session_type}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <EventModal
          isOpen={isModalOpen}
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          actions={[{ label: 'סגור', onClick: () => {} }]}
        />
      </div>
    </div>
  );
}
