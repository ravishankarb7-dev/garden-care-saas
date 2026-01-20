"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Sprout, Loader2, CalendarIcon, MapPin } from "lucide-react";
import { Plant } from "@/lib/types";
import { findMatchingPlants } from "@/lib/match";
import { getPlants } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ManualEntryPayload {
    plants: Plant[];
    date: string; // Planting Date
    zip: string;
    purchaseDate?: string;
    starterSize?: string;
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
    const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);

    // Use Date object for Shadcn Calendar
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
    const [starterSize, setStarterSize] = useState("");

    const [zip, setZip] = useState("");
    const [zipValid, setZipValid] = useState(false);
    const [verifyingZip, setVerifyingZip] = useState(false);
    const [zipError, setZipError] = useState("");

    // Load plants on mount
    useEffect(() => {
        async function load() {
            try {
                const plants = await getPlants();
                // Filter out categories (items without skuId) per user request
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

        const matches = findMatchingPlants(query, allPlants, 4);
        setSuggestions(matches.slice(0, 5));
    }, [query, allPlants]);

    // Verify Zip Code REAL-TIME
    useEffect(() => {
        const checkZip = async () => {
            // Reset valid state on any change
            setZipValid(false);
            setZipError("");

            // Only check if it looks like a complete zip (5 digits)
            if (!/^\d{5}$/.test(zip)) {
                if (zip.length > 5) setZipError("Zip code must be 5 digits");
                return;
            }

            setVerifyingZip(true);
            try {
                // Dry run API checks against OpenWeather (proxied)
                const res = await fetch(`/api/weather?zip=${zip}`);
                if (res.ok) {
                    setZipValid(true);
                } else {
                    setZipError("Invalid Zip Code (Not found)");
                    setZipValid(false);
                }
            } catch (err) {
                console.error("Validation error", err);
                setZipError("Unable to verify zip");
            } finally {
                setVerifyingZip(false);
            }
        };

        const timer = setTimeout(checkZip, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [zip]);


    const addPlant = (plant: Plant) => {
        if (!selectedPlants.some(p => p.id === plant.id)) {
            setSelectedPlants([...selectedPlants, plant]);
        }
        setQuery("");
    };

    const removePlant = (id: string) => {
        setSelectedPlants(selectedPlants.filter(p => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!zipValid) {
            alert("Please provide a valid US Zip Code.");
            return;
        }
        if (!date) {
            alert("Please provide a planting date.");
            return;
        }

        // Sanity Check: Date must be within last 28 days
        const plantingTime = date.getTime();
        const now = new Date().getTime();
        const diffDays = (now - plantingTime) / (1000 * 3600 * 24);

        if (diffDays > 28) {
            alert("The planting date is too old (> 4 weeks ago). We focus on tracking new care cycles for fresh starts.");
            return;
        }

        onConfirm({
            plants: selectedPlants,
            date: date.toISOString(), // Standardize to ISO
            zip,
            purchaseDate: purchaseDate ? purchaseDate.toISOString() : undefined,
            starterSize: starterSize || undefined
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Identify Your Greenery</h2>
                            <p className="text-zinc-500">Tell us who joined the family, and we’ll handle the homework.</p>
                        </div>

                        {/* Selected Plants List */}
                        {selectedPlants.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                    Selected Plants
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPlants.map(plant => (
                                        <div key={plant.id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-full border border-zinc-200 text-sm font-medium">
                                            <Sprout size={14} className="text-primary" />
                                            <span>{plant.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePlant(plant.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Who are we growing?</label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                />
                                <Input
                                    type="text"
                                    placeholder={loading ? "Loading plants..." : "e.g. Monstera Deliciosa"}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={loading}
                                    className="pl-10 h-12 text-base"
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

                        {/* Date and Zip */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="block text-sm font-medium text-zinc-700">When did they arrive?</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal border-zinc-200",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            disabled={(date) => date > new Date()} // Block future dates
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="block text-sm font-medium text-zinc-700">Purchased On (Optional)</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal border-zinc-200",
                                                !purchaseDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                                            {purchaseDate ? format(purchaseDate, "PPP") : <span>Same as planting date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={purchaseDate}
                                            onSelect={setPurchaseDate}
                                            disabled={(date) => date > new Date()} // Block future dates
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="block text-sm font-medium text-zinc-700">Starter Size (Optional)</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 4 inch, 1 Gal"
                                    value={starterSize}
                                    onChange={e => setStarterSize(e.target.value)}
                                    className="h-12 text-base"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="block text-sm font-medium text-zinc-700">Zip Code</label>
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
                                            zipError && "border-red-500 focus-visible:ring-red-500"
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
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button variant="ghost" type="button" onClick={onCancel} className="text-zinc-500">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                fullWidth
                                disabled={selectedPlants.length === 0 || !zipValid || verifyingZip}
                                variant="default" // Primary Emerald
                                className="h-12 text-base"
                            >
                                {verifyingZip ? "Verifying Location..." : `Sow the Schedule (${selectedPlants.length})`}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
