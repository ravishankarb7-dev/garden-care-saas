"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Sprout, Calendar, Droplets, Bug, Leaf } from "lucide-react";
import { Plant } from "@/lib/types";
import { getCareSessionsByReceipt, getPlants } from "@/lib/queries";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
    const [myPlants, setMyPlants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // Get my receipts from local storage
                const myReceipts = JSON.parse(localStorage.getItem("my_receipts") || "[]");

                if (myReceipts.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch sessions from DB
                const sessions = await getCareSessionsByReceipt(myReceipts);

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

                    const plantedDate = new Date(session.planted_at);
                    const schedule = matchedPlant?.careSchedule || [];

                    return {
                        id: session.id,
                        plantId: matchedPlant?.id || categoryData?.key,
                        // PREFER SKU NAME if available, then category label, then static match
                        name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                        plantedAt: plantedDate.toLocaleDateString(),
                        nextWater: getNextAction(schedule, "Water", plantedDate),
                        nextFertilize: getNextAction(schedule, "Fertilize", plantedDate),
                        nextPest: getNextAction(schedule, "Pest", plantedDate) || getNextAction(schedule, "Inspect", plantedDate),
                        imageUrl: matchedPlant?.imageUrl
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

    // Helper to calculate next action date
    function getNextAction(schedule: any[], actionType: string, plantedDate: Date): string {
        if (!schedule || schedule.length === 0) return "As needed";

        const now = new Date();
        const planted = new Date(plantedDate);

        // Reset times to midnight for accurate day calculation
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const plantedDay = new Date(planted.getFullYear(), planted.getMonth(), planted.getDate());

        const diffTime = today.getTime() - plantedDay.getTime();
        const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Find the first task of this type that is today or in the future
        const nextTask = schedule
            .sort((a: any, b: any) => a.day - b.day)
            .find((item: any) =>
                item.day >= daysSince &&
                item.action.toLowerCase().includes(actionType.toLowerCase())
            );

        if (nextTask) {
            const nextDate = new Date(plantedDay);
            nextDate.setDate(plantedDay.getDate() + nextTask.day);
            return nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }

        // If no future task found in explicit schedule?
        // Logic: if it's "Water", and we passed the schedule, maybe show "Weekly" or "Check Guide"
        // For now, let's return "Check Guide" to be safe rather than misleading
        if (actionType === "Water") return "Check Guide";

        return "None scheduled";
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
            <Header />

            <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <div style={{ marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>My Garden</h1>
                    <p style={{ color: "#6B7280" }}>Manage your care schedules and plant health.</p>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                        <div style={{ width: "2rem", height: "2rem", border: "3px solid var(--color-sage-500)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                ) : myPlants.length === 0 ? (
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

                                <div style={{ marginTop: "auto", display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
                                    <Link href={`/my-plants/${item.id}`} style={{ textDecoration: 'none' }}>
                                        <Button fullWidth variant="secondary">View Schedule</Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            if (confirm("Remove this plant?")) {
                                                try {
                                                    const { deleteCareSession } = await import("@/lib/queries");
                                                    await deleteCareSession(item.id);
                                                    setMyPlants(prev => prev.filter(p => p.id !== item.id));
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to delete");
                                                }
                                            }
                                        }}
                                        title="Remove Plant"
                                        style={{ padding: "0.5rem 1rem", color: "var(--color-error)", borderColor: "var(--color-error)" }}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
                }
            </main >
        </div >
    );
}
