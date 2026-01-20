"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareCheckInProps {
    sessionId: string;
    action: string;
    date: string;
}

export default function CareCheckIn({ sessionId, action, date }: CareCheckInProps) {
    // State for granular tracking
    const [moisture, setMoisture] = useState<'WET' | 'MOIST' | 'DRY' | null>(null);
    const [pest, setPest] = useState(false);

    // Restored missing state
    const [status, setStatus] = useState<'THRIVING' | 'CONCERN' | 'CRITICAL' | null>(null);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Initial Fetch (Client-side mainly since it's granular)
    useEffect(() => {
        let mounted = true;
        import("@/lib/queries").then(async ({ getCareLogs }) => {
            const logs = await getCareLogs(sessionId);
            const entry = logs.find((l: any) => l.action_type === action && l.log_date === date);
            if (entry && mounted) {
                setStatus(entry.status);
                setNote(entry.note || "");
                setMoisture(entry.soil_moisture || null);
                setPest(entry.pest_detected || false);
                setSaved(true);
            }
        });
        return () => { mounted = false; };
    }, [sessionId, action, date]);

    const handleSave = async (
        selectedStatus?: 'THRIVING' | 'CONCERN' | 'CRITICAL',
        newMoisture?: 'WET' | 'MOIST' | 'DRY' | null,
        newPest?: boolean
    ) => {
        // Optimistic updates if specific params provided, else use state
        const s = selectedStatus !== undefined ? selectedStatus : status;
        const m = newMoisture !== undefined ? newMoisture : moisture;
        const p = newPest !== undefined ? newPest : pest;

        // Update local state immediately for UI response
        if (selectedStatus) setStatus(selectedStatus);
        if (newMoisture !== undefined) setMoisture(newMoisture);
        if (newPest !== undefined) setPest(newPest);

        // Require at least a status to save (or maybe note is enough? Keeping status as trigger for now)
        if (!s) return;

        setLoading(true);
        try {
            const { logCareAction } = await import("@/lib/queries");
            // Pass m and p explicitly (convert null to undefined)
            const success = await logCareAction(sessionId, action, date, s, note, m ?? undefined, p ?? undefined);
            if (success) {
                setSaved(true);
            }
        } catch (err) {
            console.error("Failed to save check-in", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* 1. Soil Moisture (Diagnostic) */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-16">Soil</span>
                <div className="flex bg-zinc-100 rounded-lg p-1">
                    {(['DRY', 'MOIST', 'WET'] as const).map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSave(undefined, opt, undefined)}
                            className={cn(
                                "text-xs font-medium px-3 py-1 rounded-md transition-all",
                                moisture === opt
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Pest Toggle (Diagnostic) */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-16">Pests</span>
                <button
                    onClick={() => handleSave(undefined, undefined, !pest)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all w-fit",
                        pest
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    )}
                >
                    <AlertCircle size={14} className={pest ? "fill-current" : ""} />
                    {pest ? "Detected" : "None"}
                </button>
            </div>

            {/* 3. Status Selector (Overall Health) */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-16">Status</span>

                <button
                    onClick={() => handleSave('THRIVING')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        status === 'THRIVING'
                            ? "bg-green-100 text-green-700 border-green-200 ring-1 ring-green-300"
                            : "bg-white text-zinc-500 border-zinc-200 hover:bg-green-50"
                    )}
                >
                    🌿 All Good
                </button>

                <button
                    onClick={() => handleSave('CONCERN')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        status === 'CONCERN'
                            ? "bg-amber-100 text-amber-700 border-amber-200 ring-1 ring-amber-300"
                            : "bg-white text-zinc-500 border-zinc-200 hover:bg-amber-50"
                    )}
                    title="Mild symptoms: Monitor for changes"
                >
                    🍂 Watch
                </button>

                <button
                    onClick={() => handleSave('CRITICAL')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        status === 'CRITICAL'
                            ? "bg-red-100 text-red-700 border-red-200 ring-1 ring-red-300"
                            : "bg-white text-zinc-500 border-zinc-200 hover:bg-red-50"
                    )}
                    title="Severe symptoms: Immediate action needed"
                >
                    🥀 Act
                </button>
            </div>

            {/* Note Field (Visible if interaction started or saved) */}
            <div className="relative">
                <textarea
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                        setSaved(false); // Mark dirty
                    }}
                    onBlur={() => status && handleSave()} // Auto-save on blur if status exists
                    placeholder="Notes: Strong new growth, wilting leaves, pests..."
                    className="w-full text-sm p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all h-20 placeholder:text-zinc-400"
                />
                {!saved && status && !loading && (
                    <span className="absolute bottom-2 right-2 text-[10px] text-amber-500 font-medium animate-pulse">
                        Unsaved
                    </span>
                )}
                {saved && (
                    <span className="absolute bottom-2 right-2 text-[10px] text-green-500 font-medium flex items-center gap-1">
                        <Check size={10} /> Saved
                    </span>
                )}
            </div>
        </div>
    );
}
