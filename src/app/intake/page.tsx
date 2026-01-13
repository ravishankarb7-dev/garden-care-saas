"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ReceiptUploader from "@/components/ReceiptUploader";
import ReceiptAnalysisForm, { FinalReceiptPayload } from "@/components/ReceiptAnalysisForm";
import ReceiptLookup from "@/components/ReceiptLookup";
import ManualEntryForm from "@/components/ManualEntryForm";
import { ScannedReceiptData } from "@/lib/ocr";
import { ArrowLeft, Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Plant } from "@/lib/types";

export default function IntakePage() {
    const router = useRouter();
    const [step, setStep] = useState<"SELECT" | "REVIEW" | "MANUAL">("SELECT");
    const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);

    const handleScanComplete = (data: ScannedReceiptData) => {
        setScannedData(data);
        setStep("REVIEW");
    };

    const handleConfirm = async (payload: FinalReceiptPayload) => {
        // Here we would call the Server Action to create the sessions in Supabase
        console.log("Creating sessions for:", payload);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to a dashboard or success page (using Receipt ID)
        alert(`Success! Created care schedule for ${payload.selectedPlants.length} plants under Receipt ${payload.receiptId}.`);
        router.push("/dashboard");
    };

    const handleManualConfirm = async (payload: { plants: Plant[], date: string, zip: string }) => {
        try {
            // Import dynamically to avoid build cycle issues
            const { createCareSessions, getCareSessionsByReceipt } = await import("@/lib/queries");

            // 1. Check for duplicates
            const myReceipts = JSON.parse(localStorage.getItem("my_receipts") || "[]");
            const existingSessions = await getCareSessionsByReceipt(myReceipts);

            const isDuplicate = payload.plants.some(newPlant => {
                return existingSessions.some(existing => {
                    // Check if same plant ID (category matches uuid) AND same date
                    const samePlant = existing.care_category_id === newPlant.uuid;
                    const sameDate = new Date(existing.planted_at).toISOString().split('T')[0] === new Date(payload.date).toISOString().split('T')[0];
                    const sameZip = existing.zip === payload.zip;
                    return samePlant && sameDate && sameZip;
                });
            });

            if (isDuplicate) {
                alert("You already have this plant in your garden with the same planting date and zip code.");
                return;
            }

            // 2. Generate a unique receipt ID for this manual entry
            const receiptId = `MANUAL-${Date.now().toString().slice(-6)}`;

            const success = await createCareSessions(receiptId, payload.plants, payload.date, payload.zip);

            if (!success) {
                alert("Failed to save your garden. Please try again.");
                return;
            }

            // Save receipt ID to local storage so Dashboard knows it's ours
            const existingReceipts = JSON.parse(localStorage.getItem("my_receipts") || "[]");
            localStorage.setItem("my_receipts", JSON.stringify([...existingReceipts, receiptId]));

            alert(`Success! Added ${payload.plants.length} plants to your garden.`);
            router.push("/dashboard");
        } catch (err) {
            console.error("Manual entry failed:", err);
            alert("An unexpected error occurred.");
        }
    };

    const handleLookup = (receiptId: string) => {
        // Redirect to dashboard with receipt ID
        console.log("Looking up receipt:", receiptId);
        alert(`Looking up receipt: ${receiptId} (Implementation pending dashboard)`);
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
            <Header />

            <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                {step === "SELECT" && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <h1 style={{
                                fontSize: "2.5rem",
                                fontWeight: 700,
                                color: "#1F2937",
                                marginBottom: "1rem",
                                letterSpacing: "-0.02em"
                            }}>
                                New Plant Care
                            </h1>
                            <p style={{ fontSize: "1.1rem", color: "#6B7280", maxWidth: "500px", margin: "0 auto" }}>
                                Upload your receipt to automatically generate care schedules for all your new plants.
                            </p>
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <ReceiptUploader onScanComplete={handleScanComplete} />
                        </div>

                        {/* Manual Entry Option */}
                        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                            <button
                                onClick={() => setStep("MANUAL")}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#059669", fontWeight: 500,
                                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                    padding: "0.5rem 1rem", borderRadius: "8px",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F0FDF4"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <Keyboard size={18} />
                                Don't have a receipt? Enter plants manually
                            </button>
                        </div>

                        <div style={{
                            borderTop: "1px solid #E5E7EB",
                            paddingTop: "3rem",
                            marginTop: "3rem"
                        }}>
                            <ReceiptLookup onLookup={handleLookup} />
                        </div>
                    </>
                )}

                {step === "REVIEW" && scannedData && (
                    <div>
                        <button
                            onClick={() => setStep("SELECT")}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                background: "none", border: "none",
                                color: "#6B7280", cursor: "pointer",
                                marginBottom: "2rem",
                                fontSize: "0.95rem"
                            }}
                        >
                            <ArrowLeft size={18} /> Back to Upload
                        </button>

                        <ReceiptAnalysisForm
                            initialData={scannedData}
                            onConfirm={handleConfirm}
                            onCancel={() => setStep("SELECT")}
                        />
                    </div>
                )}

                {step === "MANUAL" && (
                    <div>
                        <button
                            onClick={() => setStep("SELECT")}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                background: "none", border: "none",
                                color: "#6B7280", cursor: "pointer",
                                marginBottom: "2rem",
                                fontSize: "0.95rem"
                            }}
                        >
                            <ArrowLeft size={18} /> Back to Upload
                        </button>

                        <ManualEntryForm
                            onConfirm={handleManualConfirm}
                            onCancel={() => setStep("SELECT")}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
