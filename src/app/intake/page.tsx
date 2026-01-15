"use client";

import { useState, useEffect } from "react";
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
import { getOrCreateDeviceId, saveDeviceId } from "@/lib/device";

export default function IntakePage() {
    const router = useRouter();
    const [step, setStep] = useState<"SELECT" | "REVIEW" | "MANUAL">("SELECT");
    const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);
    const [deviceId, setDeviceId] = useState("");

    // Initialize Device ID on client
    useEffect(() => {
        setDeviceId(getOrCreateDeviceId());
    }, []);

    const handleScanComplete = (data: ScannedReceiptData) => {
        setScannedData(data);
        setStep("REVIEW");
    };

    const handleConfirm = async (payload: FinalReceiptPayload) => {
        try {
            // Import dynamically
            const { createCareSessions, getCareSessionsByReceipt } = await import("@/lib/queries");

            // 1. Generate receipt ID (Scan based)
            const receiptId = `SCAN-${Date.now().toString().slice(-6)}`;

            // 2. Persist to DB
            // We use the payload.date for planting date
            // We assume today as planting date if not specified, but payload usually has it
            const success = await createCareSessions(receiptId, payload.selectedPlants, payload.date || new Date().toISOString(), payload.zip, deviceId);

            if (!success) {
                alert("Failed to save scanned garden. Please try again.");
                return;
            }

            // 3. Save to Local Storage
            const existingReceipts = JSON.parse(localStorage.getItem("my_receipts") || "[]");
            localStorage.setItem("my_receipts", JSON.stringify([...existingReceipts, receiptId]));

            alert(`Success! Created care schedule for ${payload.selectedPlants.length} plants under Receipt ${receiptId}.`);
            router.push("/dashboard");

        } catch (err) {
            console.error("Scan save failed:", err);
            alert("An error occurred while saving your scanned plants.");
        }
    };

    const [status, setStatus] = useState("");

    const handleManualConfirm = async (payload: { plants: Plant[], date: string, zip: string }) => {
        setStatus("Saving...");
        console.log("Starting Manual Confirm with payload:", payload);
        try {
            // Import dynamically to avoid build cycle issues
            const { createCareSessions, getCareSessionsByDeviceId } = await import("@/lib/queries");

            console.log("Checking duplicates for device:", deviceId);
            const existingSessions = await getCareSessionsByDeviceId(deviceId);

            const isDuplicate = payload.plants.some(newPlant => {
                return existingSessions.some(existing => {
                    const samePlant = existing.care_category_id === newPlant.uuid;
                    // Compare simply by YYYY-MM-DD
                    const sameDate = new Date(existing.planted_at).toISOString().split('T')[0] === new Date(payload.date).toISOString().split('T')[0];
                    const sameZip = existing.zip === payload.zip;
                    return samePlant && sameDate && sameZip;
                });
            });

            if (isDuplicate) {
                console.warn("Duplicate plant detected.");
                setStatus("Error: Duplicate plant found (same date/zip).");
                alert("You already have this plant in your garden with the same planting date and zip code.");
                return;
            }

            // Generate a unique transaction ID (mostly for logging or future use, though DB uses deviceId)
            const transactionId = `MANUAL-${Date.now().toString().slice(-6)}`;
            console.log("Creating sessions with transactionId:", transactionId);

            const success = await createCareSessions(transactionId, payload.plants, payload.date, payload.zip, deviceId);

            if (!success) {
                console.error("createCareSessions returned false");
                setStatus("Error: Database save failed.");
                alert("Failed to save your garden. Please try again.");
                return;
            }

            console.log("Success. Redirecting to dashboard.");
            setStatus("Success! Redirecting...");
            alert(`Success! Added ${payload.plants.length} plants to your garden.`);
            router.push("/dashboard");
        } catch (err) {
            console.error("Manual entry failed:", err);
            setStatus("Error: " + (err as Error).message);
            alert("An unexpected error occurred: " + (err as Error).message);
        }
    };

    const handleLookup = async (code: string) => {
        try {
            const { getCareSessionsByDeviceId } = await import("@/lib/queries");

            const normalizedCode = code.toUpperCase().trim();

            // Check if it exists
            const sessions = await getCareSessionsByDeviceId(normalizedCode);

            if (!sessions || sessions.length === 0) {
                if (!confirm(`No garden found for Code: ${normalizedCode}. Do you want to switch to this empty garden anyway?`)) {
                    return;
                }
            } else {
                alert(`Found ${sessions.length} plants! Switching your device to Garden Code: ${normalizedCode}`);
            }

            // Save to local storage as THE device ID
            saveDeviceId(normalizedCode);
            setDeviceId(normalizedCode);

            router.push("/dashboard");
        } catch (err) {
            console.error("Lookup failed:", err);
            alert("Failed to lookup garden code.");
        }
    };

    return (
        <div className="min-h-screen bg-bg-cream flex flex-col">
            <Header title="New Plant Care" />
            {/* Debug Info */}
            <div className="text-xs text-gray-400 text-center py-1">Device ID: {deviceId || "(empty)"}</div>
            {status && <div className="bg-blue-100 text-blue-800 text-center py-2 font-bold">{status}</div>}

            <main className="flex-1 w-full flex flex-col items-center py-8 px-4">
                <div className="w-full max-w-3xl flex flex-col items-center mt-4">
                    {step === "SELECT" && (
                        <div className="flex flex-col w-full gap-24">
                            {/* 1. Receipt Uploader Section (Top) */}
                            <section className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                                <ReceiptUploader onScanComplete={handleScanComplete} />
                            </section>

                            {/* 2. Manual Entry Button (Middle) */}
                            <section className="flex flex-col items-center justify-center">
                                <button
                                    onClick={() => setStep("MANUAL")}
                                    className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white border-2 border-green-900 text-green-900 text-lg font-bold hover:bg-green-50 transition-all shadow-sm"
                                >
                                    <Keyboard size={24} />
                                    <span>Enter plants manually</span>
                                </button>
                            </section>

                            {/* 3. Receipt Lookup Section (Bottom) */}
                            <section className="w-full">
                                <div className="max-w-md mx-auto">
                                    <ReceiptLookup onLookup={handleLookup} />
                                </div>
                            </section>
                        </div>
                    )}

                    {step === "REVIEW" && scannedData && (
                        <div className="w-full">
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
                        <div className="w-full">
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
                </div>
            </main>
        </div>
    );
}
