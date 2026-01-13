"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Plant } from "@/lib/types";

export default function PlantLibrary({ plants }: { plants: Plant[] }) {
    const [query, setQuery] = useState("");

    const filteredPlants = plants.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.botanicalName.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1.5rem" }}>
            {/* Hero / Header Section of Library */}
            <div style={{ marginBottom: "4rem", maxWidth: "600px" }}>
                <h1 style={{
                    fontSize: "3.5rem",
                    marginBottom: "1.5rem",
                    color: "var(--color-text-main)",
                    letterSpacing: "-0.03em"
                }}>
                    Plant Care Library
                </h1>
                <p style={{
                    fontSize: "1.1rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "2.5rem",
                    lineHeight: "1.6"
                }}>
                    Search this library to learn how to care for each of your plants.
                </p>

                <div style={{ position: "relative" }}>
                    <Search
                        size={20}
                        style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
                    />
                    <input
                        type="text"
                        placeholder="Type plant name"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "1rem 1rem 1rem 3.5rem",
                            borderRadius: "50px",
                            border: "1px solid #E5E7EB",
                            fontSize: "1rem",
                            fontFamily: "var(--font-sans)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                            transition: "all 0.2s"
                        }}
                    />
                </div>
            </div>

            {/* Grid Section */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "2.5rem 1.5rem"
            }}>
                {filteredPlants.map((plant, idx) => (
                    <Link key={plant.id} href={`/plant/${plant.id}`} style={{ textDecoration: "none" }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                            style={{ cursor: "pointer" }}
                        >
                            {/* Placeholder Image Area */}
                            <div style={{
                                backgroundColor: "#F3F4F6",
                                aspectRatio: "1",
                                borderRadius: "16px",
                                marginBottom: "1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#9CA3AF",
                                fontSize: "0.9rem"
                            }}>
                                {/* In a real app, <Image src={plant.imageUrl} ... /> */}
                                [Image: {plant.name}]
                            </div>

                            <h3 style={{
                                fontSize: "1.25rem",
                                fontFamily: "var(--font-serif)",
                                color: "var(--color-text-main)",
                                textAlign: "center"
                            }}>
                                {plant.name}
                            </h3>
                        </motion.div>
                    </Link>
                ))}

                {filteredPlants.length === 0 && (
                    <p style={{ color: "var(--color-text-muted)" }}>No plants found matching "{query}".</p>
                )}
            </div>
        </div>
    );
}
