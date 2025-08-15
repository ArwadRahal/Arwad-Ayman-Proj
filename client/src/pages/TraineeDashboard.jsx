import React, { useState, useEffect, useRef } from 'react';
import EventModal from '../components/EventModal';
import MotivationalBanner from '../components/MotivationalBanner';
import Shop from '../components/Shop';
import defaultAvatar from '../assets/default-avatar.svg';
import '../styles/TraineeDashboard.css';

/** تاريخ محلي بصيغة YYYY-MM-DD (بدون تحويل UTC) */
const toYMD = (d) => d.toLocaleDateString('en-CA'); // "2025-08-15"

/** زر PayPal (Sandbox) */
function PayPalButtonInline({ amount, onApprove }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!amount || !window.paypal) return;

    let buttons;
    try {
      buttons = window.paypal.Buttons({
        style: { layout: 'vertical', label: 'pay' },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: Number(amount).toFixed(2) } }],
          }),
        onApprove: async (_data, actions) => {
          const details = await actions.order.capture(); // Sandbox
          onApprove?.(details);
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          alert('שגיאה בתשלום');
        },
      });
      buttons.render(containerRef.current);
    } catch (e) {
      console.error(e);
    }
    return () => {
      try { buttons && buttons.close(); } catch {}
    };
  }, [amount, onApprove]);

  return <div ref={containerRef} />;
}

