"use client";
import * as React from "react";

/* -------------------------------- Date helpers -------------------------------- */
function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function endOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}
function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}
function sameDay(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}
function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}
function isAfter(a: Date, b: Date) {
  return a.getTime() > b.getTime();
}

function Icon({ name, size = 18 }: { name: "calendar" | "chevLeft" | "chevRight"; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    style: { display: "block" as const },
  };
  const S = 1.9;

  if (name === "chevLeft") {
    return (
      <svg {...common}>
        <path d="M14.5 6.8 9.6 12l4.9 5.2" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "chevRight") {
    return (
      <svg {...common}>
        <path d="M9.5 6.8 14.4 12 9.5 17.2" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth={S} strokeLinecap="round" />
      <path d="M5.2 8.2h13.6" stroke="currentColor" strokeWidth={S} strokeLinecap="round" />
      <path
        d="M6.6 5.4h10.8a2.2 2.2 0 0 1 2.2 2.2v12.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V7.6a2.2 2.2 0 0 1 2.2-2.2Z"
        stroke="currentColor"
        strokeWidth={S}
        strokeLinejoin="round"
      />
      <path d="M8 12h3M8 16h3M13 12h3M13 16h3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

interface DatePickerCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  minDate: string;
  maxDate: string;
  onClose?: () => void;
}

export function DatePickerCalendar({ selectedDate, onSelectDate, minDate, maxDate, onClose }: DatePickerCalendarProps) {
  const [calMonth, setCalMonth] = React.useState(() => startOfMonth(new Date()));
  const minDateObj = new Date(minDate);
  const maxDateObj = new Date(maxDate);

  const calendarCells = React.useMemo(() => {
    const first = startOfMonth(calMonth);
    const last = endOfMonth(calMonth);
    const startWeekday = first.getUTCDay();
    const daysInMonth = last.getUTCDate();
    const cells: { date: Date; inMonth: boolean }[] = [];

    const prevLast = endOfMonth(addMonths(calMonth, -1));
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(prevLast.getUTCFullYear(), prevLast.getUTCMonth(), prevLast.getUTCDate() - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(Date.UTC(calMonth.getUTCFullYear(), calMonth.getUTCMonth(), d)), inMonth: true });
    }
    while (cells.length < 42) {
      const lastCell = cells[cells.length - 1].date;
      const d = new Date(Date.UTC(lastCell.getUTCFullYear(), lastCell.getUTCMonth(), lastCell.getUTCDate() + 1));
      cells.push({ date: d, inMonth: false });
    }
    return cells;
  }, [calMonth]);

  const handlePickDay = (d: Date) => {
    if (isBefore(d, minDateObj) || isAfter(d, maxDateObj)) return;
    const dayOfWeek = d.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return; // Skip weekends (0 = Sunday, 6 = Saturday)
    onSelectDate(d.toISOString().split('T')[0]);
    if (onClose) onClose();
  };

  const isDisabled = (d: Date) => {
    const dayOfWeek = d.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return isBefore(d, minDateObj) || isAfter(d, maxDateObj) || isWeekend;
  };

  return (
    <>
      <style>{`
        .gdp-popover{
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--popover));
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          width: 320px;
        }

        .gdp-cal-head{
          padding: 12px 12px 10px 12px;
          border-bottom: 1px solid hsl(var(--border));
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }
        .gdp-cal-month{
          font-weight: 600;
          letter-spacing: 0.2px;
          font-size: 13px;
          color: hsl(var(--foreground));
          display:flex;
          align-items:center;
          gap:10px;
          min-width:0;
        }
        .gdp-cal-month span{
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .gdp-cal-nav{ display:flex; gap: 6px; align-items:center; }

        .gdp-cal-nav-btn{
          width: 28px; height: 28px;
          border-radius: 6px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          display:grid; place-items:center;
          cursor:pointer;
          padding: 0;
          transition: all 0.15s;
        }
        .gdp-cal-nav-btn:hover{ background: hsl(var(--accent)); }
        .gdp-cal-nav-btn:active{ transform: translateY(1px); }

        .gdp-cal-body{ padding: 10px 12px 12px 12px; }

        .gdp-cal-week{
          display:grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
        .gdp-cal-week div{
          text-align:center;
          font-size: 10px;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
        }

        .gdp-cal-grid{
          display:grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .gdp-day-btn{
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-weight: 500;
          font-size: 11px;
          cursor: pointer;
          display:grid;
          place-items:center;
          transition: all 0.15s;
        }
        .gdp-day-btn:hover:not(:disabled){ 
          background: hsl(var(--accent));
          border-color: hsl(var(--primary));
        }
        .gdp-day-btn.selected{
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
          font-weight: 600;
        }
        .gdp-day-btn.selected:hover{
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          opacity: 0.85;
        }
        .gdp-day-btn.dim{ 
          color: hsl(var(--muted-foreground));
          opacity: 0.4;
        }
        .gdp-day-btn:disabled{ 
          cursor: not-allowed;
          opacity: 0.3;
        }

        .gdp-footer{
          display:flex;
          gap: 8px;
          margin-top: 10px;
        }
        .gdp-footer-btn{
          flex: 1;
          height: 32px;
          border-radius: 6px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-weight: 500;
          font-size: 11px;
          cursor:pointer;
          transition: all 0.15s;
        }
        .gdp-footer-btn:hover{ background: hsl(var(--accent)); }
        .gdp-footer-btn:active{ transform: translateY(1px); }

        .gdp-footer-btn-primary{
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }
        .gdp-footer-btn-primary:hover{
          background: hsl(var(--primary));
          opacity: 0.9;
        }
      `}</style>

      <div className="gdp-popover" role="dialog" aria-label="Date picker">
        <div className="gdp-cal-head">
          <div className="gdp-cal-month">
            <span aria-hidden="true">
              <Icon name="calendar" size={16} />
            </span>
            <span>{calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
          </div>

          <div className="gdp-cal-nav">
            <button type="button" className="gdp-cal-nav-btn" aria-label="Previous month" onClick={() => setCalMonth((m) => addMonths(m, -1))}>
              <Icon name="chevLeft" size={16} />
            </button>
            <button type="button" className="gdp-cal-nav-btn" aria-label="Next month" onClick={() => setCalMonth((m) => addMonths(m, 1))}>
              <Icon name="chevRight" size={16} />
            </button>
          </div>
        </div>

        <div className="gdp-cal-body">
          <div className="gdp-cal-week" aria-hidden="true">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="gdp-cal-grid">
            {calendarCells.map((cell, idx) => {
              const dim = !cell.inMonth;
              const isSelected = selectedDate && sameDay(cell.date, new Date(selectedDate));
              const disabled = isDisabled(cell.date);

              const btnCls = [
                "gdp-day-btn",
                dim ? "dim" : "",
                isSelected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={idx}
                  type="button"
                  className={btnCls}
                  onClick={() => handlePickDay(cell.date)}
                  disabled={disabled}
                  aria-label={cell.date.toDateString()}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="gdp-footer">
            <button
              type="button"
              className="gdp-footer-btn"
              onClick={() => onSelectDate('')}
              aria-label="Clear date"
            >
              Clear
            </button>
            <button 
              type="button" 
              className="gdp-footer-btn gdp-footer-btn-primary" 
              onClick={() => onClose?.()}
              aria-label="Close"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
