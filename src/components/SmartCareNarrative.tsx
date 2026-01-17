"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartCareNarrativeProps {
    plantId: string;
    zipCode: string;
    className?: string;
}

export default function SmartCareNarrative({ plantId, zipCode, className }: SmartCareNarrativeProps) {
    const [narrative, setNarrative] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchNarrative() {
            try {
                // Short delay to not block initial page paint and stagger requests slightly
                await new Promise(r => setTimeout(r, Math.random() * 1000 + 500));

                const res = await fetch('/api/agent/care', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plantId, zip: zipCode })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (mounted) setNarrative(data.narrative);
                }
            } catch (err) {
                console.error("Failed to load smart care", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (zipCode && plantId) {
            fetchNarrative();
        } else {
            setLoading(false);
        }

        return () => { mounted = false; };
    }, [plantId, zipCode]);

    if (!zipCode) return null; // Can't generate without location context

    return (
        <div className={cn("mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg relative overflow-hidden", className)}>
            <div className="flex items-start gap-3">
                <div className="mt-1 min-w-[20px]">
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    )}
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                        Groundskeeper Note
                        {/* {loading && <span className="opacity-50 font-normal normal-case animate-pulse">- Analyzing...</span>} */}
                    </h4>
                    <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                        {loading
                            ? "Consulting the care guides and checking the clouds..."
                            : narrative || "Nature is quiet today. Stick to the basics."}
                    </p>
                </div>
            </div>

            {/* Decorative background element */}
            <Sprout className="absolute -bottom-4 -right-4 w-16 h-16 text-emerald-100/50 -rotate-12 pointer-events-none" />
        </div>
    );
}
