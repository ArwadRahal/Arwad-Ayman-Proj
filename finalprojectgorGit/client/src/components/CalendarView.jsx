import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import heLocale from "@fullcalendar/core/locales/he";
import "../styles/CalendarView.css";

export default function CalendarView({ refreshFlag, onEventClick }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8801/schedule")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          id: item.id.toString(),
          title: item.session_type,
          start: item.session_date,
          extendedProps: {
            coachId: item.CoachID,
            startTime: item.start_time,
            endTime: item.end_time
          }
        }));
        setEvents(formatted);
      })
      .catch(err => {
        console.error("שגיאה בטעינת אימונים:", err);
      });
  }, [refreshFlag]);  
  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: ""
        }}
        events={events}
        eventClick={(info) => {
          const idx = parseInt(info.event.id, 10);
          onEventClick?.(info.event.extendedProps, idx);  
        }}
        height="auto"
      />
    </div>
  );
}
