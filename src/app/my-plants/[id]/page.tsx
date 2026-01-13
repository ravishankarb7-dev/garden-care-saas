"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { getCareSessionsByReceipt, getPlants } from "@/lib/queries";
import { Plant } from "@/lib/types";
import { ArrowLeft, Droplets, Sun, Calendar } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MyPlantPage() {
    const params = useParams();
    const id = params?.id as string; // The session ID

    const [plant, setPlant] = useState<any>(null);
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
                    .single();

                if (error || !session) {
                    console.error("Session not found", error);
                    setLoading(false);
                    return;
                }

                // Fetch static data for images/schedules
                // Note: In a real app we might optimize this to fetch just one
                const staticPlants = await getPlants();

                // Match Logic
                const categoryData = session.care_category;
                const skuData = session.store_sku;

                // CRITICAL FIX: Try to find the specific SKU plant first (which has the smart schedule)
                let matchedPlant = null;
                if (session.store_sku_id) {
                    matchedPlant = staticPlants.find(p => p.skuId === session.store_sku_id);
                }
                // Fallback to searching by Care Category UUID
                if (!matchedPlant) {
                    matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id && !p.skuId);
                }
                // Final fallback
                if (!matchedPlant) {
                    matchedPlant = staticPlants.find(p => p.uuid === session.care_category_id);
                }

                const hydrated = {
                    id: session.id,
                    name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                    botanicalName: matchedPlant?.botanicalName || skuData?.sku,
                    plantedAt: new Date(session.planted_at).toLocaleDateString(),
                    imageUrl: matchedPlant?.imageUrl,
                    // Use the matched plant's schedule (which should be fuzzy matched now)
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
            <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
                <Header />
                <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem" }}>
                    Loading...
                </main>
            </div>
        );
    }

    if (!plant) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
                <Header />
                <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem" }}>
                    Plant not found.
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
            <Header />

            <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6B7280", textDecoration: "none", marginBottom: "2rem" }}>
                    <ArrowLeft size={18} />
                    Back to Garden
                </Link>

                <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                    {/* Header Section */}
                    <div style={{ padding: "2rem", display: "flex", gap: "2rem", borderBottom: "1px solid #F3F4F6" }}>
                        <div style={{ width: "100px", height: "100px", borderRadius: "12px", backgroundColor: "#ECFDF5", flexShrink: 0, overflow: "hidden" }}>
                            {plant.imageUrl ? (
                                <img src={plant.imageUrl} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : null}
                        </div>
                        <div>
                            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem 0" }}>{plant.name}</h1>
                            <p style={{ color: "#6B7280", fontStyle: "italic", margin: 0 }}>{plant.botanicalName}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", color: "#059669", fontSize: "0.9rem", fontWeight: 500 }}>
                                <Calendar size={16} />
                                Planted on {plant.plantedAt}
                            </div>
                        </div>
                    </div>

                    {/* Care Schedule */}
                    <div style={{ padding: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1F2937" }}>Care Schedule</h2>

                        <div style={{ display: "grid", gap: "1rem" }}>
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

                                // Format the date (e.g., "Jan 12")
                                const dateString = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const displayDate = isToday ? "Today" : dateString;

                                return (
                                    <div key={idx} style={{
                                        display: "flex", gap: "1rem",
                                        padding: "1rem",
                                        backgroundColor: isToday ? "#ECFDF5" : "#F9FAFB",
                                        borderRadius: "12px",
                                        borderLeft: `4px solid ${task.action === 'Water' ? '#3B82F6' : '#10B981'}`,
                                        border: isToday ? "1px solid #10B981" : "1px solid transparent"
                                    }}>
                                        <div style={{ flexShrink: 0, width: "3.5rem", textAlign: "center", fontWeight: isToday ? 700 : 600, color: isToday ? "#059669" : "#374151" }}>
                                            {displayDate}
                                            <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 400 }}>Day {task.day}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>{task.action}</div>
                                            <div style={{ color: "#4B5563", fontSize: "0.95rem" }}>
                                                {isToday && task.action === "Water" ? "Water today. " : ""}
                                                {task.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {plant.careSchedule.length === 0 && (
                                <p style={{ color: "#6B7280" }}>No specific care schedule active for this plant type yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    {plant.troubleshooting.length > 0 && (
                        <div style={{ padding: "2rem", borderTop: "1px solid #F3F4F6" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1F2937" }}>Troubleshooting</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                {plant.troubleshooting.map((item: any, idx: number) => (
                                    <div key={idx} style={{ padding: "1rem", border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                                        <div style={{ fontWeight: 600, color: "#EF4444", marginBottom: "0.5rem" }}>{item.symptom}</div>
                                        <div style={{ fontSize: "0.9rem", color: "#374151" }}>Try: {item.action}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div style={{ padding: "2rem", backgroundColor: "#FEF2F2", borderTop: "1px solid #FEE2E2" }}>
                        <button
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
                            style={{
                                backgroundColor: "white", color: "#DC2626", border: "1px solid #DC2626",
                                padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer"
                            }}>
                            Remove Plant
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
