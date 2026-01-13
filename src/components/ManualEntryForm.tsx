"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Sprout, Loader2, Calendar, MapPin } from "lucide-react";
import { Plant } from "@/lib/types";
import { findMatchingPlants } from "@/lib/match";
import { getPlants } from "@/lib/queries";

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
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Add Plants Manually</h2>
                <p style={{ color: "#6B7280" }}>Type the name of your plant (or SKU). We'll help you find the closest match.</p>
            </div>

            {/* Selected Plants List */}
            {selectedPlants.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#374151" }}>
                        Selected Plants
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {selectedPlants.map(plant => (
                            <div key={plant.id} style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "#ECFDF5",
                                color: "#065F46",
                                borderRadius: "50px",
                                border: "1px solid #A7F3D0"
                            }}>
                                <Sprout size={16} />
                                <span style={{ fontWeight: 500 }}>{plant.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removePlant(plant.id)}
                                    style={{
                                        border: "none", background: "none", cursor: "pointer",
                                        color: "#059669", display: "flex", alignItems: "center"
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
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>Plant Name or SKU</label>
                <div style={{ position: "relative" }}>
                    <Search
                        size={20}
                        style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
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
                            border: "1px solid #E5E7EB",
                            fontSize: "1rem",
                            outline: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                    />
                    {loading && (
                        <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }}>
                            <Loader2 className="animate-spin" size={20} color="#9CA3AF" />
                        </div>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "100%", left: 0, right: 0,
                        backgroundColor: "white",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #E5E7EB",
                        marginTop: "0.5rem",
                        zIndex: 10,
                        overflow: "hidden"
                    }}>
                        {suggestions.map(plant => (
                            <button
                                key={plant.id}
                                type="button"
                                onClick={() => addPlant(plant)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    width: "100%", padding: "1rem",
                                    border: "none", borderBottom: "1px solid #F3F4F6",
                                    background: "white", textAlign: "left", cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: "#1F2937" }}>{plant.name}</div>
                                    {plant.botanicalName && (
                                        <div style={{ fontSize: "0.85rem", color: "#6B7280", fontStyle: "italic" }}>
                                            {plant.botanicalName}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    width: "24px", height: "24px",
                                    borderRadius: "50%", backgroundColor: "#F3F4F6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#4B5563"
                                }}>
                                    <Plus size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Date and Zip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>Planting Date</label>
                    <div style={{ position: "relative" }}>
                        <Calendar size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem 1rem 0.875rem 2.5rem",
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                fontSize: "1rem",
                                outline: "none"
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>Zip Code</label>
                    <div style={{ position: "relative" }}>
                        <MapPin size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                        <input
                            type="text"
                            placeholder="e.g. 90210"
                            value={zip}
                            onChange={e => setZip(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem 1rem 0.875rem 2.5rem",
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                fontSize: "1rem",
                                outline: "none"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "3rem" }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: "0.875rem 1.5rem", borderRadius: "8px", fontWeight: 500, fontSize: "1rem", cursor: "pointer",
                        backgroundColor: "white", color: "#374151", border: "1px solid #D1D5DB"
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={selectedPlants.length === 0}
                    style={{
                        padding: "0.875rem 1.5rem", borderRadius: "8px", fontWeight: 500, fontSize: "1rem", cursor: "pointer",
                        backgroundColor: "#059669", color: "white", border: "none", flex: 1,
                        opacity: selectedPlants.length === 0 ? 0.5 : 1
                    }}
                >
                    Create Care Schedule ({selectedPlants.length})
                </button>
            </div>
        </form>
    );
}
