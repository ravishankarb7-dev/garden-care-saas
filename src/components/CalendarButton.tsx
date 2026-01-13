"use client";

import { Plant } from "@/lib/types";
import { downloadICS, generateICS } from "@/lib/calendar";
import { CalendarPlus } from "lucide-react";
import style from "./CalendarButton.module.css"; // We'll create this CSS next

export default function CalendarButton({ plant, startDate }: { plant: Plant, startDate: string }) {

    const handleExport = () => {
        const icsContent = generateICS(plant, startDate);
        // Filename: plant-name-care.ics
        const filename = `${plant.name.replace(/\s+/g, '-').toLowerCase()}-care.ics`;
        downloadICS(filename, icsContent);
    };

    return (
        <button onClick={handleExport} className={style.button}>
            <CalendarPlus size={20} />
            <span>Add to Calendar</span>
        </button>
    );
}
