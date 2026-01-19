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
    const [status, setStatus] = useState<'THRIVING' | 'CONCERN' | 'CRITICAL' | null>(null);
    const [note, setNote] = useState("");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial Fetch (Client-side mainly since it's granular)
    useEffect(() => {
        let mounted = true;
        import("@/lib/queries").then(async ({ getCareLogs }) => {
            const logs = await getCareLogs(sessionId);
            const entry = logs.find((l: any) => l.action_type === action && l.log_date === date);
            if (entry && mounted) {
                setStatus(entry.status);
                setNote(entry.note || "");
                setSaved(true);
            }
        });
        return () => { mounted = false; };
    }, [sessionId, action, date]);

    const handleSave = async (selectedStatus: 'THRIVING' | 'CONCERN' | 'CRITICAL') => {
        setStatus(selectedStatus);
        setLoading(true);
        try {
            const { logCareAction } = await import("@/lib/queries");
            const success = await logCareAction(sessionId, action, date, selectedStatus, note);
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
        <div className="flex flex-col gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">Check-in:</span>

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
                    onBlur={() => status && handleSave(status)} // Auto-save on blur if status exists
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
