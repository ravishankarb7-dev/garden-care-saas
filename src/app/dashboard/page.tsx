"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Sprout, Calendar, Droplets } from "lucide-react";
import { Plant } from "@/lib/types";
import { getCareSessionsByReceipt, getPlants } from "@/lib/queries";
import Link from "next/link";

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

                    return {
                        id: session.id,
                        plantId: matchedPlant?.id || categoryData?.key,
                        // PREFER SKU NAME if available, then category label, then static match
                        name: matchedPlant?.name || skuData?.display_name || categoryData?.label || "Unknown Plant",
                        plantedAt: new Date(session.planted_at).toLocaleDateString(),
                        nextWater: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Mock forecast for now
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

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
            <Header />

            <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <div style={{ marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>My Garden</h1>
                    <p style={{ color: "#6B7280" }}>Manage your care schedules and plant health.</p>
                </div>

                {loading ? (
                    <div>Loading garden...</div>
                ) : myPlants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
                        <p>You haven't added any plants yet.</p>
                        <Link href="/intake" style={{ color: '#059669', fontWeight: 600 }}>Add your first plant</Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                        {myPlants.map((item) => (
                            <div key={item.id} style={{
                                backgroundColor: "white",
                                borderRadius: "16px",
                                padding: "1.5rem",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                                border: "1px solid #F3F4F6"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                                    <div style={{
                                        width: "56px", height: "56px",
                                        borderRadius: "12px",
                                        backgroundColor: "#ECFDF5",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#059669",
                                        overflow: "hidden"
                                    }}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Sprout size={28} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1F2937", margin: 0 }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: "0.25rem 0 0 0" }}>
                                            Added {item.plantedAt}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "#F0F9FF",
                                    borderRadius: "12px",
                                    marginBottom: "1rem"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#0369A1", marginBottom: "0.5rem" }}>
                                        <Droplets size={18} />
                                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Next Watering</span>
                                    </div>
                                    <div style={{ paddingLeft: "2rem", color: "#0C4A6E", fontWeight: 500 }}>
                                        {item.nextWater}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                                    <Link href={`/my-plants/${item.id}`} style={{ textDecoration: 'none' }}>
                                        <button style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            borderRadius: "8px",
                                            border: "1px solid #E5E7EB",
                                            backgroundColor: "white",
                                            color: "#374151",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                                        >
                                            View Schedule
                                        </button>
                                    </Link>
                                    <button
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
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "8px",
                                            border: "1px solid #FEE2E2",
                                            backgroundColor: "#FEF2F2",
                                            color: "#DC2626",
                                            cursor: "pointer"
                                        }}
                                        title="Remove Plant"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
