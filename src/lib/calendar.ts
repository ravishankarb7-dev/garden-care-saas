import { CareTask, Plant } from "./types";
import { addDays, format, startOfDay } from "date-fns";

export function generateICS(plant: Plant, startDate: string): string {
    const start = startOfDay(new Date(startDate));
    const tasks = plant.careSchedule;

    let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BetterRoots//Garden Care//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ];

    tasks.forEach((task) => {
        const taskDate = addDays(start, task.day);
        // ICS format: YYYYMMDD
        const dateStr = format(taskDate, "yyyyMMdd");

        // Create a unique UID for each event
        const uid = `${plant.id}-${task.day}-${dateStr}@betterroots.app`;

        icsContent.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTART;VALUE=DATE:${dateStr}`,
            `DTEND;VALUE=DATE:${dateStr}`, // Single day event
            `SUMMARY:BetterRoots: ${task.action} ${plant.name}`,
            `DESCRIPTION:${task.description}`,
            "STATUS:CONFIRMED",
            "END:VEVENT"
        );
    });

    icsContent.push("END:VCALENDAR");

    return icsContent.join("\r\n");
}

export function downloadICS(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
