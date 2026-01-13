"use client";

import { Plant } from "@/lib/types";
import { useState } from "react";
import styles from "./TroubleshootingGuide.module.css";

export default function TroubleshootingGuide({ plant }: { plant: Plant }) {
    const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

    const selectedDiagnosis = plant.troubleshooting.find(t => t.symptom === selectedSymptom);

    if (plant.troubleshooting.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Plant Doctor</h2>
            <p className={styles.subtitle}>Tap a symptom to see the cure.</p>

            <div className={styles.tags}>
                {plant.troubleshooting.map((t, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedSymptom(selectedSymptom === t.symptom ? null : t.symptom)}
                        className={`${styles.tag} ${selectedSymptom === t.symptom ? styles.selectedTag : ''}`}
                    >
                        {t.symptom}
                    </button>
                ))}
            </div>

            {selectedDiagnosis && (
                <div className={styles.result}>
                    <div className={styles.diagnosis}>
                        {selectedDiagnosis.diagnosis}
                    </div>
                    <p className={styles.action}>
                        {selectedDiagnosis.action}
                    </p>
                </div>
            )}
        </div>
    );
}
