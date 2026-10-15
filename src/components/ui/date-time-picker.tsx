"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  value?: string | Date;
  onChange?: (value: string) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  accentColor?: "emerald" | "amber" | "red" | "blue" | "rose" | "purple";
  showPresets?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper to format Date to 'YYYY-MM-DDTHH:mm'
function formatToDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to parse input value safely
function parseDateValue(val?: string | Date): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date & time...",
  className,
  disabled = false,
  accentColor = "emerald",
  showPresets = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const parsedValue = React.useMemo(() => parseDateValue(value), [value]);
  const parsedMin = React.useMemo(() => parseDateValue(minDate), [minDate]);
  const parsedMax = React.useMemo(() => parseDateValue(maxDate), [maxDate]);

  // Initial base date (defaults to parsedValue or minDate or current time)
  const getInitialBaseDate = () => {
    if (parsedValue) return parsedValue;
    if (parsedMin && parsedMin > new Date()) return parsedMin;
    return new Date();
  };

  const [viewDate, setViewDate] = React.useState<Date>(getInitialBaseDate);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(() => parsedValue);

  // Time state (12-hour format)
  const [hours12, setHours12] = React.useState<number>(() => {
    const base = parsedValue || getInitialBaseDate();
    const h = base.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });

  const [minutes, setMinutes] = React.useState<number>(() => {
    const base = parsedValue || getInitialBaseDate();
    return base.getMinutes();
  });

  const [period, setPeriod] = React.useState<"AM" | "PM">(() => {
    const base = parsedValue || getInitialBaseDate();
    return base.getHours() >= 12 ? "PM" : "AM";
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (parsedValue) {
      setViewDate(parsedValue);
      setSelectedDate(parsedValue);
      const h = parsedValue.getHours();
      setHours12(h === 0 ? 12 : h > 12 ? h - 12 : h);
      setMinutes(parsedValue.getMinutes());
      setPeriod(h >= 12 ? "PM" : "AM");
    } else {
      setSelectedDate(null);
    }
  }, [parsedValue]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Calculate 24-hour value from 12h + period
  const get24Hour = (h12: number, ampm: "AM" | "PM") => {
    if (ampm === "AM") return h12 === 12 ? 0 : h12;
    return h12 === 12 ? 12 : h12 + 12;
  };

  // Immediate commit helper
  const emitChange = (day: Date | null, h12: number, m: number, ampm: "AM" | "PM") => {
    if (!day) return;
    const finalDate = new Date(day);
    finalDate.setHours(get24Hour(h12, ampm), m, 0, 0);
    const formatted = formatToDatetimeLocal(finalDate);
    onChange?.(formatted);
  };

  // Theme accents
  const themeClasses = {
    emerald: {
      selectedDay: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30",
      activeRing: "focus-within:border-emerald-500 focus-within:ring-emerald-500/30",
      badge: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
      activePill: "bg-emerald-500 text-white font-bold shadow-sm",
      button: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20",
      todayText: "text-emerald-400",
      todayDot: "bg-emerald-400",
      sparkle: "text-emerald-400",
    },
    amber: {
      selectedDay: "bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/30",
      activeRing: "focus-within:border-amber-500 focus-within:ring-amber-500/30",
      badge: "text-amber-300 bg-amber-500/15 border-amber-500/30",
      activePill: "bg-amber-500 text-black font-bold shadow-sm",
      button: "bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20",
      todayText: "text-amber-300",
      todayDot: "bg-amber-400",
      sparkle: "text-amber-400",
    },
    red: {
      selectedDay: "bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-md shadow-red-600/40",
      activeRing: "focus-within:border-red-500 focus-within:ring-red-500/40",
      badge: "text-red-400 bg-red-500/15 border-red-500/30",
      activePill: "bg-red-600 text-white font-bold shadow-sm",
      button: "bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/25",
      todayText: "text-red-400",
      todayDot: "bg-red-500",
      sparkle: "text-red-400",
    },
    blue: {
      selectedDay: "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md shadow-blue-500/30",
      activeRing: "focus-within:border-blue-500 focus-within:ring-blue-500/30",
      badge: "text-blue-300 bg-blue-500/15 border-blue-500/30",
      activePill: "bg-blue-500 text-white font-bold shadow-sm",
      button: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20",
      todayText: "text-blue-300",
      todayDot: "bg-blue-400",
      sparkle: "text-blue-400",
    },
    rose: {
      selectedDay: "bg-gradient-to-br from-rose-500 to-rose-600 text-white font-bold shadow-md shadow-rose-500/30",
      activeRing: "focus-within:border-rose-500 focus-within:ring-rose-500/30",
      badge: "text-rose-300 bg-rose-500/15 border-rose-500/30",
      activePill: "bg-rose-500 text-white font-bold shadow-sm",
      button: "bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20",
      todayText: "text-rose-300",
      todayDot: "bg-rose-400",
      sparkle: "text-rose-400",
    },
    purple: {
      selectedDay: "bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold shadow-md shadow-purple-500/30",
      activeRing: "focus-within:border-purple-500 focus-within:ring-purple-500/30",
      badge: "text-purple-300 bg-purple-500/15 border-purple-500/30",
      activePill: "bg-purple-500 text-white font-bold shadow-sm",
      button: "bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20",
      todayText: "text-purple-300",
      todayDot: "bg-purple-400",
      sparkle: "text-purple-400",
    },
  }[accentColor];

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedDate(null);
    onChange?.("");
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (d: number, mOffset: number = 0) => {
    const newDay = new Date(year, month + mOffset, d);
    setSelectedDate(newDay);
    if (mOffset !== 0) {
      setViewDate(new Date(year, month + mOffset, 1));
    }
    emitChange(newDay, hours12, minutes, period);
  };

  const isDayDisabled = (d: number, mOffset: number = 0) => {
    const checkDate = new Date(year, month + mOffset, d);
    checkDate.setHours(23, 59, 59, 999);

    if (parsedMin) {
      const minCopy = new Date(parsedMin);
      minCopy.setHours(0, 0, 0, 0);
      if (checkDate < minCopy) return true;
    }
    if (parsedMax) {
      const maxCopy = new Date(parsedMax);
      maxCopy.setHours(23, 59, 59, 999);
      if (checkDate > maxCopy) return true;
    }
    return false;
  };

  const isDaySelected = (d: number, mOffset: number = 0) => {
    if (!selectedDate) return false;
    const target = new Date(year, month + mOffset, d);
    return (
      selectedDate.getFullYear() === target.getFullYear() &&
      selectedDate.getMonth() === target.getMonth() &&
      selectedDate.getDate() === target.getDate()
    );
  };

  const isToday = (d: number, mOffset: number = 0) => {
    const today = new Date();
    const target = new Date(year, month + mOffset, d);
    return (
      today.getFullYear() === target.getFullYear() &&
      today.getMonth() === target.getMonth() &&
      today.getDate() === target.getDate()
    );
  };

  // Quick Date Presets
  const applyDatePreset = (preset: "today" | "tomorrow" | "3days" | "1week") => {
    const now = new Date();
    const target = new Date();

    if (preset === "today") {
      // today
    } else if (preset === "tomorrow") {
      target.setDate(now.getDate() + 1);
    } else if (preset === "3days") {
      target.setDate(now.getDate() + 3);
    } else if (preset === "1week") {
      target.setDate(now.getDate() + 7);
    }

    setSelectedDate(target);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    emitChange(target, hours12, minutes, period);
  };

  // Time Updates
  const updateHour = (h: number) => {
    const validH = Math.max(1, Math.min(12, h));
    setHours12(validH);
    const baseDay = selectedDate || new Date();
    setSelectedDate(baseDay);
    emitChange(baseDay, validH, minutes, period);
  };

  const updateMinute = (m: number) => {
    const validM = Math.max(0, Math.min(59, m));
    setMinutes(validM);
    const baseDay = selectedDate || new Date();
    setSelectedDate(baseDay);
    emitChange(baseDay, hours12, validM, period);
  };

  const updatePeriod = (p: "AM" | "PM") => {
    setPeriod(p);
    const baseDay = selectedDate || new Date();
    setSelectedDate(baseDay);
    emitChange(baseDay, hours12, minutes, p);
  };

  const applyQuickTime = (h: number, m: number, p: "AM" | "PM") => {
    setHours12(h);
    setMinutes(m);
    setPeriod(p);
    const baseDay = selectedDate || new Date();
    setSelectedDate(baseDay);
    emitChange(baseDay, h, m, p);
  };

  const handleSetNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const h = now.getHours();
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const m = now.getMinutes();
    const p = h >= 12 ? "PM" : "AM";
    setHours12(h12);
    setMinutes(m);
    setPeriod(p);
    emitChange(now, h12, m, p);
  };

  // Formatted trigger label
  const displayLabel = React.useMemo(() => {
    if (!parsedValue) return null;
    const monthStr = MONTH_NAMES[parsedValue.getMonth()].slice(0, 3);
    const dayStr = parsedValue.getDate();
    const yearStr = parsedValue.getFullYear();

    const h = parsedValue.getHours();
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const m = String(parsedValue.getMinutes()).padStart(2, "0");
    const p = h >= 12 ? "PM" : "AM";

    return {
      date: `${monthStr} ${dayStr}, ${yearStr}`,
      time: `${h12}:${m} ${p}`,
    };
  }, [parsedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "group relative flex h-11 w-full items-center justify-between rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-left text-sm text-white shadow-inner transition-all duration-200 hover:border-white/40 hover:bg-black/80 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            themeClasses.activeRing,
            open && "border-white/50 ring-2 ring-white/20",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white transition-colors">
              <CalendarIcon className="h-4 w-4" />
            </div>

            {displayLabel ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-white tracking-wide">
                  {displayLabel.date}
                </span>
                <span className="text-white/40">•</span>
                <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold border", themeClasses.badge)}>
                  <Clock className="w-3 h-3" />
                  {displayLabel.time}
                </span>
              </div>
            ) : (
              <span className="text-white/50 font-normal text-sm">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {parsedValue && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className={cn("h-4 w-4 text-white/50 transition-transform duration-200", open && "rotate-180 text-white")} />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={16}
        avoidCollisions={true}
        className="z-[9999] w-[340px] sm:w-[470px] max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card/98 backdrop-blur-2xl p-3.5 text-card-foreground shadow-2xl animate-in fade-in-50 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
      >
        {/* Main Two-Column Container */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          {/* LEFT COLUMN: Calendar */}
          <div className="flex-1 space-y-2.5">
            {/* Header: Month & Navigation */}
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-white/70" />
                {MONTH_NAMES[month]} {year}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="space-y-1">
              <div className="grid grid-cols-7 text-center">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-0.5 text-[10px] font-bold text-white/40 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center">
                {/* Previous Month trailing days */}
                {Array.from({ length: firstDayIndex }).map((_, i) => {
                  const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
                  const disabled = isDayDisabled(dayNum, -1);
                  return (
                    <button
                      key={`prev-${i}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(dayNum, -1)}
                      className="h-7 w-full rounded-md text-[11px] text-white/20 hover:bg-white/5 hover:text-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Current Month days */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const selected = isDaySelected(dayNum, 0);
                  const today = isToday(dayNum, 0);
                  const disabled = isDayDisabled(dayNum, 0);

                  return (
                    <button
                      key={`curr-${i}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(dayNum, 0)}
                      className={cn(
                        "relative h-7 w-full rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-center cursor-pointer",
                        selected
                          ? themeClasses.selectedDay
                          : "text-white/90 hover:bg-white/10 hover:text-white",
                        today && !selected && cn("border border-white/40 font-bold", themeClasses.todayText),
                        disabled && "text-white/20 hover:bg-transparent hover:text-white/20 cursor-not-allowed opacity-30"
                      )}
                    >
                      {dayNum}
                      {today && !selected && (
                        <span className={cn("absolute bottom-0.5 h-1 w-1 rounded-full", themeClasses.todayDot)} />
                      )}
                    </button>
                  );
                })}

                {/* Next Month leading days */}
                {Array.from({
                  length: (7 - ((firstDayIndex + daysInCurrentMonth) % 7)) % 7,
                }).map((_, i) => {
                  const dayNum = i + 1;
                  const disabled = isDayDisabled(dayNum, 1);
                  return (
                    <button
                      key={`next-${i}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(dayNum, 1)}
                      className="h-7 w-full rounded-md text-[11px] text-white/20 hover:bg-white/5 hover:text-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Date Presets */}
            {showPresets && (
              <div className="flex items-center gap-1 pt-1.5 border-t border-white/10">
                <span className="text-[10px] font-medium text-white/40 flex items-center gap-1">
                  <Sparkles className={cn("w-2.5 h-2.5", themeClasses.sparkle)} />
                </span>
                <button
                  type="button"
                  onClick={() => applyDatePreset("today")}
                  className="flex-1 rounded bg-white/5 py-0.5 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset("tomorrow")}
                  className="flex-1 rounded bg-white/5 py-0.5 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset("3days")}
                  className="flex-1 rounded bg-white/5 py-0.5 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset("1week")}
                  className="flex-1 rounded bg-white/5 py-0.5 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  +1 Wk
                </button>
              </div>
            )}
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="hidden sm:block w-[1px] bg-white/10 self-stretch" />
          <div className="block sm:hidden h-[1px] bg-white/10 w-full" />

          {/* RIGHT COLUMN: Time Picker & Quick Times */}
          <div className="w-full sm:w-[170px] flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white/70" /> Time
                </span>
                <button
                  type="button"
                  onClick={handleSetNow}
                  className="text-[10px] font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                  title="Set to current time"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Now
                </button>
              </div>

              {/* Time Steppers Box */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-2 space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => updateHour(hours12 === 12 ? 1 : hours12 + 1)}
                      className="h-4 w-7 flex items-center justify-center text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded"
                    >
                      ▲
                    </button>
                    <span className="h-7 w-8 flex items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                      {String(hours12).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateHour(hours12 === 1 ? 12 : hours12 - 1)}
                      className="h-4 w-7 flex items-center justify-center text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded"
                    >
                      ▼
                    </button>
                  </div>

                  <span className="text-sm font-bold text-white/40 pb-0.5">:</span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => updateMinute((minutes + 5) % 60)}
                      className="h-4 w-7 flex items-center justify-center text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded"
                    >
                      ▲
                    </button>
                    <span className="h-7 w-8 flex items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                      {String(minutes).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateMinute((minutes - 5 + 60) % 60)}
                      className="h-4 w-7 flex items-center justify-center text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded"
                    >
                      ▼
                    </button>
                  </div>

                  {/* AM / PM */}
                  <div className="flex flex-col rounded-md border border-white/20 bg-white/5 p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => updatePeriod("AM")}
                      className={cn(
                        "rounded px-1.5 py-1 text-[10px] font-bold transition-all",
                        period === "AM" ? themeClasses.activePill : "text-white/50 hover:text-white"
                      )}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePeriod("PM")}
                      className={cn(
                        "rounded px-1.5 py-1 text-[10px] font-bold transition-all",
                        period === "PM" ? themeClasses.activePill : "text-white/50 hover:text-white"
                      )}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Quick Time Pills */}
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => applyQuickTime(9, 0, "AM")}
                    className="rounded bg-white/5 py-1 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    9:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTime(12, 0, "PM")}
                    className="rounded bg-white/5 py-1 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    12:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTime(6, 0, "PM")}
                    className="rounded bg-white/5 py-1 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    6:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTime(8, 30, "PM")}
                    className="rounded bg-white/5 py-1 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    8:30 PM
                  </button>
                </div>
              </div>
            </div>

            {/* Done / Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "w-full rounded-lg py-1.5 text-xs flex items-center justify-center gap-1.5 transition-all hover:cursor-pointer",
                themeClasses.button
              )}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
