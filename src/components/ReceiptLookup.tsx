"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

interface ReceiptLookupProps {
    onLookup: (receiptId: string) => void;
}

export default function ReceiptLookup({ onLookup }: ReceiptLookupProps) {
    const [receiptId, setReceiptId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (receiptId.trim()) {
            onLookup(receiptId.trim());
        }
    };

    return (
        <div style={{ maxWidth: "450px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#374151" }}>
                Load existing garden
            </h2>
            <form onSubmit={handleSubmit} style={{ position: "relative" }}>
                <Search
                    size={20}
                    style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
                />
                <input
                    type="text"
                    placeholder="Enter Garden Code (e.g. MANUAL-1234)"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "1rem 1rem 1rem 3rem",
                        paddingRight: "3.5rem",
                        borderRadius: "50px",
                        border: "1px solid #E5E7EB",
                        fontSize: "1rem",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        outline: "none"
                    }}
                />
                <button
                    type="submit"
                    disabled={!receiptId.trim()}
                    style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        opacity: receiptId.trim() ? 1 : 0.5
                    }}
                >
                    <ArrowRight size={18} />
                </button>
            </form>
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#9CA3AF" }}>
                Your care schedule is linked to your unique receipt number.
            </p>
        </div>
    );
}
