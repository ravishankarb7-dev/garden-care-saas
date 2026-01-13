"use client";

import { useState } from "react";
import { ScannedReceiptData } from "@/lib/ocr";
import { Check, Calendar, MapPin, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface ReceiptAnalysisFormProps {
    initialData: ScannedReceiptData;
    onConfirm: (data: FinalReceiptPayload) => void; // Defined below
    onCancel: () => void;
}

export type FinalReceiptPayload = {
    receiptId: string;
    purchaseDate: string;
    storeName: string;
    location: {
        zip: string;
        city: string;
    };
    selectedPlants: string[];
};

export default function ReceiptAnalysisForm({ initialData, onConfirm, onCancel }: ReceiptAnalysisFormProps) {
    const [receiptId, setReceiptId] = useState(initialData.receiptId);
    const [purchaseDate, setPurchaseDate] = useState(initialData.purchaseDate);
    const [storeName, setStoreName] = useState(initialData.storeName);
    const [zip, setZip] = useState("");
    const [city, setCity] = useState("");

    // Track selected plants (all selected by default)
    const [selectedPlants, setSelectedPlants] = useState<string[]>(initialData.detectedPlants);

    const togglePlant = (plant: string) => {
        if (selectedPlants.includes(plant)) {
            setSelectedPlants(selectedPlants.filter(p => p !== plant));
        } else {
            setSelectedPlants([...selectedPlants, plant]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            receiptId,
            purchaseDate,
            storeName,
            location: { zip, city },
            selectedPlants
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Review Scan Results</h2>
                <p style={{ color: "#6B7280" }}>We found the following details. Please verify.</p>
            </div>

            {/* Receipt Details Card */}
            <div style={{
                backgroundColor: "#F9FAFB",
                padding: "1.5rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid #E5E7EB"
            }}>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {/* Row 1 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>Receipt ID</label>
                            <input
                                type="text"
                                value={receiptId}
                                onChange={e => setReceiptId(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Purchase Date</label>
                            <input
                                type="date"
                                value={purchaseDate}
                                onChange={e => setPurchaseDate(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div>
                        <label style={labelStyle}>Store Name</label>
                        <input
                            type="text"
                            value={storeName}
                            onChange={e => setStoreName(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Row 3 - Location */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>Zip Code</label>
                            <input
                                type="text"
                                value={zip}
                                onChange={e => setZip(e.target.value)}
                                placeholder="e.g. 90210"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>City (Optional)</label>
                            <input
                                type="text"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder="e.g. Beverly Hills"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Plants Selection */}
            <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Tag size={18} /> Found Plants ({selectedPlants.length})
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {initialData.detectedPlants.map((plant) => {
                        const isSelected = selectedPlants.includes(plant);
                        return (
                            <div
                                key={plant}
                                onClick={() => togglePlant(plant)}
                                style={{
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    border: `1px solid ${isSelected ? "#10B981" : "#E5E7EB"}`,
                                    backgroundColor: isSelected ? "rgba(16, 185, 129, 0.05)" : "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{plant}</span>
                                {isSelected && (
                                    <div style={{
                                        width: "24px", height: "24px",
                                        backgroundColor: "#10B981",
                                        borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "white"
                                    }}>
                                        <Check size={14} />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Fallback if no plants detected */}
                    {initialData.detectedPlants.length === 0 && (
                        <div style={{ padding: "1rem", textAlign: "center", color: "#6B7280", border: "1px dashed #D1D5DB", borderRadius: "8px" }}>
                            No plants automatically detected.
                            <br />
                            <button type="button" style={{
                                marginTop: "0.5rem",
                                color: "#059669",
                                background: "none", border: "none",
                                textDecoration: "underline", cursor: "pointer"
                            }}>
                                Add plant manually
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{ ...buttonStyle, backgroundColor: "white", color: "#374151", border: "1px solid #D1D5DB" }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={selectedPlants.length === 0}
                    style={{ ...buttonStyle, backgroundColor: "#059669", color: "white", flex: 1, opacity: selectedPlants.length === 0 ? 0.5 : 1 }}
                >
                    Confirm & Create Schedule
                </button>
            </div>
        </form>
    );
}

// Styles
const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.4rem"
};

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "0.95rem",
    outline: "none"
};

const buttonStyle = {
    padding: "0.875rem 1.5rem",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    transition: "transform 0.1s"
};
