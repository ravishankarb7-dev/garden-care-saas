"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Sprout, Calendar, Droplets, Bug, Leaf, X } from "lucide-react";
import { Plant } from "@/lib/types";
import { getCareSessionsByReceipt, getPlants } from "@/lib/queries";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import WeatherWidget from "@/components/WeatherWidget";
import { getOrCreateDeviceId, saveDeviceId, isValidGardenCode } from "@/lib/device";
import { useSearchParams, useRouter } from "next/navigation";

import { generateGoogleCalendarLink, downloadICS } from "@/lib/calendar";

export default function DashboardPage() {
    const [myPlants, setMyPlants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deviceId, setDeviceId] = useState("");
    const [calendarOpen, setCalendarOpen] = useState<string | null>(null); // Track which card has calendar menu open

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                // 1. Resolve Device ID
                // Check URL first (allow deep linking / bookmarks)
                let id = searchParams.get('id');

                if (id && isValidGardenCode(id)) {
                    // If valid ID in URL, adopt it and save it
                    id = id.toUpperCase();
                    saveDeviceId(id);
                } else {
                    // Fallback to local storage / cookie
                    id = getOrCreateDeviceId();
                }

                setDeviceId(id!);

                // Ensure URL matches current ID (for history persistence)
                const currentUrlId = searchParams.get('id');
                if (currentUrlId !== id) {
                    router.replace(`/dashboard?id=${id}`);
                }

                // Import query dynamically
                const { getCareSessionsByDeviceId, getPlants } = await import("@/lib/queries");

                // Fetch sessions by Device ID
                const sessions = await getCareSessionsByDeviceId(id!);

                // Fetch all static plant definitions for images/names fallback
                const staticPlants = await getPlants();

                const hydrated = sessions.map(session => {
                    // Match by care_category_id (UUID)
                    const categoryData = session.care_category; // Joined data
                    const skuData = session.store_sku; // Joined SKU data

                    // Match logic: Try to find specific SKU plant first, then fall back to Category match
                    // We look into 'staticPlants' which now contains both Categories and SKUs (with schedules)
                    let matchedPlant = null;
                    if (session.store_sku_id) {
                        matchedPlant = staticPlants.find(p => p.skuId === session.store_sku_id);
                    }
                    if (!matchedPlant) {
                        matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id && !p.skuId);
                    }

                    // Fallback to static match (legacy) if none found
                    if (!matchedPlant) {
                        matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id);
                    }

                    // Fix date display: force parsing as UTC components to match input exactly
                    const plantedDate = new Date(session.planted_at);
                    const schedule = matchedPlant?.careSchedule || [];

                    // Calculate next water date for Calendar
                    const nextWaterDate = getNextActionDate(schedule, "Water", plantedDate);

                    return {
                        id: session.id,
                        plantId: matchedPlant?.id || categoryData?.key,
                        name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                        plantedAt: plantedDate.toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }),
                        schedule, // pass full schedule
                        nextWaterDate: nextWaterDate, // Date object or null
                        nextWater: getNextAction(schedule, "Water", plantedDate),
                        nextFertilize: getNextAction(schedule, "Fertilize", plantedDate),
                        nextPest: getNextAction(schedule, "Pest", plantedDate) || getNextAction(schedule, "Inspect", plantedDate),
                        imageUrl: matchedPlant?.imageUrl,
                        zip: session.zip
                    };
                });

                setMyPlants(hydrated);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Helper to calculate next action date (Object)
    function getNextActionDate(schedule: any[], actionType: string, plantedDate: Date): Date | null {
        if (!schedule || schedule.length === 0) return null;

        const now = new Date();
        const planted = new Date(plantedDate);

        // Reset times to midnight
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

    // Helper to calculate next action date (String for UI)
    function getNextAction(schedule: any[], actionType: string, plantedDate: Date): string {
        const date = getNextActionDate(schedule, actionType, plantedDate);
        if (date) return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (actionType === "Water") return "Check Guide"; // Default fallback
        return "None scheduled";
    }

    // Handle Calendar Add
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
        <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }} onClick={() => setCalendarOpen(null)}>
            <Header />

            <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <div style={{ marginBottom: "2rem" }}>
                    {/* Find any valid zip code from the garden to power the widget */}
                    {myPlants.find(p => p.zip)?.zip && (
                        <div className="mb-8">
                            <WeatherWidget zipCode={myPlants.find(p => p.zip)?.zip} />
                        </div>
                    )}
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>My Garden</h1>
                    <p style={{ color: "#6B7280" }}>Manage your care schedules and plant health.</p>

                    {/* Device ID Helper */}
                    <div className="mt-4 p-4 bg-white rounded-lg border border-sage-200 inline-flex flex-col items-start shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">My Garden Code</p>
                        <div
                            className="bg-sage-100 text-green-900 text-2xl font-mono font-bold px-4 py-2 rounded-md tracking-wider cursor-pointer hover:bg-sage-200 transition-colors flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(deviceId);
                                alert("Copied Code: " + deviceId);
                            }}
                            title="Click to copy"
                        >
                            {deviceId}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                            Enter this code on other devices to sync your garden.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                        <div style={{ width: "2rem", height: "2rem", border: "3px solid var(--color-sage-500)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                ) : myPlants.length === 0 ? (
                    <div className="flex flex-col gap-8">
                        {/* Show demo weather for empty state users so they see the value */}
                        <WeatherWidget zipCode="90210" />

                        <Card style={{ textAlign: 'center', padding: '4rem', color: "var(--color-text-muted)" }}>
                            <div style={{
                                backgroundColor: "var(--color-sage-100)", width: "80px", height: "80px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto"
                            }}>
                                <Sprout size={40} color="var(--color-green-700)" />
                            </div>
                            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-green-900)", marginBottom: "0.5rem" }}>
                                Your garden is empty
                            </h3>
                            <p style={{ marginBottom: "2rem" }}>Start your journey by adding plants from your recent purchases.</p>
                            <Link href="/intake">
                                <Button size="lg">Add your first plant</Button>
                            </Link>
                        </Card>
                    </div>
                ) : (

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                        {myPlants.map((item) => (
                            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-300" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <div style={{ display: "flex", alignItems: "start", gap: "1rem", marginBottom: "1.5rem" }}>
                                    <div style={{
                                        width: "64px", height: "64px",
                                        borderRadius: "12px",
                                        backgroundColor: "var(--color-bg-cream)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "var(--color-green-700)",
                                        overflow: "hidden",
                                        flexShrink: 0
                                    }}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Sprout size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: "1.25rem",
                                            fontWeight: 700,
                                            fontFamily: "var(--font-serif)",
                                            color: "var(--color-green-900)",
                                            margin: 0,
                                            lineHeight: 1.2
                                        }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0 0", fontStyle: "italic" }}>
                                            Added {item.plantedAt}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: "var(--color-bg-cream)",
                                    borderRadius: "8px",
                                    marginBottom: "1.5rem",
                                    border: "1px solid var(--color-sage-100)",
                                    overflow: "hidden"
                                }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                                        <div style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", color: "var(--color-green-700)" }}>
                                                <Droplets size={20} />
                                            </div>
                                            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Water</div>
                                            <div style={{ fontWeight: 600, color: "var(--color-green-900)", fontSize: "0.9rem" }}>{item.nextWater}</div>
                                        </div>
                                        <div style={{ padding: "1rem 0.5rem", textAlign: "center", borderLeft: "1px solid var(--color-sage-200)", borderRight: "1px solid var(--color-sage-200)" }}>
                                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", color: "var(--color-green-700)" }}>
                                                <Leaf size={20} />
                                            </div>
                                            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Fertilize</div>
                                            <div style={{ fontWeight: 600, color: "var(--color-green-900)", fontSize: "0.9rem" }}>{item.nextFertilize}</div>
                                        </div>
                                        <div style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", color: "var(--color-green-700)" }}>
                                                <Bug size={20} />
                                            </div>
                                            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Pest</div>
                                            <div style={{ fontWeight: 600, color: "var(--color-green-900)", fontSize: "0.9rem" }}>{item.nextPest}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: "auto", display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
                                    <Link href={`/my-plants/${item.id}`} style={{ textDecoration: 'none' }}>
                                        <Button fullWidth variant="secondary">View Schedule</Button>
                                    </Link>

                                    {/* CALENDAR BUTTON & POPOVER */}
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (calendarOpen === item.id) {
                                                    setCalendarOpen(null);
                                                } else {
                                                    setCalendarOpen(item.id);
                                                }
                                            }}
                                            title="Add Watering to Calendar"
                                            style={{ padding: "0.5rem", color: "var(--color-green-700)", borderColor: "var(--color-sage-300)" }}
                                            disabled={!item.nextWaterDate}
                                        >
                                            <Calendar size={18} />
                                        </Button>

                                        {calendarOpen === item.id && (
                                            <div className="absolute bottom-full mb-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden text-sm">
                                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                                                    Add Reminder
                                                </div>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 hover:text-green-800 flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCalendar('google', item);
                                                    }}
                                                >
                                                    Google Calendar
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 hover:text-green-800 flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCalendar('ics', item);
                                                    }}
                                                >
                                                    Outlook / Apple (.ics)
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (confirm("Remove this plant?")) {
                                                try {
                                                    const { deleteCareSession } = await import("@/lib/queries");
                                                    const success = await deleteCareSession(item.id);
                                                    if (success) {
                                                        window.location.reload();
                                                    } else {
                                                        alert("Failed to delete plant. Database returned error.");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to delete: " + (err as Error).message);
                                                }
                                            }
                                        }}
                                        title="Remove Plant"
                                        style={{ padding: "0.5rem", color: "var(--color-error)", borderColor: "var(--color-error)" }}
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

