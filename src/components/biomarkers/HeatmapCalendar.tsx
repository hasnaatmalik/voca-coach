'use client';

import { useMemo } from 'react';

interface DayData {
  date: string;
  count: number;
  avgScore?: number;
}

interface HeatmapCalendarProps {
  data: DayData[];
  weeks?: number;
  title?: string;
  onDayClick?: (date: string) => void;
}

export default function HeatmapCalendar({
  data,
  weeks = 12,
  title = 'Recording Activity',
  onDayClick,
}: HeatmapCalendarProps) {
  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>();
    data.forEach(d => {
      const dateKey = d.date.split('T')[0];
      map.set(dateKey, d);
    });
    return map;
  }, [data]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7) + 1);

    // Adjust to start from Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const calendar: Array<{ date: Date; dateKey: string; dayData?: DayData }[]> = [];
    let currentWeek: Array<{ date: Date; dateKey: string; dayData?: DayData }> = [];

    const current = new Date(startDate);
    while (current <= today) {
      const dateKey = current.toISOString().split('T')[0];
      currentWeek.push({
        date: new Date(current),
        dateKey,
        dayData: dataMap.get(dateKey),
      });

      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      calendar.push(currentWeek);
    }

    return calendar;
  }, [dataMap, weeks]);

  // Get color intensity based on count and score
  const getColor = (dayData?: DayData): string => {
    if (!dayData || dayData.count === 0) {
      return '#E5E7EB';
    }

    // Use average score if available, otherwise use count
    const intensity = dayData.avgScore !== undefined
      ? dayData.avgScore / 100
      : Math.min(dayData.count / 5, 1);

    // Gradient from light purple to dark purple based on intensity
    if (intensity >= 0.8) return '#7C3AED';
    if (intensity >= 0.6) return '#8B5CF6';
    if (intensity >= 0.4) return '#A78BFA';
    if (intensity >= 0.2) return '#C4B5FD';
    return '#DDD6FE';
  };

  // Calculate totals
  const totalRecordings = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter(d => d.count > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    const current = new Date(today);

    while (true) {
      const dateKey = current.toISOString().split('T')[0];
      const dayData = dataMap.get(dateKey);
      if (dayData && dayData.count > 0) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else if (current.getTime() === today.getTime()) {
        // Today has no recording yet, check yesterday
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [dataMap]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Determine which months to show
  const monthsToShow = useMemo(() => {
    const months: { month: number; year: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.date.getMonth();
        if (month !== lastMonth) {
          months.push({ month, year: firstDayOfWeek.date.getFullYear(), weekIndex });
          lastMonth = month;
        }
      }
    });

    return months;
  }, [calendarData]);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#1F2937',
          }}
        >
          {title}
        </h3>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#7C3AED' }}>{totalRecordings}</div>
            <div style={{ color: '#6B7280' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#EC4899' }}>{activeDays}</div>
            <div style={{ color: '#6B7280' }}>Days</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#10B981' }}>{currentStreak}</div>
            <div style={{ color: '#6B7280' }}>Streak</div>
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div
        style={{
          display: 'flex',
          marginLeft: '24px',
          marginBottom: '4px',
          fontSize: '10px',
          color: '#6B7280',
        }}
      >
        {monthsToShow.map((m, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${24 + m.weekIndex * 14}px`,
            }}
          >
            {monthLabels[m.month]}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'flex', marginTop: '16px' }}>
        {/* Day labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginRight: '4px',
          }}
        >
          {dayLabels.map((label, i) => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '12px',
                fontSize: '9px',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
          {calendarData.map((week, weekIndex) => (
            <div
              key={weekIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {week.map((day, dayIndex) => {
                const isToday = day.dateKey === new Date().toISOString().split('T')[0];
                const isFuture = day.date > new Date();

                return (
                  <div
                    key={dayIndex}
                    onClick={() => !isFuture && onDayClick?.(day.dateKey)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      background: isFuture ? 'transparent' : getColor(day.dayData),
                      border: isToday ? '1px solid #7C3AED' : 'none',
                      cursor: isFuture ? 'default' : 'pointer',
                      transition: 'transform 0.1s',
                    }}
                    title={
                      isFuture
                        ? ''
                        : `${day.dateKey}: ${day.dayData?.count || 0} recording(s)${
                            day.dayData?.avgScore !== undefined
                              ? `, avg score: ${day.dayData.avgScore.toFixed(0)}%`
                              : ''
                          }`
                    }
                    onMouseEnter={e => {
                      if (!isFuture) {
                        (e.target as HTMLElement).style.transform = 'scale(1.3)';
                      }
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.transform = 'scale(1)';
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px',
          marginTop: '12px',
          fontSize: '10px',
          color: '#6B7280',
        }}
      >
        <span>Less</span>
        {['#E5E7EB', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'].map((color, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: color,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
