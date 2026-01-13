"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./IntakeForm.module.css";
import { Plant } from "@/lib/types";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

export default function IntakeForm({ plant }: { plant: Plant }) {
    const router = useRouter();
    const [zip, setZip] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#D4F482', '#38664B', '#ffffff'] // Lime palette
        });

        setTimeout(() => {
            router.push(`/care/${plant.id}?zip=${zip}&start=${date}`);
        }, 1200);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={styles.form}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className={styles.header}>
                <h2 className={styles.title}>Let's get growing.</h2>
                <p className={styles.subtitle}>Setup care for your <strong>{plant.name}</strong></p>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}><Calendar size={16} /> Purchase Date</label>
                <motion.input
                    whileFocus={{ scale: 1.02, backgroundColor: "#fff" }}
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}><MapPin size={16} /> Location</label>
                <motion.input
                    whileFocus={{ scale: 1.02, backgroundColor: "#fff" }}
                    type="text"
                    required
                    pattern=".*"
                    placeholder="Zip Code or City"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={styles.input}
                />
            </div>

            <motion.button
                type="submit"
                disabled={isSubmitting}
                className={styles.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isSubmitting ? (
                    "Building Schedule..."
                ) : (
                    <>Start Care <ArrowRight size={20} /></>
                )}
            </motion.button>
        </motion.form>
    );
}
