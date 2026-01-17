"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { getCareSessionsByReceipt, getPlants } from "@/lib/queries";
import { Plant, CareTask, TroubleshootingItem } from "@/lib/types";
import { ArrowLeft, Droplets, Sun, Calendar, AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import SmartCareNarrative from "@/components/SmartCareNarrative";

interface PlantDetail {
    id: string;
    name: string;
    botanicalName: string;
    plantedAt: string;
    imageUrl?: string;
    careSchedule: CareTask[];
    troubleshooting: TroubleshootingItem[];
}

export default function MyPlantPage() {
    const params = useParams();
    const id = params?.id as string; // The session ID

    const [plant, setPlant] = useState<PlantDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!id) return;
            try {
                // Fetch specific session by ID
                const { data: session, error } = await supabase
                    .from('care_sessions')
                    .select(`
                        *,
                        care_category:care_categories(*),
                        store_sku:store_skus(*)
                    `)
                    .eq('id', id)
                    .single() as { data: any, error: any };

                if (error || !session) {
                    console.error("Session not found", error);
                    setLoading(false);
                    return;
                }

                const staticPlants = await getPlants();

                const categoryData = session.care_category;
                const skuData = session.store_sku;

                let matchedPlant = null;
                if (session.store_sku_id) {
                    matchedPlant = staticPlants.find(p => p.skuId === session.store_sku_id);
                }
                if (!matchedPlant) {
                    matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id && !p.skuId);
                }
                if (!matchedPlant) {
                    matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id);
                }

                const hydrated = {
                    id: session.id,
                    name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                    botanicalName: matchedPlant?.botanicalName || skuData?.sku,
                    plantedAt: new Date(session.planted_at).toLocaleDateString(),
                    imageUrl: matchedPlant?.imageUrl,
                    careSchedule: matchedPlant?.careSchedule || [],
                    troubleshooting: matchedPlant?.troubleshooting || []
                };

                setPlant(hydrated);
            } catch (err) {
                console.error("Error loading plant:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 font-sans">
                <Header />
                <main className="max-w-3xl mx-auto px-6 py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-zinc-200 border-t-primary rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    if (!plant) {
        return (
            <div className="min-h-screen bg-zinc-50 font-sans">
                <Header />
                <main className="max-w-3xl mx-auto px-6 py-12 text-center">
                    Plant not found.
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-8 font-medium text-sm">
                    <ArrowLeft size={16} />
                    Back to Garden
                </Link>

                <Card className="overflow-hidden border-zinc-200 shadow-sm mb-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row gap-8 p-8 border-b border-zinc-100">
                        <div className="w-32 h-32 rounded-2xl bg-zinc-100 flex-shrink-0 overflow-hidden shadow-inner">
                            {plant.imageUrl ? (
                                <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-2">{plant.name}</h1>
                            <p className="text-zinc-500 italic mb-4">{plant.botanicalName}</p>
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
                                <Calendar size={14} />
                                Planted on {plant.plantedAt}
                            </div>
                        </div>
                    </div>


                    {/* Care Schedule */}
                    <div className="p-8 bg-zinc-50/50">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">Groundskeeper Note</h2>
                            <SmartCareNarrative plantId={plant.id} zipCode="90210" />
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900">Nurture Notes</h2>

                            {/* Calendar Dropdown */}
                            <div className="relative group z-10">
                                <Button variant="outline" size="sm" className="bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Sync the Sprout
                                </Button>
                                {/* Hover Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 rounded-lg shadow-xl hidden group-hover:block p-1 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Choose Format
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!plant) return;
                                            import("@/lib/calendar").then(mod => {
                                                const allEvents = plant.careSchedule.map((task: any) => {
                                                    const pDate = new Date(plant.plantedAt);
                                                    const taskDate = new Date(pDate);
                                                    taskDate.setDate(pDate.getDate() + task.day);

                                                    return {
                                                        title: `${task.action} ${plant.name}`,
                                                        description: task.description,
                                                        start: taskDate,
                                                        location: "My Garden"
                                                    };
                                                });
                                                mod.downloadScheduleICS(allEvents, `${plant.name.replace(/\s+/g, '_')}_Full_Schedule.ics`);
                                            });
                                        }}
                                        className="w-full text-left px-3 py-3 hover:bg-zinc-50 rounded-md text-zinc-700 flex flex-col group/btn transition-colors"
                                    >
                                        <span className="font-semibold text-zinc-900 flex items-center justify-between">
                                            Download Full Custom Schedule
                                        </span>
                                        <span className="text-xs text-zinc-500 mt-1 leading-snug">
                                            Generates a .ics file with the <b>exact</b> {plant.careSchedule.length}-day custom plan.
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {plant.careSchedule.map((task: any, idx: number) => {
                                // Calculate the specific date for this task
                                const plantDate = new Date(plant.plantedAt);
                                const taskDate = new Date(plantDate);
                                taskDate.setDate(plantDate.getDate() + task.day);

                                // Check if it's today
                                const today = new Date();
                                const isToday = taskDate.getDate() === today.getDate() &&
                                    taskDate.getMonth() === today.getMonth() &&
                                    taskDate.getFullYear() === today.getFullYear();

                                const isWater = task.action === 'Water';
                                const dateString = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const displayDate = isToday ? "Today" : dateString;

                                return (
                                    <div key={idx} className={cn(
                                        "flex gap-4 p-5 rounded-xl border transition-all duration-200 items-start",
                                        isToday ? "bg-white border-green-500 shadow-md ring-1 ring-green-100" : "bg-white border-zinc-100 shadow-sm card-hover"
                                    )}>
                                        <div className={cn(
                                            "flex-shrink-0 w-16 text-center flex flex-col items-center justify-center p-2 rounded-lg",
                                            isToday ? "bg-green-50 text-green-700" : "bg-zinc-50 text-zinc-500"
                                        )}>
                                            <span className="text-sm font-bold leading-none">{displayDate}</span>
                                            {!isToday && <span className="text-[10px] uppercase font-medium mt-1">Day {task.day}</span>}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "inline-block w-1.5 h-1.5 rounded-full",
                                                    isWater ? "bg-blue-500" : "bg-green-500"
                                                )} />
                                                <h4 className="font-bold text-zinc-900">{task.action}</h4>
                                            </div>
                                            <p className="text-sm text-zinc-600 leading-relaxed">
                                                {isToday && isWater ? "Water today. " : ""}
                                                {task.description}
                                            </p>
                                        </div>

                                        {/* Status Icon/Accent (subtle right side visual) */}
                                        <div className={cn(
                                            "w-1 self-stretch rounded-full",
                                            isWater ? "bg-blue-100" : "bg-green-100"
                                        )} />
                                    </div>
                                );
                            })}
                            {plant.careSchedule.length === 0 && (
                                <p className="text-zinc-500 italic">No specific care schedule active for this plant type yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    {plant.troubleshooting.length > 0 && (
                        <div className="p-8 border-t border-zinc-100">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6">Troubleshooting</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plant.troubleshooting.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
                                        <div className="font-bold text-red-500 mb-1 flex items-center gap-2">
                                            <AlertTriangle size={16} />
                                            {item.symptom}
                                        </div>
                                        <div className="text-sm text-zinc-600">Try: {item.action}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Danger Zone */}
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={async () => {
                            if (confirm("Are you sure you want to remove this plant from your garden? This cannot be undone.")) {
                                const { deleteCareSession } = await import("@/lib/queries");
                                const success = await deleteCareSession(plant.id);
                                if (success) {
                                    window.location.href = "/dashboard";
                                } else {
                                    alert("Failed to delete plant. Please try again.");
                                }
                            }
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Plant from Garden
                    </Button>
                </div>
            </main>
        </div>
    );
}
