"use client";

import { useState, useEffect } from "react";
import { CloudSun, Snowflake, ThermometerSun, AlertTriangle, Sprout, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface PendingPlantingCardProps {
    plantId: string;
    plantName: string;
    zip: string;
    onMarkPlanted: () => void;
}

export default function PendingPlantingCard({ plantId, plantName, zip, onMarkPlanted }: PendingPlantingCardProps) {
    const [status, setStatus] = useState<'LOADING' | 'SAFE' | 'UNSAFE'>('LOADING');
    const [message, setMessage] = useState("");
    const [weatherData, setWeatherData] = useState<any>(null);

    useEffect(() => {
        async function checkWeather() {
            try {
                // Use the robust Agent API to ensure consistency with Intake advice (e.g. Ice Storms)
                const res = await fetch('/api/agent/plant-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plants: [{ name: plantName }], // Check for this specific plant
                        zip
                    })
                });

                if (!res.ok) throw new Error("Weather check failed");
                const data = await res.json();

                if (data.safe) {
                    setStatus('SAFE');
                } else {
                    setStatus('UNSAFE');
                }
                setMessage(data.message);

            } catch (err) {
                console.error(err);
                setStatus('SAFE'); // Default to allowing if check fails (optimistic)
                setMessage("Could not verify detailed forecast. Proceed with caution.");
            }
        }
        if (zip) checkWeather();
    }, [zip, plantName]);

    return (
        <Card className="bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                        <Sprout size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-serif font-bold text-zinc-900 truncate pr-6">
                            {plantName}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Awaiting Planting
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            {status === 'LOADING' && (
                                <span className="text-zinc-400 text-xs animate-pulse">Checking weather...</span>
                            )}
                            {status === 'SAFE' && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                    <Check size={14} /> Safe to Plant
                                </div>
                            )}
                            {status === 'UNSAFE' && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded">
                                    <AlertTriangle size={14} /> Wait
                                </div>
                            )}
                        </div>

                        {message && (
                            <p className={cn(
                                "text-xs mb-4 leading-relaxed",
                                status === 'SAFE' ? "text-emerald-800" : "text-red-800"
                            )}>
                                {message}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <Button
                                onClick={onMarkPlanted}
                                size="sm"
                                variant={status === 'UNSAFE' ? "outline" : "default"}
                                className={cn(
                                    "text-xs h-8",
                                    status === 'UNSAFE' && "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                )}
                            >
                                {status === 'UNSAFE' ? "Override & Plant" : "Mark Planted"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
