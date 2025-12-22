import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface TimeSlot {
  start: string;
  end: string;
  datetime: string;
}

// GET /api/therapy/available-slots?therapistId=xxx&date=2024-01-15
// Returns available booking slots for a therapist on a given date
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD format

    if (!therapistId) {
      return NextResponse.json({ error: 'therapistId is required' }, { status: 400 });
    }

    // If no date specified, get slots for next 7 days
    const startDate = dateStr ? new Date(dateStr) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (dateStr ? 1 : 7));

    // Get therapist's availability
    const availability = await prisma.therapistAvailability.findMany({
      where: {
        therapistId,
        isBlocked: false,
      },
    });

    if (availability.length === 0) {
      return NextResponse.json({ slots: [], message: 'Therapist has no availability set' });
    }

    // Get existing bookings for the date range
    const existingBookings = await prisma.therapySession.findMany({
      where: {
        therapistId,
        status: { in: ['scheduled', 'in_progress'] },
        scheduledAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: { scheduledAt: true, duration: true },
    });

    // Generate available slots
    const slots: Array<{ date: string; slots: TimeSlot[] }> = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Find availability slots for this day
      const dayAvailability = availability.filter(a => {
        if (a.isRecurring) {
          return a.dayOfWeek === dayOfWeek;
        } else if (a.specificDate) {
          const specificDateStr = a.specificDate.toISOString().split('T')[0];
          return specificDateStr === dateString;
        }
        return false;
      });

      // Check for blocked dates
      const isBlocked = availability.some(a => {
        if (a.isBlocked && a.specificDate) {
          const blockedDateStr = a.specificDate.toISOString().split('T')[0];
          return blockedDateStr === dateString;
        }
        return false;
      });

      if (!isBlocked && dayAvailability.length > 0) {
        const daySlots: TimeSlot[] = [];

        for (const avail of dayAvailability) {
          const sessionDuration = avail.sessionDuration || 60;
          const bufferTime = avail.bufferTime || 15;

          // Parse start and end times
          const [startHour, startMin] = avail.startTime.split(':').map(Number);
          const [endHour, endMin] = avail.endTime.split(':').map(Number);

          let currentSlotStart = startHour * 60 + startMin; // in minutes
          const availabilityEnd = endHour * 60 + endMin;

          // Generate slots within this availability window
          while (currentSlotStart + sessionDuration <= availabilityEnd) {
            const slotStartHour = Math.floor(currentSlotStart / 60);
            const slotStartMin = currentSlotStart % 60;
            const slotEndHour = Math.floor((currentSlotStart + sessionDuration) / 60);
            const slotEndMin = (currentSlotStart + sessionDuration) % 60;

            const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
            const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

            // Create datetime for this slot
            const slotDatetime = new Date(currentDate);
            slotDatetime.setHours(slotStartHour, slotStartMin, 0, 0);

            // Check if slot is in the past
            if (slotDatetime > new Date()) {
              // Check if slot conflicts with existing bookings
              const isBooked = existingBookings.some(booking => {
                const bookingStart = booking.scheduledAt.getTime();
                const bookingEnd = bookingStart + (booking.duration * 60 * 1000);
                const slotStartTime = slotDatetime.getTime();
                const slotEndTime = slotStartTime + (sessionDuration * 60 * 1000);

                return slotStartTime < bookingEnd && slotEndTime > bookingStart;
              });

              if (!isBooked) {
                daySlots.push({
                  start: slotStart,
                  end: slotEnd,
                  datetime: slotDatetime.toISOString(),
                });
              }
            }

            currentSlotStart += sessionDuration + bufferTime;
          }
        }

        if (daySlots.length > 0) {
          slots.push({
            date: dateString,
            slots: daySlots.sort((a, b) => a.start.localeCompare(b.start)),
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
