"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Sprout, Droplets, Sun, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartCareNarrativeProps {
    plantId: string;
    plantName: string;
    zipCode: string;
    className?: string;
    onRiskChange?: (shouldDisable: boolean) => void;
    isPlanted?: boolean;
    weatherContext?: string;
}

export default function SmartCareNarrative({ plantId, plantName, zipCode, className, onRiskChange, isPlanted, weatherContext }: SmartCareNarrativeProps) {
    const [narrative, setNarrative] = useState<string | null>(null);
    const [tips, setTips] = useState<{ water: string; light: string; fertilizer: string; } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchNarrative() {
            try {
                // CACHE CHECK: Do not regenerate if we have a fresh narrative for this plant/zip/condition
                // Key includes Weather Context if available to invalidate on weather shift, or just date/hour
                const cacheKey = `care_agent_${plantId}_${zipCode}_${new Date().toISOString().split('T')[0]}_v3`;
                const cached = sessionStorage.getItem(cacheKey);

                if (cached) {
                    const data = JSON.parse(cached);
                    console.log(`[SmartCare] Using cached narrative for ${plantId}`);
                    if (mounted) {
                        setNarrative(data.narrative);
                        setTips(data.tips || null);
                        if (onRiskChange) {
                            if (!isPlanted && data.action === 'POSTPONE') {
                                onRiskChange(true);
                            } else {
                                onRiskChange(false);
                            }
                        }
                        setLoading(false);
                        return;
                    }
                }

                // Short delay to not block initial page paint
                await new Promise(r => setTimeout(r, Math.random() * 500 + 200));

                const res = await fetch('/api/agent/care', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plantId, plantName, zip: zipCode, isPlanted, weatherContext })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (mounted) {
                        setNarrative(data.narrative);
                        setTips(data.tips || null);
                        // Cache the result
                        sessionStorage.setItem(cacheKey, JSON.stringify(data));

                        if (onRiskChange) {
                            if (!isPlanted && data.action === 'POSTPONE') {
                                onRiskChange(true);
                            } else {
                                onRiskChange(false);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load smart care", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (zipCode && plantId) {
            fetchNarrative();
        } else if (!zipCode) {
            setLoading(false);
        }

        return () => { mounted = false; };
    }, [plantId, zipCode, weatherContext]); // Re-run when context is ready

    if (!zipCode) return null; // Can't generate without location context

    return (
        <div className={cn("mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg relative overflow-hidden", className)}>
            <div className="flex items-start gap-3 mb-3">
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
                            ? "Analyzing environmental conditions..."
                            : narrative || "Conditions appear stable. Monitor before acting."}
                    </p>
                </div>
            </div>

            {/* Structured Tips */}
            {!loading && tips && (
                <div className="mt-3 pt-3 border-t border-emerald-100/50 flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-blue-50 p-1 rounded-md shrink-0">
                            <Droplets size={12} className="text-blue-500" />
                        </div>
                        <div className="text-xs text-emerald-900/90 leading-snug">
                            <span className="font-bold text-emerald-700 block mb-0.5">Water</span>
                            {tips.water}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-amber-50 p-1 rounded-md shrink-0">
                            <Sun size={12} className="text-amber-500" />
                        </div>
                        <div className="text-xs text-emerald-900/90 leading-snug">
                            <span className="font-bold text-emerald-700 block mb-0.5">Light</span>
                            {tips.light}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-green-50 p-1 rounded-md shrink-0">
                            <Leaf size={12} className="text-green-600" />
                        </div>
                        <div className="text-xs text-emerald-900/90 leading-snug">
                            <span className="font-bold text-emerald-700 block mb-0.5">Fertilizer</span>
                            {tips.fertilizer}
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative background element */}
            <Sprout className="absolute -bottom-4 -right-4 w-16 h-16 text-emerald-100/50 -rotate-12 pointer-events-none" />
        </div>
    );
}
