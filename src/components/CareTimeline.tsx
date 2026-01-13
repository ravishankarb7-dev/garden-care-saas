import { CareTask, Plant } from "@/lib/types";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { Check } from "lucide-react";
import styles from "./CareTimeline.module.css";

export default function CareTimeline({ plant, startDate }: { plant: Plant, startDate: string }) {
    const start = startOfDay(new Date(startDate));
    const today = startOfDay(new Date());

    // Generate timeline for next 30 days
    const timeline = plant.careSchedule.map((task: CareTask) => {
        const taskDate = addDays(start, task.day);
        const isPast = isBefore(taskDate, today);
        const isToday = taskDate.getTime() === today.getTime();

        return { ...task, date: taskDate, isPast, isToday };
    });

    return (
        <div className={styles.timeline}>
            {timeline.map((item, idx) => (
                <div key={idx} className={`${styles.task} ${item.isPast ? styles.past : ""} ${item.isToday ? styles.today : ""}`}>
                    {/* Timeline Marker */}
                    <div className={styles.marker}>
                        {item.isPast && <Check size={10} color="white" style={{ position: "absolute", top: "1px", left: "1px" }} />}
                    </div>

                    <div className={styles.date}>
                        {format(item.date, "MMM d")}
                    </div>

                    <div className={styles.content}>
                        <div className={styles.action}>{item.action}</div>
                        <div className={styles.description}>{item.description}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