export default function TraineeView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyMeetings, setMonthlyMeetings] = useState(0);

  const [startOfWeek, setStartOfWeek] = useState(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // Sunday as start
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  // اشتراك
  const [subscription, setSubscription] = useState(null);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [payType, setPayType] = useState('');               // Monthly | Yearly
  const [membershipType, setMembershipType] = useState(''); // Group | Couple | Single
  const [payError, setPayError] = useState('');

  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const traineeName = currentUser?.name || '';
  const traineeId = currentUser?.id;
  const traineeImg =
    currentUser?.imageURL && currentUser.imageURL !== ''
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  // حالة الاشتراك
  useEffect(() => {
    if (!traineeId) return;
    fetch(`http://localhost:8801/subscription/active/${traineeId}`)
      .then(res => res.json())
      .then(data => setSubscription(data))
      .catch(() => setSubscription({ active: false }));
  }, [traineeId]);

  // عداد الجلسات الشهري
  useEffect(() => {
    if (!traineeId) return;
    const currentMonth = (startOfWeek.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = startOfWeek.getFullYear();
    fetch(`http://localhost:8801/schedule/monthly-count/${traineeId}?month=${currentMonth}&year=${currentYear}`)
      .then(res => res.json())
      .then(data => setMonthlyMeetings(data.count || 0))
      .catch(() => setMonthlyMeetings(0));
  }, [traineeId, isModalOpen, startOfWeek]);

  // تحميل تمارين الأسبوع (المسجّلة فقط)
  useEffect(() => {
    if (!traineeId || !subscription?.active) return;

    const weekStartStr = toYMD(startOfWeek);
    const weekEndDate = new Date(startOfWeek);
    weekEndDate.setDate(startOfWeek.getDate() + 6);
    const weekEndStr = toYMD(weekEndDate);

    fetch(`http://localhost:8801/schedule/trainee/${traineeId}?start=${weekStartStr}&end=${weekEndStr}`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [traineeId, subscription, startOfWeek]);

  const formatTime = (time) => (time ? time.split(':').slice(0,2).join(':') : '');

  // شارة حالة الاشتراك
  let showRenewBtn = false;
  let daysLeft = null;
  let endDateStr = '';
  const today = new Date();
  if (subscription?.sub) {
    const end = new Date(subscription.sub.EndDate);
    endDateStr = end.toLocaleDateString('he-IL');
    daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    showRenewBtn = !subscription.active || daysLeft <= 7;
  } else if (subscription?.active === false) {
    showRenewBtn = true;
  }

  // حساب المبلغ
  function calcAmount() {
    if (!membershipType || !payType) return 0;
    if (membershipType === 'Couple') return payType === 'Monthly' ? 350 : 4200;
    if (membershipType === 'Single') return payType === 'Monthly' ? 500 : 6000;
    return payType === 'Monthly' ? 250 : 3600; // Group
  }

  // عند موافقة PayPal: نسجّل الاشتراك + نسجّل دفعة
  async function handleApproveSubscription(details) {
    setPayError('');
    try {
      const amount = calcAmount();
      const start = new Date();
      const endDate = new Date(start);
      if (payType === 'Monthly') endDate.setMonth(start.getMonth() + 1);
      if (payType === 'Yearly')  endDate.setFullYear(start.getFullYear() + 1);

      // 1) إنشاء/تحديث اشتراك
      const addRes = await fetch('http://localhost:8801/subscription/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: traineeId,
          type: payType,
          startDate: toYMD(start),
          endDate:   toYMD(endDate),
          baseAmount: Number(amount),
          membershipType,
          cardHolder: 'PayPalSandbox'
        }),
      });
      if (!addRes.ok) {
        const err = await addRes.json().catch(()=>({}));
        throw new Error(err?.error || 'Subscription add failed');
      }

      // 2) تسجيل الدفعة (اختياري)
      try {
        await fetch('http://localhost:8801/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: traineeId,
            amount: Number(amount),
            paymentFor: 'Subscription',
            referenceId: details?.id || null,
            status: 'Completed'
          })
        });
      } catch (e) {
        console.warn('Payments log failed:', e);
      }

      // 3) تحديث حالة الواجهة
      const refreshed = await fetch(`http://localhost:8801/subscription/active/${traineeId}`).then(r => r.json());
      setSubscription(refreshed);
      setShowPayPopup(false);
    } catch (e) {
      console.error(e);
      setPayError('התשלום נכשל! נסי שוב.');
    }
  }

  if (!subscription) {
    return <div style={{ textAlign:'center', marginTop:80, fontSize:24 }}>טוען...</div>;
  }

  // بوب-أב الاشتراك
  if (!subscription.active || showPayPopup) {
    const amount = calcAmount();
    const readyForPayPal = amount > 0;

    return (
      <div className="popup-overlay">
        <div className="popup-box" style={{ maxWidth: 420, marginTop: 120 }}>
          <div className="popup-header">
            <h2 style={{margin:0}}>הצטרפי כמנויה כדי להמשיך</h2>
            <button
              onClick={() => setShowPayPopup(false)}
              style={{fontSize:22,border:'none',background:'none'}}
              aria-label="close"
            >×</button>
          </div>

          <div className="popup-content">
            <div style={{ marginBottom: 14, color:'#999' }}>
              יש להשלים תשלום מנוי כדי לגשת לאימונים.
            </div>

            <select
              style={{ width:'100%', marginBottom:10 }}
              value={membershipType}
              onChange={e => setMembershipType(e.target.value)}
              required
            >
              <option value="">בחרי סוג מנוי...</option>
              <option value="Group">מנוי קבוצתי (250/3600₪)</option>
              <option value="Couple">מנוי זוגי (350/4200₪)</option>
              <option value="Single">מנוי אישי (500/6000₪)</option>
            </select>

            <select
              style={{ width:'100%', marginBottom:10 }}
              value={payType}
              onChange={e => setPayType(e.target.value)}
              required
            >
              <option value="">בחרי תקופת מנוי...</option>
              <option value="Monthly">מנוי חודשי</option>
              <option value="Yearly">מנוי שנתי</option>
            </select>

            <div style={{ background:'#faf7fd', border:'1px solid #eee', borderRadius:10, padding:10, marginBottom:10 }}>
              סכום לתשלום: <b>{amount || 0} ₪</b>
            </div>

            {payError && <div style={{ color:'red', fontSize:14, marginBottom:6 }}>{payError}</div>}

            <div className="paypal-wrap" style={{ opacity: readyForPayPal ? 1 : 0.5 }}>
              {readyForPayPal ? (
                <PayPalButtonInline amount={amount} onApprove={handleApproveSubscription} />
              ) : (
                <button style={{ width:'100%', padding:'10px 0' }} disabled>
                  בחרי סוג מנוי ותקופה להצגת תשלום PayPal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // لوحة المتدرّبة
  return (
    <div className="trainee-dashboard">
      <div className="trainee-header-row">
        <div className="trainee-header-profile">
          <img src={traineeImg} alt="Trainee" className="trainee-avatar" />
          <div className="trainee-header-info">
            <h2>שלום {traineeName}!</h2>
            <MotivationalBanner />
          </div>
        </div>

        <div className={
          'subscription-status' +
          (daysLeft !== null && daysLeft <= 0 ? ' expired'
            : daysLeft !== null && daysLeft <= 7 ? ' soon' : '')
        }>
          <span className="icon">
            {daysLeft !== null && daysLeft <= 0 ? '⚠️'
              : daysLeft !== null && daysLeft <= 7 ? '⏰' : '✅'}
          </span>
          <span>
            {daysLeft !== null && daysLeft <= 0
              ? 'המנוי שלך הסתיים'
              : daysLeft !== null && daysLeft <= 7
                ? `המנוי מסתיים בעוד ${daysLeft} ימים`
                : `מנוי בתוקף עד ${endDateStr}`}
          </span>
          {showRenewBtn && (
            <button className="renew-btn" onClick={() => setShowPayPopup(true)}>חדש</button>
          )}
        </div>
      </div>

      <div className="monthly-meetings-row">
        {monthlyMeetings < 12
          ? <>נותרו לך <b>{12 - monthlyMeetings}</b> מפגשים החודש</>
          : <>הגעת למספר המפגשים החודשי המותר (12)</>
        }
      </div>

      <div className="week-nav-row">
        <button
          className="week-nav-btn"
          onClick={() => setStartOfWeek(prev => {
            const d = new Date(prev);
            d.setDate(prev.getDate() - 7);
            return d;
          })}
        >{'← שבוע קודם'}</button>
        <span style={{ fontWeight:'bold', fontSize:18, margin:'0 12px' }}>
          {weekDates[0].toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit' })}
          {' - '}
          {weekDates[6].toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit' })}
        </span>
        <button
          className="week-nav-btn"
          onClick={() => setStartOfWeek(prev => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + 7);
            return d;
          })}
        >{'שבוע הבא →'}</button>
      </div>

      <section className="calendar-weekly">
        <div className="week-header">
          {weekDates.map((d, i) => (
            <div key={i} className="weekday">
              <div className="day-name">{days[i]}</div>
              <div className="day-date">
                {d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        <div className="week-grid">
          {weekDates.map((d, i) => {
            const dayKey = toYMD(d); // مهم: استخدام تاريخ محلي
            const dayEvents = events.filter(ev => ev.session_date === dayKey);
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
                      <div><b>{formatTime(ev.start_time)} - {formatTime(ev.end_time)}</b></div>
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

      <Shop />
    </div>
  );
}
