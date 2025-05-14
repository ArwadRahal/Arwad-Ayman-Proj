import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "../styles/CalendarView.css";

export default function CalendarView({ shifts, onEventClick }) {
  // we assign each event an `id` = its index in `shifts`
  const events = shifts.map((s, i) => ({
    id: i.toString(),
    title: `${s.coach} (${s.type})`,
    start: s.date,
    extendedProps: s
  }));

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: ""
        }}
        events={events}
        eventClick={(info) => {
          const idx = parseInt(info.event.id, 10);
          onEventClick && onEventClick(info.event.extendedProps, idx);
        }}
        height="auto"
      />
    </div>
  );
}
