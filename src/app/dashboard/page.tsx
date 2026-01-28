"use client";
import { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header";
import { Sprout, Calendar, Droplets, Bug, Leaf, MoreVertical, History, AlertTriangle, XCircle } from "lucide-react";
import OutcomeReportModal from "@/components/OutcomeReportModal";
import CycleAutopsyReport from "@/components/CycleAutopsyReport";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { CareTask } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import WeatherWidget from "@/components/WeatherWidget";
import { getOrCreateDeviceId, saveDeviceId, isValidGardenCode } from "@/lib/device";
import { useSearchParams, useRouter } from "next/navigation";
import { generateGoogleCalendarLink, downloadICS } from "@/lib/calendar";
import SmartCareNarrative from "@/components/SmartCareNarrative";
import SageAlertBanner from "@/components/SageAlertBanner";
import type { AlertType, AlertLevel } from "@/components/SageAlertBanner";
import { getUserStats, UserStats } from "@/lib/queries";

interface DashboardPlant {
    id: string;
    plantId: string;
    name: string;
    plantedAt: string;
    imageUrl?: string;
    schedule: CareTask[];
    nextWater: string;
    nextFertilize: string;
    nextPest: string;
    nextWaterDate: Date | null;
    zip?: string;
    isEstablished: boolean;
}

function DashboardContent() {
    const [myPlants, setMyPlants] = useState<DashboardPlant[]>([]);
    const [archivedPlants, setArchivedPlants] = useState<DashboardPlant[]>([]);
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
    const [loading, setLoading] = useState(true);
    const [deviceId, setDeviceId] = useState("");
    const [calendarOpen, setCalendarOpen] = useState<string | null>(null);
    const [disabledPlants, setDisabledPlants] = useState<Record<string, boolean>>({});
    const [weatherAlert, setWeatherAlert] = useState<{ type: AlertType, level: AlertLevel, message: string } | null>(null);

    const [outcomeModalOpen, setOutcomeModalOpen] = useState<string | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                // 1. Resolve Device ID
                let id = searchParams.get('id');

                if (id && isValidGardenCode(id)) {
                    id = id.toUpperCase();
                    saveDeviceId(id);
                } else {
                    id = getOrCreateDeviceId();
                }

                setDeviceId(id!);

                const currentUrlId = searchParams.get('id');
                if (currentUrlId !== id) {
                    router.replace(`/dashboard?id=${id}`);
                }

                const { getCareSessionsByDeviceId, getPlants, getUserStats } = await import("@/lib/queries");
                const sessions = await getCareSessionsByDeviceId(id!);
                const stats = await getUserStats(id!);
                setUserStats(stats);
                const staticPlants = await getPlants();

                const active: DashboardPlant[] = [];
                const archived: DashboardPlant[] = [];

                sessions.forEach(session => {
                    const categoryData = session.care_category;
                    const skuData = session.store_sku;
                    const outcome = session.outcome;

                    // Check if archived (has outcome)
                    // outcome might be an array or object depending on schema 1:1 vs 1:M
                    const isArchived = Array.isArray(outcome) ? outcome.length > 0 : !!outcome;

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

                    const plantedDate = new Date(session.planted_at);
                    const schedule = matchedPlant?.careSchedule || [];
                    const nextWaterDate = getNextActionDate(schedule, "Water", plantedDate);

                    const plantObj = {
                        id: session.id,
                        plantId: matchedPlant?.id || categoryData?.key,
                        name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                        plantedAt: plantedDate.toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }),
                        schedule,
                        nextWaterDate: nextWaterDate,
                        nextWater: getNextAction(schedule, "Water", plantedDate),
                        nextFertilize: getNextAction(schedule, "Fertilize", plantedDate),
                        nextPest: getNextAction(schedule, "Pest", plantedDate) || getNextAction(schedule, "Inspect", plantedDate),
                        imageUrl: matchedPlant?.imageUrl,
                        zip: session.zip,
                        isEstablished: (new Date().getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24) > 28
                    };

                    if (isArchived) {
                        archived.push(plantObj);
                    } else {
                        active.push(plantObj);
                    }
                });

                setMyPlants(active);
                setArchivedPlants(archived);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Check Weather Risks for ALL unique zips
    useEffect(() => {
        async function checkRisks() {
            const uniqueZips = Array.from(new Set(myPlants.map(p => p.zip).filter(Boolean))) as string[];
            if (uniqueZips.length === 0) return;

            let criticalAlert = null;
            let warningAlert = null;

            await Promise.all(uniqueZips.map(async (zip) => {
                try {
                    const res = await fetch(`/api/weather?zip=${zip}`);
                    if (!res.ok) return;
                    const data = await res.json();
                    const temp = data.temp;

                    if (temp <= 32) {
                        criticalAlert = {
                            type: 'WEATHER' as AlertType,
                            level: 'CRITICAL' as AlertLevel,
                            message: `Freeze Warning (${temp}°F in ${zip}): Cover delicate plants. Care tasks paused.`
                        };
                    } else if (temp >= 95) {
                        warningAlert = {
                            type: 'WEATHER' as AlertType,
                            level: 'WARNING' as AlertLevel,
                            message: `Heat Advisory (${temp}°F in ${zip}): Water early. Avoid fertilizing.`
                        };
                    }
                } catch (e) {
                    console.error(`Weather check failed for ${zip}`, e);
                }
            }));

            if (criticalAlert) {
                setWeatherAlert(criticalAlert);
            } else if (warningAlert) {
                setWeatherAlert(warningAlert);
            } else {
                setWeatherAlert(null);
            }
        }

        if (myPlants.length > 0) {
            checkRisks();
        }
    }, [myPlants]);

    const handleConclude = async (plantId: string, data: any) => {
        const plant = myPlants.find(p => p.id === plantId);
        if (!plant) return;

        const { concludeCareSession } = await import("@/lib/reporting");

        await concludeCareSession({
            sessionId: plantId,
            storeId: '00000000-0000-0000-0000-000000000000', // FIXME: Add storeId to DashboardPlant definition!
            type: data.outcomeType,
            source: 'manual_review',
            confidence: data.confidence,
            notes: data.notes
        });

        // Optimistic Move
        setMyPlants(prev => prev.filter(p => p.id !== plantId));
        setArchivedPlants(prev => [plant, ...prev]);

        setOutcomeModalOpen(null);
        setReportModalOpen(plantId);
    };

    function getNextActionDate(schedule: any[], actionType: string, plantedDate: Date): Date | null {
        if (!schedule || schedule.length === 0) return null;
        const now = new Date();
        const planted = new Date(plantedDate);
        const daysSince = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));

        const nextTask = schedule
            .sort((a: any, b: any) => a.day - b.day)
            .find((item: any) =>
                item.day >= daysSince &&
                item.action.toLowerCase().includes(actionType.toLowerCase())
            );

        if (nextTask) {
            const nextDate = new Date(planted);
            nextDate.setDate(planted.getDate() + nextTask.day);
            return nextDate;
        }
        return null;
    }

    function getNextAction(schedule: any[], actionType: string, plantedDate: Date): string {
        const date = getNextActionDate(schedule, actionType, plantedDate);
        if (date) return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (actionType === "Water") return "Check Guide";
        return "None scheduled";
    }

    const handleAddToCalendar = (type: 'google' | 'ics', plant: any) => {
        if (!plant.nextWaterDate) {
            alert("No upcoming watering scheduled to add.");
            return;
        }
        const event = {
            title: `Water ${plant.name}`,
            description: `Time to water your ${plant.name}! Check your Garden Care app for details.`,
            start: plant.nextWaterDate,
            location: "My Garden"
        };
        if (type === 'google') {
            window.open(generateGoogleCalendarLink(event), '_blank');
        } else {
            downloadICS(event);
        }
        setCalendarOpen(null);
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans" onClick={() => { setMenuOpen(null); setCalendarOpen(null); }}>
            <Header />

            {/* Sage Alert Banner */}
            {weatherAlert && (
                <div className="max-w-5xl mx-auto mt-4 px-6">
                    <div className="rounded-lg overflow-hidden shadow-sm">
                        <SageAlertBanner
                            type={weatherAlert.type}
                            level={weatherAlert.level}
                            message={weatherAlert.message}
                        />
                    </div>
                </div>
            )}

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    {/* Weather Widget (First Zip Only for Visuals) */}
                    {myPlants.find(p => p.zip)?.zip && (
                        <div className="mb-8">
                            <WeatherWidget zipCode={myPlants.find(p => p.zip)?.zip || ""} />
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2 font-serif">Your Canopy</h1>
                            <p className="text-zinc-500 mb-4">Manage your care schedules and plant health.</p>

                            {/* View Toggle */}
                            <div className="flex bg-zinc-100 rounded-lg p-1 w-fit">
                                <button
                                    onClick={() => setViewMode('active')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'active' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    Active Garden
                                </button>
                                <button
                                    onClick={() => setViewMode('history')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'history' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    History ({archivedPlants.length})
                                </button>
                            </div>


                        </div>

                        {/* Device ID Helper */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col gap-2">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Garden Code</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(deviceId);
                                    alert("Copied Code: " + deviceId);
                                }}
                                className="flex items-center gap-2 text-2xl font-mono font-bold text-primary bg-zinc-50 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                                title="Click to copy"
                            >
                                {deviceId}
                                <span className="text-xs text-zinc-400 font-sans font-normal ml-2">Click to copy</span>
                            </button>
                            <p className="text-[10px] text-zinc-400">Sync this garden to other devices using this code.</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-16">
                        <div className="w-8 h-8 border-4 border-zinc-200 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : viewMode === 'history' ? (
                    // HISTORY VIEW
                    archivedPlants.length === 0 ? (
                        <Card className="text-center p-12 border-dashed border-2 border-zinc-200 shadow-none bg-zinc-50/50">
                            <p className="text-zinc-500">No archived plants yet. Conclude a cycle to see it here.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedPlants.map((item) => (
                                <Card key={item.id} className="flex flex-col h-full border-zinc-200 opacity-75 hover:opacity-100 transition-opacity bg-zinc-50">
                                    <div className="p-6 flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-zinc-200 grayscale flex items-center justify-center overflow-hidden flex-shrink-0 text-zinc-400">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Sprout size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-zinc-700 leading-tight mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-zinc-500 italic">Archived Record</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto p-6 pt-0">
                                        <Button
                                            variant="outline"
                                            className="w-full border-zinc-300 text-zinc-700 hover:bg-white"
                                            onClick={() => setReportModalOpen(item.id)}
                                        >
                                            <History size={16} className="mr-2" /> View Lifecycle Report
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )
                ) : myPlants.length === 0 ? (
                    <div className="flex flex-col gap-8">
                        <Card className="text-center p-12 border-dashed border-2 border-zinc-200 shadow-none bg-zinc-50/50">
                            <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                                <Sprout size={40} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">
                                Your garden is empty
                            </h3>
                            <p className="text-zinc-500 mb-8 max-w-md mx-auto">Start your journey by adding plants from your recent purchases.</p>
                            <Link href="/intake">
                                <Button size="lg" className="rounded-full">Add your first plant</Button>
                            </Link>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myPlants.map((item) => (
                            <Card key={item.id} className="flex flex-col h-full hover:shadow-md transition-shadow duration-300 border-zinc-200 overflow-hidden group">
                                <div className="p-6 flex items-start gap-4 relative">
                                    <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-zinc-300">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Sprout size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-lg text-zinc-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                                            <Link href={`/my-plants/${item.id}`} className="hover:underline">
                                                {item.name}
                                            </Link>
                                        </h3>
                                        <p className="text-xs text-zinc-500 italic">Added {item.plantedAt}</p>
                                    </div>

                                    {/* MENU BUTTON */}
                                    <div className="absolute top-2 right-2 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpen(menuOpen === item.id ? null : item.id);
                                            }}
                                            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {menuOpen === item.id && (
                                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpen(null);
                                                        setReportModalOpen(item.id);
                                                    }}
                                                >
                                                    <History size={14} /> View History
                                                </button>

                                                <div className="my-1 border-t border-zinc-100"></div>

                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpen(null);
                                                        setOutcomeModalOpen(item.id);
                                                    }}
                                                >
                                                    <XCircle size={14} /> Conclude Cycle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Smart Agent Narrative */}
                                {item.zip && (
                                    <div className="px-6 pb-2">
                                        <SmartCareNarrative
                                            plantId={item.plantId}
                                            plantName={item.name}
                                            zipCode={item.zip}
                                            onRiskChange={(shouldDisable) => {
                                                setDisabledPlants(prev => ({ ...prev, [item.id]: shouldDisable }));
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="px-6 pb-6 mt-auto">
                                    {disabledPlants[item.id] ? (
                                        <div className="bg-amber-50 rounded-lg border border-amber-100 p-4 text-center mb-6">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Monitoring Mode 👁️</p>
                                            <p className="text-xs text-amber-700">Conditions risky. Observe only.</p>
                                        </div>
                                    ) : item.isEstablished ? (
                                        <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 text-center mb-6">
                                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Established 🏆</p>
                                            <p className="text-sm text-emerald-800 font-medium mb-1">Weekly Maintenance Mode</p>
                                            <p className="text-xs text-emerald-600/80">Great job! Switch to weekly deep watering & pruning.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-50 rounded-lg border border-zinc-100 divide-x divide-zinc-200 grid grid-cols-3 text-center mb-6">
                                            <div className="py-3 px-1">
                                                <Droplets size={16} className="mx-auto text-blue-500 mb-1.5" />
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Water</div>
                                                <div className="font-semibold text-sm text-zinc-900">{item.nextWater}</div>
                                            </div>
                                            <div className="py-3 px-1">
                                                <Leaf size={16} className="mx-auto text-green-500 mb-1.5" />
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Feed</div>
                                                <div className="font-semibold text-sm text-zinc-900">{item.nextFertilize}</div>
                                            </div>
                                            <div className="py-3 px-1">
                                                <Bug size={16} className="mx-auto text-amber-500 mb-1.5" />
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pest</div>
                                                <div className="font-semibold text-sm text-zinc-900">{item.nextPest}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Link href={`/my-plants/${item.id}`} className="flex-1">
                                            <Button variant="secondary" fullWidth className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-0">
                                                View Care
                                            </Button>
                                        </Link>

                                        {/* Calendar Button - Disabled if Paused */}
                                        {!disabledPlants[item.id] && (
                                            <div className="relative">
                                                <Button
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCalendarOpen(calendarOpen === item.id ? null : item.id);
                                                    }}
                                                    disabled={!item.nextWaterDate}
                                                    className="px-3"
                                                    title="Sync the Sprout"
                                                >
                                                    <Calendar size={16} className="text-zinc-500" />
                                                </Button>

                                                {calendarOpen === item.id && (
                                                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                                                            Add Reminder
                                                        </div>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-sm text-zinc-700 flex items-center gap-2"
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCalendar('google', item); }}
                                                        >
                                                            Google Calendar
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-sm text-zinc-700 flex items-center gap-2"
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCalendar('ics', item); }}
                                                        >
                                                            Outlook / Apple (.ics)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            {/* MODALS */}
            {outcomeModalOpen && (
                <OutcomeReportModal
                    isOpen={!!outcomeModalOpen}
                    onClose={() => setOutcomeModalOpen(null)}
                    plantName={myPlants.find(p => p.id === outcomeModalOpen)?.name || "Plant"}
                    onConfirm={(data) => handleConclude(outcomeModalOpen, data)}
                />
            )}

            {/* Report Modal Wrapper */}
            <Dialog open={!!reportModalOpen} onOpenChange={() => setReportModalOpen(null)}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white" aria-describedby={undefined}>
                    <DialogTitle className="sr-only">Plant Lifecycle Report</DialogTitle>
                    <CycleAutopsyReport
                        sessionId={reportModalOpen!}
                        plantName={myPlants.find(p => p.id === reportModalOpen)?.name || archivedPlants.find(p => p.id === reportModalOpen)?.name || "Unknown Plant"}
                        onClose={() => setReportModalOpen(null)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
