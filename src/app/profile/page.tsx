"use client";

import { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import { getOrCreateDeviceId, saveDeviceId, isValidGardenCode } from "@/lib/device";
import { getUserStats } from "@/lib/queries"; // Keeping for device ID check, though stats unused
import { ShieldCheck, Calendar, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function EstablishmentOverview() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        async function load() {
            let id = searchParams.get('id');
            if (id && isValidGardenCode(id)) {
                saveDeviceId(id);
            } else {
                id = getOrCreateDeviceId();
            }

            // Fetch Sessions directly
            const sessionsData = await import("@/lib/queries").then(m => m.getCareSessionsByDeviceId(id || "guest"));

            if (sessionsData) {
                setSessions(sessionsData);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-zinc-900 mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-zinc-700" size={32} />
                        Planting Phase Overview
                    </h1>
                    <p className="text-zinc-500">Guiding safe care during the first 28 days.</p>
                </div>

                {sessions.length === 0 ? (
                    <Card className="p-8 text-center border-zinc-200 bg-white">
                        <h2 className="text-lg font-bold text-zinc-900 mb-2">No Active Plants</h2>
                        <Link href="/intake" className="text-sm text-emerald-600 font-bold underline hover:text-emerald-800">
                            Add a plant to start tracking
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sessions.map((session) => {
                            // Data Parsing: Prioritize SKU Name over Category
                            const plantName = session.store_sku?.display_name || session.care_category?.label || "Unknown Plant";
                            const potSize = session.pot_size || session.store_sku?.size || ""; // e.g. "3G"
                            const plantedAt = session.planted_at;

                            // Day Calculation (Robust Logic)
                            let dayCount = 0;
                            let timelineUnavailable = !plantedAt;

                            if (plantedAt) {
                                // planted_at from DB is typically ISO.
                                const pStr = new Date(plantedAt).toISOString().split('T')[0];
                                const [py, pm, pd] = pStr.split('-').map(Number);
                                const startDate = new Date(py, pm - 1, pd);
                                startDate.setHours(0, 0, 0, 0);

                                const now = new Date();
                                now.setHours(0, 0, 0, 0);

                                const diffTime = now.getTime() - startDate.getTime();
                                const rawDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                                // Clamp future dates (negative) and 0 to 1 (Just planted)
                                dayCount = Math.max(1, rawDays + 1);
                            }

                            // Establishment Complete?
                            const isComplete = dayCount > 28;

                            // Status Overlay Logic (Simulation)
                            // In real app, we'd check care logs. 
                            const showIntervention = false; // Placeholder
                            const showWeatherHold = false; // Placeholder

                            return (
                                <Card key={session.id} className="p-6 border-zinc-200 bg-white shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                                                {plantName}
                                                {potSize && <span className="text-xs font-normal text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">{potSize}</span>}
                                            </h3>
                                            <div className="flex gap-2 text-xs mt-1">
                                                {timelineUnavailable ? (
                                                    <span className="text-zinc-400 italic">Planting time unavailable.</span>
                                                ) : isComplete ? (
                                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                        <ShieldCheck size={12} /> Planting Phase Complete
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-500">
                                                        Day <span className="font-bold text-zinc-900">{dayCount}</span> of 28
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/my-plants/${session.id}`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">View Care</Button>
                                        </Link>
                                    </div>

                                    {/* Timeline Track */}
                                    {!timelineUnavailable && !isComplete && (
                                        <div className="relative mt-2">
                                            {/* Bar Container */}
                                            <div className="h-4 w-full bg-zinc-100 rounded-full flex overflow-hidden relative">
                                                {/* Band 1: High Risk (Days 1-7) - 25% of 28 */}
                                                <div className="h-full bg-red-100 w-[25%] border-r border-white/50 relative group">
                                                    <span className="absolute bottom-full mb-1 left-2 text-[10px] text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">High Risk (Wk 1)</span>
                                                </div>
                                                {/* Band 2: Moderate Risk (Days 8-14) - 25% */}
                                                <div className="h-full bg-amber-100 w-[25%] border-r border-white/50 relative group">
                                                    <span className="absolute bottom-full mb-1 left-2 text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Moderate Risk (Wk 2)</span>
                                                </div>
                                                {/* Band 3: Stabilizing (Days 15-28) - 50% */}
                                                <div className="h-full bg-emerald-50 w-[50%] relative group">
                                                    <span className="absolute bottom-full mb-1 left-2 text-[10px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Stabilizing</span>
                                                </div>
                                            </div>

                                            {/* Position Marker */}
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-zinc-900 rounded-full shadow-sm transition-all duration-1000"
                                                style={{
                                                    left: `${Math.min(100, Math.max(0, ((dayCount - 1) / 28) * 100))}%`,
                                                    marginLeft: '-8px' // Center the dot
                                                }}
                                            />

                                            {/* Status Labels Overlay */}
                                            <div className="absolute top-6 left-0 flex gap-2">
                                                {showIntervention && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <AlertTriangle size={10} /> Intervention Required
                                                    </span>
                                                )}
                                                {showWeatherHold && (
                                                    <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                        Weather Hold
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading Overview...</div>}>
            <EstablishmentOverview />
        </Suspense>
    );
}
