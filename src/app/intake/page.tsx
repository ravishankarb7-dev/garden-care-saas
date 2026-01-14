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
import { Button } from "@/components/ui/Button";

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
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-cream)" }}>
            <Header />

            <main className="max-w-[800px] mx-auto px-4 py-8 md:py-16">
                {step === "SELECT" && (
                    <>
                        <div className="text-center mb-8 md:mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold font-serif text-green-900 mb-4 tracking-tight">
                                New Plant Care
                            </h1>
                            <p className="text-lg text-gray-500 max-w-[540px] mx-auto leading-relaxed">
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
                                    color: "var(--color-green-700)", fontWeight: 600,
                                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                    padding: "0.75rem 1.25rem", borderRadius: "8px",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-sage-100)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <Keyboard size={20} />
                                <span style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}>Don't have a receipt? Enter plants manually</span>
                            </button>
                        </div>

                        <div style={{
                            borderTop: "1px solid var(--color-sage-100)",
                            paddingTop: "3rem",
                            marginTop: "3rem"
                        }}>
                            <ReceiptLookup onLookup={handleLookup} />
                        </div>
                    </>
                )}

                {step === "REVIEW" && scannedData && (
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => setStep("SELECT")}
                            className="mb-6 pl-0 hover:bg-transparent hover:text-green-900"
                        >
                            <ArrowLeft size={18} className="mr-2" /> Back to Upload
                        </Button>

                        <ReceiptAnalysisForm
                            initialData={scannedData}
                            onConfirm={handleConfirm}
                            onCancel={() => setStep("SELECT")}
                        />
                    </div>
                )}

                {step === "MANUAL" && (
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => setStep("SELECT")}
                            className="mb-8 pl-0 hover:bg-transparent hover:text-green-900"
                        >
                            <ArrowLeft size={18} className="mr-2" /> Back to Upload
                        </Button>

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

