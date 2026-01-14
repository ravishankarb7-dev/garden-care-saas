"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Sprout, Loader2, Calendar, MapPin } from "lucide-react";
import { Plant } from "@/lib/types";
import { findMatchingPlants } from "@/lib/match";
import { getPlants } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface ManualEntryPayload {
    plants: Plant[];
    date: string;
    zip: string;
}

interface ManualEntryFormProps {
    onConfirm: (payload: ManualEntryPayload) => void;
    onCancel: () => void;
}

export default function ManualEntryForm({ onConfirm, onCancel }: ManualEntryFormProps) {
    const [query, setQuery] = useState("");
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<Plant[]>([]);
    const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);

    // New fields
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [zip, setZip] = useState("");

    // Load plants on mount
    useEffect(() => {
        async function load() {
            try {
                const plants = await getPlants();
                setAllPlants(plants);
            } catch (err) {
                console.error("Failed to load plants", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Update suggestions on query change
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        // Use our fuzzy matcher
        const matches = findMatchingPlants(query, allPlants, 4);
        setSuggestions(matches.slice(0, 5)); // limit to top 5
    }, [query, allPlants]);

    const addPlant = (plant: Plant) => {
        if (!selectedPlants.some(p => p.id === plant.id)) {
            setSelectedPlants([...selectedPlants, plant]);
        }
        setQuery(""); // Clear search after adding
    };

    const removePlant = (id: string) => {
        setSelectedPlants(selectedPlants.filter(p => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            plants: selectedPlants,
            date,
            zip
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--font-serif)", color: "var(--color-green-900)", marginBottom: "0.5rem" }}>Manual Entry</h2>
                <p style={{ color: "var(--color-text-muted)" }}>Type the name of your plant (or SKU). We'll help you find the closest match.</p>
            </div>

            {/* Selected Plants List */}
            {selectedPlants.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-green-900)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Selected Plants
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        {selectedPlants.map(plant => (
                            <div key={plant.id} style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "var(--color-sage-100)",
                                color: "var(--color-green-900)",
                                borderRadius: "50px",
                                border: "1px solid var(--color-sage-400)"
                            }}>
                                <Sprout size={16} />
                                <span style={{ fontWeight: 500 }}>{plant.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removePlant(plant.id)}
                                    style={{
                                        border: "none", background: "none", cursor: "pointer",
                                        color: "var(--color-green-700)", display: "flex", alignItems: "center"
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "2rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--color-green-900)" }}>Plant Name or SKU</label>
                <div style={{ position: "relative" }}>
                    <Search
                        size={20}
                        style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-sage-500)" }}
                    />
                    <input
                        type="text"
                        placeholder={loading ? "Loading plants..." : "Type plant name (e.g. 'Fidl Lef Fig')"}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "1rem 1rem 1rem 3rem",
                            borderRadius: "12px",
                            border: "1px solid var(--color-sage-400)",
                            fontSize: "1rem",
                            outline: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            backgroundColor: "white"
                        }}
                    />
                    {loading && (
                        <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }}>
                            <Loader2 className="animate-spin" size={20} color="var(--color-text-muted)" />
                        </div>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <Card padding="none" style={{
                        position: "absolute",
                        top: "100%", left: 0, right: 0,
                        marginTop: "0.5rem",
                        zIndex: 10,
                        backgroundColor: "white"
                    }}>
                        {suggestions.map(plant => (
                            <button
                                key={plant.id}
                                type="button"
                                onClick={() => addPlant(plant)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    width: "100%", padding: "1rem",
                                    border: "none", borderBottom: "1px solid var(--color-bg-cream)",
                                    background: "white", textAlign: "left", cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-cream)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: "var(--color-green-900)" }}>{plant.name}</div>
                                    {plant.botanicalName && (
                                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                                            {plant.botanicalName}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    width: "28px", height: "28px",
                                    borderRadius: "50%", backgroundColor: "var(--color-sage-100)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--color-green-700)"
                                }}>
                                    <Plus size={18} />
                                </div>
                            </button>
                        ))}
                    </Card>
                )}
            </div>

            {/* Date and Zip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--color-green-900)" }}>Planting Date</label>
                    <div style={{ position: "relative" }}>
                        <Calendar size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-sage-500)" }} />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem 1rem 0.875rem 2.5rem",
                                borderRadius: "8px",
                                border: "1px solid var(--color-sage-400)",
                                fontSize: "1rem",
                                outline: "none",
                                backgroundColor: "white"
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--color-green-900)" }}>Zip Code</label>
                    <div style={{ position: "relative" }}>
                        <MapPin size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-sage-500)" }} />
                        <input
                            type="text"
                            placeholder="e.g. 90210"
                            value={zip}
                            onChange={e => setZip(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem 1rem 0.875rem 2.5rem",
                                borderRadius: "8px",
                                border: "1px solid var(--color-sage-400)",
                                fontSize: "1rem",
                                outline: "none",
                                backgroundColor: "white"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem" }}>
                <Button variant="ghost" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    fullWidth
                    disabled={selectedPlants.length === 0}
                    variant="primary"
                >
                    Create Care Schedule ({selectedPlants.length})
                </Button>
            </div>
        </form>
    );
}
