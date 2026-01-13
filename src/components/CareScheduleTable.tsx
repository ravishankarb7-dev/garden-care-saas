"use client";

import { CareTask, Plant } from "@/lib/types";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { Droplets, Sprout, Bug, Ban, Leaf } from "lucide-react";
import styles from "./CareScheduleTable.module.css";

export default function CareScheduleTable({ plant, startDate }: { plant: Plant, startDate: string }) {
    const start = startOfDay(new Date(startDate));
    const today = startOfDay(new Date());

    const timeline = plant.careSchedule.map((task: CareTask) => {
        const taskDate = addDays(start, task.day);
        const isPast = isBefore(taskDate, today);
        const isToday = taskDate.getTime() === today.getTime();
        return { ...task, date: taskDate, isPast, isToday };
    });

    const getActionIcon = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes("no water")) return <Ban size={16} />;
        if (lower.includes("water")) return <Droplets size={16} />;
        if (lower.includes("fertilize")) return <Sprout size={16} />;
        if (lower.includes("pest")) return <Bug size={16} />;
        return <Leaf size={16} />;
    };

    const getActionClass = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes("no water")) return styles.noWater;
        if (lower.includes("water")) return styles.water;
        if (lower.includes("fertilize")) return styles.fertilize;
        if (lower.includes("pest")) return styles.pest;
        return styles.generic;
    };

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Date</th>
                        <th className={styles.th}>Action</th>
                        <th className={styles.th}>Instructions</th>
                    </tr>
                </thead>
                <tbody>
                    {timeline.map((item, idx) => (
                        <tr key={idx} className={`${styles.tr} ${item.isPast ? styles.past : ""} ${item.isToday ? styles.today : ""}`}>
                            <td className={styles.dateCell}>
                                <div className={styles.date}>{format(item.date, "MMM d")}</div>
                                <div className={styles.day}>Day {item.day}</div>
                            </td>
                            <td className={styles.actionCell}>
                                <div className={`${styles.badge} ${getActionClass(item.action)}`}>
                                    {getActionIcon(item.action)}
                                    <span>{item.action}</span>
                                </div>
                            </td>
                            <td className={styles.descCell}>
                                {item.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
