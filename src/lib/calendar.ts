

export interface CalendarEvent {
    title: string;
    description: string;
    start: Date;
    end?: Date; // Optional, defaults to 1 hour after start
    location?: string;
    recurrence?: string; // e.g., "RRULE:FREQ=WEEKLY;INTERVAL=1"
}

/**
 * Generates a Google Calendar link for the given event.
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
    const startStr = formatDateForGoogle(event.start);
    const endStr = formatDateForGoogle(event.end || new Date(event.start.getTime() + 60 * 60 * 1000)); // Default 1 hour duration

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", event.title);
    url.searchParams.append("dates", `${startStr}/${endStr}`);
    if (event.description) url.searchParams.append("details", event.description);
    if (event.location) url.searchParams.append("location", event.location);
    if (event.recurrence) url.searchParams.append("recur", event.recurrence);

    return url.toString();
}

/**
 * Download an .ics file for a single event.
 */
export function downloadICS(event: CalendarEvent): void {
    downloadScheduleICS([event], `${event.title.replace(/\s+/g, "_")}.ics`);
}

/**
 * Download an .ics file for multiple events (Full Schedule).
 */
export function downloadScheduleICS(events: CalendarEvent[], filenameProp?: string): void {
    const filename = filenameProp || "Garden_Care_Schedule.ics";

    // Generate VEVENT blocks
    const eventBlocks = events.map(event => {
        const startStr = formatDateForICS(event.start);
        const endStr = formatDateForICS(event.end || new Date(event.start.getTime() + 60 * 60 * 1000));

        return `BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@gardencare.app
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ""}
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Garden Care SaaS//NONSGML v1.0//EN
${eventBlocks}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper to format date for Google Calendar (YYYYMMDDTHHmmssZ)
function formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

// Helper to format date for ICS (YYYYMMDDTHHmmssZ)
function formatDateForICS(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}
