"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Sprout, Loader2, MapPin } from "lucide-react";
import { Plant } from "@/lib/types";
import { findMatchingPlants } from "@/lib/match";
import { getPlants } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ManualPlantCard from "./ManualPlantCard";

export interface ManualEntryPayload {
    plants: Plant[];
    date?: string; // Global date optional/deprecated (using per-plant now)
    zip: string;
    // Deprecated global fields are removed from usage but type might be inferred elsewhere.
    // We'll pass undefined for them.
}

interface ManualEntryFormProps {
    onConfirm: (payload: ManualEntryPayload) => void;
    onCancel: () => void;
}

export default function ManualEntryForm({ onConfirm, onCancel }: ManualEntryFormProps) {
    const [query, setQuery] = useState("");
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<Plant[]>([]);

    // The main state is now just the list of plants, which carry their own full state
    const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);

    const [zip, setZip] = useState(""); // Planting Zip (Global Location)
    const [zipValid, setZipValid] = useState(false);
    const [verifyingZip, setVerifyingZip] = useState(false);
    const [zipError, setZipError] = useState("");

    // Safety Check State
    const [checkStatus, setCheckStatus] = useState<'IDLE' | 'LOADING' | 'SAFE' | 'WARNING'>('IDLE');
    const [checkMessage, setCheckMessage] = useState("");

    // Helper to extract pot size from query
    function extractSizeFromQuery(text: string): { cleanQuery: string, size: string | undefined } {
        const sizeRegex = /\b(\d+\s*[gG](?:al(?:lon)?)?|#\d+|\d+\s*in(?:ch)?|\d+(?:\.\d+)?\s*[qQ][tT])\b/i;
        const match = text.match(sizeRegex);

        if (match) {
            const clean = text.replace(match[0], "").trim().replace(/\s+/, " ");
            let raw = match[0].toLowerCase().replace(/\s/g, ""); // "3 gal" -> "3gal"

            // Normalize to keys: 1g, 2g, 3g, 5g, 7g+, 4in
            let size = undefined;

            if (raw.includes("g") || raw.startsWith("#")) {
                // Handle #5 -> 5g
                if (raw.startsWith("#")) {
                    raw = raw.replace("#", "") + "g";
                }
                // Handle 3gal -> 3g
                const num = parseInt(raw);
                if (!isNaN(num)) {
                    if (num >= 7) size = "7g+"; // Simplify large pots
                    else size = `${num}g`;
                }
            } else if (raw.includes("in")) {
                size = "4in"; // Default logic? Or keep raw "4in". 
                // Regex matched '4in'. If user typed '10in', we don't have a key.
                // Dropdown has '4in'. Let's map '4in' exactly or maybe map small inches?
                // For now, if it matches "4in" roughly. 
                if (raw.includes("4")) size = "4in";
            }

            return { cleanQuery: clean, size };
        }
        return { cleanQuery: text, size: undefined };
    }

    // Load plants on mount
    useEffect(() => {
        async function load() {
            try {
                const plants = await getPlants();
                const onlySkus = plants.filter(p => !!p.skuId);
                setAllPlants(onlySkus);
            } catch (err) {
                console.error("Failed to load plants", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Update suggestions on query change
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const { cleanQuery } = extractSizeFromQuery(query);
        if (!cleanQuery) return;

        const matches = findMatchingPlants(cleanQuery, allPlants, 4);
        setSuggestions(matches.slice(0, 5));
    }, [query, allPlants]);

    // Verify Zip Code REAL-TIME
    useEffect(() => {
        const checkZip = async () => {
            setZipValid(false);
            setZipError("");

            if (!/^\d{5}$/.test(zip)) {
                if (zip.length > 5) setZipError("Zip code must be 5 digits");
                return;
            }

            setVerifyingZip(true);
            try {
                const res = await fetch(`/api/weather?zip=${zip}`);
                if (res.ok) {
                    setZipValid(true);
                } else {
                    setZipError("Invalid Zip (Not found)");
                    setZipValid(false);
                }
            } catch (err) {
                console.error("Validation error", err);
                setZipError("Unable to verify zip");
            } finally {
                setVerifyingZip(false);
            }
        };

        const timer = setTimeout(checkZip, 500);
        return () => clearTimeout(timer);
    }, [zip]);


    // Auto-populate logic when a plant is selected
    const addPlant = (plant: Plant) => {
        let { size } = extractSizeFromQuery(query);

        // If user didn't type a size, try to extract it from the plant name itself (e.g. "Holly 'Sky Pointer' 3G")
        if (!size && plant.name) {
            const extracted = extractSizeFromQuery(plant.name);
            if (extracted.size) {
                size = extracted.size;
            }
        }

        // Default new plants to NOT planted (Pending) for safety, 
        // unless we want to infer something else.
        const newPlant: Plant = {
            ...plant,
            // Create a unique instance ID so we can add multiple of the same plant
            // We use UUID v4 or just timestamp for now since real UUID comes from DB later
            id: `${plant.id}-${Date.now()}`,
            potSize: size || undefined,
            isPlanted: false, // Default to Pending
            plantingDate: undefined
        };

        setSelectedPlants([...selectedPlants, newPlant]);
        setQuery("");
    };

    const updatePlant = (updatedPlant: Plant) => {
        setSelectedPlants(prev => prev.map(p => p.id === updatedPlant.id ? updatedPlant : p));
    };

    const removePlant = (id: string) => {
        setSelectedPlants(selectedPlants.filter(p => p.id !== id));
    };

    // Auto-Safety Check Effect
    useEffect(() => {
        // Only run if we have valid zip and plants selected
        if (!zipValid || selectedPlants.length === 0) {
            setCheckStatus('IDLE');
            setCheckMessage("");
            return;
        }

        // Refinement: Only run safety check if user has Pending plants.
        // If everything is marked "Planted", we assume they already did it or don't need the forecast.
        const hasPending = selectedPlants.some(p => !p.isPlanted);
        if (!hasPending) {
            setCheckStatus('IDLE');
            return;
        }

        const runSafetyCheck = async () => {
            // Only check safety for plants that are NOT planted (or check all? Proposal said check pending?)
            // Actually currently the check logic is "If you plant NOW, is it safe?".
            // So we probably want to warn mostly for the ones user marks as "Planted Today".
            // But the original logic was general. Let's keep it general for now.

            setCheckStatus('LOADING');
            try {
                const res = await fetch('/api/agent/plant-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plants: selectedPlants, zip })
                });
                const data = await res.json();
                if (data.safe) {
                    setCheckStatus('SAFE');
                } else {
                    setCheckStatus('WARNING');
                }
                setCheckMessage(data.message);
            } catch (err) {
                console.error("Safety check error", err);
                setCheckStatus('IDLE');
            }
        };

        const timer = setTimeout(runSafetyCheck, 800);
        return () => clearTimeout(timer);

    }, [zip, zipValid, selectedPlants]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!zipValid) {
            alert("Please provide a valid Planting Zip Code.");
            return;
        }

        onConfirm({
            plants: selectedPlants,
            date: new Date().toISOString(), // Fallback global date, though ignored per-plant
            zip,

            // Pass undefined for removed global fields
            purchaseDate: undefined,
            starterSize: undefined,
            storeName: undefined,
            purchasePrice: undefined,
            isPlanted: undefined
        } as any); // Cast as any if Type is strict, or we update the Type definition in parent
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Identify Your Greenery</h2>
                            <p className="text-zinc-500">Tell us who joined the family. Each plant can have its own story.</p>
                        </div>

                        {/* Top Section: Search Bar */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Add a Plant <span className="text-zinc-400 font-normal">(e.g. "Hydrangea")</span></label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                />
                                <Input
                                    type="text"
                                    placeholder={loading ? "Loading..." : "Type plant name..."}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={loading}
                                    className="pl-10 h-14 text-lg shadow-sm"
                                    autoFocus
                                />
                                {loading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="animate-spin text-zinc-400" size={18} />
                                    </div>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {suggestions.length > 0 && (
                                <Card className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-white shadow-xl border border-zinc-200">
                                    <div className="max-h-60 overflow-auto">
                                        {suggestions.map(plant => (
                                            <button
                                                key={plant.id}
                                                type="button"
                                                onClick={() => addPlant(plant)}
                                                className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center justify-between border-b border-zinc-50 last:border-0 transition-colors"
                                            >
                                                <div>
                                                    <div className="font-medium text-zinc-900 text-sm">{plant.name}</div>
                                                    {plant.botanicalName && (
                                                        <div className="text-xs text-zinc-500 italic mt-0.5">
                                                            {plant.botanicalName}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-primary group-hover:bg-primary/10">
                                                    <Plus size={16} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Planting Zip Code (Global) */}
                        <div className="flex flex-col gap-1.5 relative">
                            <label className="block text-sm font-bold text-zinc-900">Garden Location (Zip)</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    type="text"
                                    placeholder="e.g. 90210"
                                    value={zip}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                                        setZip(val);
                                    }}
                                    className={cn(
                                        "pl-10 h-12 text-base",
                                        zipError && "border-red-500 focus-visible:ring-red-500",
                                        zipValid && "border-green-300 ring-1 ring-green-100"
                                    )}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                                    {verifyingZip && <Loader2 className="animate-spin text-zinc-400" size={16} />}
                                    {!verifyingZip && zipValid && <span className="text-green-600 font-bold">✓</span>}
                                </div>
                            </div>
                            {zipError && (
                                <p className="text-xs text-red-500 ml-1">
                                    {zipError}
                                </p>
                            )}
                        </div>

                        {/* Selected Plants List (Rich Cards) */}
                        {selectedPlants.length > 0 && (
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
                                    Your Selections ({selectedPlants.length})
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {selectedPlants.map((plant) => (
                                        <ManualPlantCard
                                            key={plant.id}
                                            plant={plant}
                                            onChange={updatePlant}
                                            onRemove={removePlant}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety Advisory Banner */}
                        {zipValid && selectedPlants.length > 0 && (
                            <div className="pt-2">
                                {checkStatus === 'LOADING' && (
                                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Loader2 className="animate-spin h-3 w-3" /> Checking garden forecast...
                                    </div>
                                )}

                                {checkStatus === 'SAFE' && (
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-800 flex flex-col gap-1">
                                        <div className="font-bold flex items-center gap-2">
                                            <span>🌱 Looks good for planting!</span>
                                        </div>
                                        <p className="text-xs opacity-90">{checkMessage}</p>
                                    </div>
                                )}

                                {checkStatus === 'WARNING' && (
                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 flex flex-col gap-1">
                                        <div className="font-bold flex items-center gap-2">
                                            <span>⚠️ Careful with planting</span>
                                        </div>
                                        <p className="text-xs opacity-90">{checkMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 mt-4 border-t border-zinc-100">
                            <Button variant="ghost" type="button" onClick={onCancel} className="text-zinc-500">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                fullWidth
                                disabled={selectedPlants.length === 0 || !zipValid || verifyingZip}
                                variant="default"
                                className="h-12 text-lg shadow-green-900/10 shadow-lg"
                            >
                                Establish Care Plan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
