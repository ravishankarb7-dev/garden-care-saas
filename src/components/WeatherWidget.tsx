"use client";

import { useEffect, useState } from "react";
import { CloudRain, Snowflake, Sun, ThermometerSun } from "lucide-react";
import { WeatherAlert } from "@/lib/types";
import { getWeatherAlert } from "@/lib/weather";
import styles from "./WeatherWidget.module.css";

export default function WeatherWidget({ location }: { location: string }) {
    const [alert, setAlert] = useState<WeatherAlert | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading/fetching
        getWeatherAlert(location).then((res) => {
            setAlert(res);
            setLoading(false);
        });
    }, [location]);

    if (loading || !alert) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>Loading weather for {location}...</div>
            </div>
        );
    }

    const getIcon = () => {
        switch (alert.type) {
            case "frost": return <Snowflake size={24} color="white" />;
            case "heat": return <ThermometerSun size={24} color="white" />;
            case "rain": return <CloudRain size={24} color="white" />;
            default: return <Sun size={24} color="white" />;
        }
    };

    const isAlert = alert.type !== "none";

    return (
        <div className={`${styles.container} ${isAlert ? styles.alert : styles.calm}`}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    {getIcon()}
                </div>
                <div>
                    <div className={styles.title}>
                        {alert.type === "none" ? "Good Conditions" : `${alert.type.toUpperCase()} ALERT`}
                    </div>
                    <div className={styles.message}>{alert.message}</div>
                    <div className={styles.location}>{location}</div>
                </div>
            </div>
        </div>
    );
}
