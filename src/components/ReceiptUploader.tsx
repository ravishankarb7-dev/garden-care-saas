"use client";

import { useState } from "react";
import { Upload, Loader2, FileImage } from "lucide-react";
import { mockScanReceipt, ScannedReceiptData } from "@/lib/ocr";

interface ReceiptUploaderProps {
    onScanComplete: (data: ScannedReceiptData) => void;
}

export default function ReceiptUploader({ onScanComplete }: ReceiptUploaderProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (JPG, PNG).");
            return;
        }

        setIsScanning(true);
        try {
            const data = await mockScanReceipt(file);
            onScanComplete(data);
        } catch (error) {
            console.error("Scanning failed", error);
            alert("Failed to scan receipt. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${dragActive ? 'var(--color-primary, #10B981)' : '#E5E7EB'}`,
                borderRadius: "1rem",
                padding: "3rem",
                textAlign: "center",
                backgroundColor: dragActive ? 'rgba(16, 185, 129, 0.05)' : 'white',
                transition: "all 0.2s",
                cursor: "pointer",
                position: "relative"
            }}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                disabled={isScanning}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: isScanning ? "wait" : "pointer"
                }}
            />

            <div style={{ pointerEvents: "none" }}> {/* Content container */}
                {isScanning ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--color-primary, #059669)" />
                        <p style={{ color: "var(--color-text-muted, #6B7280)" }}>Scanning receipt...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            backgroundColor: "#F3F4F6",
                            padding: "1rem",
                            borderRadius: "50%"
                        }}>
                            <Upload size={32} color="#4B5563" />
                        </div>
                        <div>
                            <p style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                                Click or drag receipt here
                            </p>
                            <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                                JPG, PNG up to 10MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
