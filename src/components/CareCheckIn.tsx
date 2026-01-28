"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareCheckInProps {
    sessionId: string;
    action: string;
    date: string;
    plantedAt?: string; // For context
    currentWeather?: string; // For context
    disabled?: boolean;
}

export default function CareCheckIn({ sessionId, action, date, plantedAt, currentWeather, disabled }: CareCheckInProps) {
    // State for granular tracking
    const [moisture, setMoisture] = useState<'WET' | 'MOIST' | 'DRY' | null>(null);
    const [pest, setPest] = useState(false);

    // Confirmation State
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'THRIVING' | 'CONCERN' | 'CRITICAL' | null>(null);

    // Main State
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

        // INTERCEPTION: Safety Gate for Critical Status
        // Only trigger if selecting CRITICAL and wasn't already CRITICAL
        if (selectedStatus === 'CRITICAL' && status !== 'CRITICAL') {
            setPendingStatus('CRITICAL');
            setShowConfirmation(true);
            // Revert optimistic update for now (visually) until confirmed? 
            // Or keep it but don't save? UX choice: Keep it pending.
            return; // STOP. Wait for confirmation.
        }

        // Require at least a status to save
        if (!s) return;

        setLoading(true);
        try {
            const { logCareAction } = await import("@/lib/queries");
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

    const confirmIntervention = () => {
        setShowConfirmation(false);
        if (pendingStatus) {
            setStatus(pendingStatus);
            setPendingStatus(null);

            // Proceed to save
            setLoading(true);
            import("@/lib/queries").then(async ({ logCareAction }) => {
                const success = await logCareAction(sessionId, action, date, 'CRITICAL', note, moisture ?? undefined, pest ?? undefined);
                if (success) setSaved(true);
                setLoading(false);
            });
        }
    };

    const cancelIntervention = () => {
        setShowConfirmation(false);
        setPendingStatus(null);
        // Revert status to previous if needed, or just don't save.
        // Ideally we revert the optimistic 'status' update if we did one. 
        // In handleSave above, we did `if (selectedStatus) setStatus(selectedStatus)`.
        // So we need to unset it or just leave it as is?
        // Let's reset status to null or whatever current DB state was if we want to be strict.
        // For now, let's just not save. But UI might show 'Intervention Required' selected.
        // Better UX: toggle it off.
        setStatus(null); // Or revert to previous. Complex without history. 
        // Resetting to null (unchecked) is safe default for cancel.
    };

    // Calculate Day N for context
    const dayN = plantedAt && date
        ? (() => {
            // Normalize Planted Date (ignore time/timezone)
            const plantedISO = plantedAt.split('T')[0];
            const [py, pm, pd] = plantedISO.split('-').map(Number);
            const start = new Date(py, pm - 1, pd);
            start.setHours(0, 0, 0, 0);

            // Normalize Task Date
            const [ty, tm, td] = date.split('-').map(Number);
            const target = new Date(ty, tm - 1, td);
            target.setHours(0, 0, 0, 0);

            const diffTime = target.getTime() - start.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(1, diffDays);
        })()
        : "?";

    return (
        <div className={cn("flex flex-col gap-4", disabled && "opacity-50 pointer-events-none grayscale")}>
            {/* 1. Soil Moisture (Diagnostic) */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-16">Soil</span>
                <div className="flex bg-zinc-100 rounded-lg p-1">
                    {(['DRY', 'MOIST', 'WET'] as const).map((opt) => (
                        <button
                            key={opt}
                            disabled={disabled}
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
                    disabled={disabled}
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

            {/* 3. Status Selector */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-50">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-16">Status</span>

                    <button
                        disabled={disabled}
                        onClick={() => handleSave('THRIVING')}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                            status === 'THRIVING'
                                ? "bg-green-100 text-green-700 border-green-200 ring-1 ring-green-300"
                                : "bg-white text-zinc-500 border-zinc-200 hover:bg-green-50"
                        )}
                    >
                        🌿 Stable
                    </button>

                    <button
                        disabled={disabled}
                        onClick={() => handleSave('CONCERN')}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                            status === 'CONCERN'
                                ? "bg-amber-100 text-amber-700 border-amber-200 ring-1 ring-amber-300"
                                : "bg-white text-zinc-500 border-zinc-200 hover:bg-amber-50"
                        )}
                        title="Mild symptoms: Monitor for changes"
                    >
                        🍂 Monitor
                    </button>

                    <button
                        disabled={disabled}
                        onClick={() => handleSave('CRITICAL')}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                            status === 'CRITICAL'
                                ? "bg-red-100 text-red-700 border-red-200 ring-1 ring-red-300"
                                : "bg-white text-zinc-500 border-zinc-200 hover:bg-red-50"
                        )}
                        title="Severe symptoms: Immediate action needed"
                    >
                        🥀 Intervention Required
                    </button>
                </div>
                {status === 'CRITICAL' && (
                    <p className="text-[10px] text-red-600 font-medium italic pl-20">Select only if conditions match the guidance above.</p>
                )}
            </div>

            {/* Note Field */}
            <div className="relative">
                <textarea
                    disabled={disabled}
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                        setSaved(false); // Mark dirty
                    }}
                    onBlur={() => status && handleSave()}
                    placeholder={disabled ? "Future date - editing disabled" : "Optional: record observations only if something looks unusual."}
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

            {/* CONFIRMATION OVERLAY (Safety Gate) */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl border border-zinc-200 p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-full">
                                <AlertCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-zinc-900">Are you sure?</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Intervening under inappropriate conditions is a common cause of early plant failure.
                                    Proceed only if weather, soil moisture, and plant condition together indicate intervention is necessary.
                                </p>
                            </div>
                        </div>

                        {/* Context Summary */}
                        <div className="bg-zinc-50 rounded-lg p-3 text-xs font-semibold text-zinc-500 flex justify-between items-center border border-zinc-100">
                            <span>Day {dayN} of 28</span>
                            <span>{currentWeather || "Normal Conditions"}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={cancelIntervention}
                                className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                            >
                                Return to Monitoring
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmIntervention}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm Intervention
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
