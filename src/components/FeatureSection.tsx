"use client";

import { ScanLine, Sprout, BellRing } from "lucide-react";
import styles from "./FeatureSection.module.css";
import { motion } from "framer-motion";

const steps = [
    {
        icon: <ScanLine size={32} />,
        title: "1. Scan the Plant",
        desc: "Every pot comes with a unique QR code. No app download required."
    },
    {
        icon: <Sprout size={32} />,
        title: "2. Get Custom Care",
        desc: "We build a schedule based on your purchase date and local weather."
    },
    {
        icon: <BellRing size={32} />,
        title: "3. Never Forget",
        desc: "Receive text alerts only when it truly matters (frost, heat, drought)."
    }
];

export default function FeatureSection() {
    return (
        <section className={styles.section} aria-label="How it works">
            <div className={styles.container}>
                <motion.div
                    className={styles.grid}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                    }}
                >
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            className={styles.card}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <div className={styles.iconWrapper} aria-hidden="true">{step.icon}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
