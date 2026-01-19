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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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
            const { createCareSessions, getCareSessionsByDeviceId } = await import("@/lib/queries");

            // Check for Zip Logic (New Garden Case)
            let targetDeviceId = deviceId;
            const existingSessions = await getCareSessionsByDeviceId(deviceId);

            if (existingSessions.length > 0) {
                const existingZip = existingSessions[0].zip;
                // If garden has a zip, and new payload has a different zip -> New Garden
                if (existingZip && payload.zip && existingZip !== payload.zip) {
                    const { findGardenIdByZip } = await import("@/lib/device");
                    const reusableId = findGardenIdByZip(payload.zip);

                    if (reusableId) {
                        // Found existing garden for this zip
                        console.log(`Found existing garden ${reusableId} for zip ${payload.zip}`);
                        targetDeviceId = reusableId;
                        saveDeviceId(reusableId);
                        setDeviceId(reusableId);
                    } else {
                        const newCode = `GARDEN-${Math.floor(1000 + Math.random() * 9000)}`;
                        if (confirm(`You are adding plants for a new location (${payload.zip}). Create a new Garden (${newCode})?`)) {
                            targetDeviceId = newCode;
                            saveDeviceId(newCode); // Switch context
                            setDeviceId(newCode);
                        } else {
                            // User chose to keep in same garden, effectively overwriting context if we allow mixed zips
                            // But for now we just use the old ID.
                        }
                    }
                }
            }

            // 1. Generate receipt ID (Scan based)
            const receiptId = `SCAN-${Date.now().toString().slice(-6)}`;

            // 2. Persist to DB
            const success = await createCareSessions(receiptId, payload.selectedPlants, payload.date || new Date().toISOString(), payload.zip, targetDeviceId);

            if (!success) {
                alert("Failed to save scanned garden. Please try again.");
                return;
            }

            // 3. Save to Local Storage
            const existingReceipts = JSON.parse(localStorage.getItem("my_receipts") || "[]");
            localStorage.setItem("my_receipts", JSON.stringify([...existingReceipts, receiptId]));

            // Add to history with Zip label
            const { saveGardenToHistory } = await import("@/lib/device");
            saveGardenToHistory(targetDeviceId, `Zip ${payload.zip}`);

            alert(`Success! Created care schedule for ${payload.selectedPlants.length} plants in Garden ${targetDeviceId}.`);
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

            console.log("Checking duplicates/location for device:", deviceId);
            const existingSessions = await getCareSessionsByDeviceId(deviceId);

            // Check duplication
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

            // Check Zip / New Garden Logic
            let targetDeviceId = deviceId;
            if (existingSessions.length > 0) {
                const existingZip = existingSessions[0].zip;
                if (existingZip && payload.zip && existingZip !== payload.zip) {
                    // Generate a standardized garden code
                    const { generateGardenCode, findGardenIdByZip } = await import("@/lib/device");

                    const reusableId = findGardenIdByZip(payload.zip);

                    if (reusableId) {
                        console.log(`Found existing garden ${reusableId} for zip ${payload.zip}`);
                        targetDeviceId = reusableId;
                        saveDeviceId(reusableId);
                        setDeviceId(reusableId);
                    } else {
                        const newCode = generateGardenCode();

                        if (confirm(`This zip code (${payload.zip}) is different from your current garden (${existingZip}).\n\nCreate a new Garden Code (${newCode})?`)) {
                            targetDeviceId = newCode;
                            saveDeviceId(newCode);
                            setDeviceId(newCode);
                        }
                    }
                }
            }

            // Generate a unique transaction ID
            const transactionId = `MANUAL-${Date.now().toString().slice(-6)}`;
            console.log("Creating sessions with transactionId:", transactionId);

            const success = await createCareSessions(transactionId, payload.plants, payload.date, payload.zip, targetDeviceId);

            if (!success) {
                console.error("createCareSessions returned false");
                setStatus("Error: Database save failed.");
                alert("Failed to save your garden. Please try again.");
                return;
            }

            console.log("Success. Redirecting to dashboard.");
            setStatus("Success! Redirecting...");

            // Add to history with Zip label
            const { saveGardenToHistory } = await import("@/lib/device");
            saveGardenToHistory(targetDeviceId, `Zip ${payload.zip}`);

            alert(`Success! Added ${payload.plants.length} plants to Garden ${targetDeviceId}.`);
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

            // Add to history
            const { saveGardenToHistory } = await import("@/lib/device");
            saveGardenToHistory(normalizedCode, `Garden ${normalizedCode}`);

            router.push("/dashboard");
        } catch (err) {
            console.error("Lookup failed:", err);
            alert("Failed to lookup garden code.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Header title="New Plant Care" />
            {/* Debug Info */}
            {status && <div className="bg-blue-100 text-blue-800 text-center py-2 font-bold">{status}</div>}

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
                <div className="w-full max-w-2xl flex flex-col gap-8">
                    {step === "SELECT" && (
                        <div className="flex flex-col gap-8">
                            {/* 1. Scan / Upload Section */}
                            <Card className="overflow-hidden border-zinc-200 shadow-sm">
                                <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        Scan your receipt
                                    </CardTitle>
                                    <CardDescription>
                                        Upload a photo of your nursery receipt to auto-import plants.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ReceiptUploader onScanComplete={handleScanComplete} />
                                </CardContent>
                            </Card>

                            {/* 2. Manual Entry Option */}
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-500 hover:text-primary hover:bg-zinc-50 font-medium"
                                    onClick={() => setStep("MANUAL")}
                                >
                                    <Keyboard className="mr-2 h-4 w-4" />
                                    Or enter plants manually
                                </Button>
                            </div>

                            {/* 3. Receipt Lookup Section */}
                            <div className="pt-8">
                                <ReceiptLookup onLookup={handleLookup} />
                            </div>
                        </div>
                    )}

                    {step === "REVIEW" && scannedData && (
                        <div className="w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("SELECT")}
                                className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
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
                                className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
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
