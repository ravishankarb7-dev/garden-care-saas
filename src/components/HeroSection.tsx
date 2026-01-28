"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
    return (
        <section className={styles.hero} aria-label="Introduction">
            <div className={styles.content}>
                <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Foolproof plant care, <br />
                    <span className={styles.highlight}>delivered by nature.</span>
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    The only system that adapts to local conditions and provides weather-aware guidance for the first 28 days.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Link href="#demo" className={styles.cta} aria-label="Start the extensive demo simulation">
                        Simulate a Scan
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
