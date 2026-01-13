"use client";

import Link from "next/link";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import TestimonialSection from "@/components/TestimonialSection";
import { PLANTS } from "@/lib/data";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main style={{ scrollBehavior: "smooth" }}>
      <Header />

      <HeroSection />

      <FeatureSection />

      <section id="demo" style={{
        padding: "6rem 1.5rem",
        maxWidth: "1000px",
        margin: "0 auto",
        textAlign: "center"
      }} aria-label="Interactive Demo">
        <h2 style={{
          fontSize: "2.5rem",
          marginBottom: "1rem",
          color: "var(--color-green-900)"
        }}>
          Try the Experience
        </h2>
        <p style={{
          marginBottom: "3rem",
          color: "var(--color-text-muted)",
          fontSize: "1.2rem"
        }}>
          Select a plant below to simulate scanning a QR code.
        </p>

        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {PLANTS.map((plant, idx) => (
            <Link key={plant.id} href={`/plant/${plant.id}`} style={{ textDecoration: "none" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
                  border: "1px solid #F3F4F6",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textAlign: "left"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.5rem", color: "var(--color-text-main)", marginBottom: "0.5rem" }}>{plant.name}</h3>
                  <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>{plant.botanicalName}</p>
                </div>
                <div style={{
                  marginTop: "1.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "var(--color-green-800)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  Start Care →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <TestimonialSection />
    </main>
  );
}
