"use client";

import { useState, useEffect } from "react";
import { ScannedReceiptData, ScannedItem } from "@/lib/ocr";
import { Check, Tag, Trash2, AlertCircle, Edit2, Save, X, Plus, Search, Loader2 } from "lucide-react";
import { PLANTS } from "@/lib/data"; // Direct import for fuzzy matching
import { Plant } from "@/lib/types";
import { findMatchingPlants } from "@/lib/match";
import { getPlants } from "@/lib/queries";
import { Card } from "@/components/ui/Card";

interface ReceiptAnalysisFormProps {
    initialData: ScannedReceiptData;
    onConfirm: (data: FinalReceiptPayload) => void;
    onCancel: () => void;
}

export type FinalReceiptPayload = {
    receiptId: string;
    purchaseDate: string;
    plantingDate: string;
    storeName: string;
    storeZip: string | null;
    plantingZip: string; // New separate field
    city: string;
    selectedPlants: Plant[];
};

export default function ReceiptAnalysisForm({ initialData, onConfirm, onCancel }: ReceiptAnalysisFormProps) {
    const [receiptId, setReceiptId] = useState(initialData.receiptId);
    const [purchaseDate, setPurchaseDate] = useState(initialData.purchaseDate);
    const [plantingDate, setPlantingDate] = useState(initialData.purchaseDate);
    const [storeName, setStoreName] = useState(initialData.storeName);
    const [storeZip, setStoreZip] = useState(initialData.storeZip || "");
    const [plantingZip, setPlantingZip] = useState(initialData.storeZip || ""); // Default to store zip
    const [city, setCity] = useState("");

    // Zip Validation State (for Planting Zip primarily)
    const [zipValid, setZipValid] = useState(!!initialData.storeZip);
    const [verifyingZip, setVerifyingZip] = useState(false);
    const [zipError, setZipError] = useState("");

    // Verify Zip Code REAL-TIME
    useEffect(() => {
        const checkZip = async () => {
            setZipValid(false);
            setZipError("");

            // Only check if it looks like a complete zip (5 digits)
            if (!/^\d{5}$/.test(plantingZip)) {
                if (plantingZip.length > 5) setZipError("Zip code must be 5 digits");
                return;
            }

            setVerifyingZip(true);
            try {
                // Dry run API checks against OpenWeather (proxied)
                const res = await fetch(`/api/weather?zip=${plantingZip}`);
                if (res.ok) {
                    setZipValid(true);
                } else {
                    setZipError("Invalid Zip Code (Not found)");
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
    }, [plantingZip]);


    // State for items (Identified vs Unrecognized)
    const [items, setItems] = useState<ScannedItem[]>(initialData.items);

    // Editing state for unrecognized items
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    // Search / Autocomplete State
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [suggestions, setSuggestions] = useState<Plant[]>([]);

    // Load available plants for search
    useEffect(() => {
        async function load() {
            try {
                const plants = await getPlants();
                setAllPlants(plants);
            } catch (err) {
                console.error("Failed to load plants for autocomplete", err);
            }
        }
        load();
    }, []);

    // Update suggestions when user types in edit box
    useEffect(() => {
        if (editingIndex === null || !editValue.trim()) {
            setSuggestions([]);
            return;
        }
        const matches = findMatchingPlants(editValue, allPlants, 4);
        setSuggestions(matches.slice(0, 5));
    }, [editValue, editingIndex, allPlants]);


    // Computed items
    const identifiedItems = items.filter(i => i.matchedPlant);
    const unrecognizedItems = items.filter(i => !i.matchedPlant);

    // Delete an item
    const deleteItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditValue("");
        }
    };

    // Start editing
    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(items[index].originalText);
    };

    // Save manual text edit
    const saveManualEdit = (index: number) => {
        const newItems = [...items];
        const text = editValue.trim();

        // Try fuzzy match again just in case
        let match = undefined;
        const cleanLine = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

        for (const plant of PLANTS) {
            const plantName = plant.name.toLowerCase();
            if (cleanLine.includes(plantName) || plantName.includes(cleanLine)) {
                match = { id: plant.id, name: plant.name };
                break;
            }
        }

        newItems[index] = {
            ...newItems[index], // Preserve price/pot info
            originalText: text,
            matchedPlant: match
        };

        setItems(newItems);
        setEditingIndex(null);
        setEditValue("");
    };

    const selectSuggestion = (index: number, plant: Plant) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index], // Preserve price/pot info
            matchedPlant: {
                id: plant.id,
                name: plant.name
            }
        };
        setItems(newItems);
        setEditingIndex(null);
        setEditValue("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Sanity Check: Planting Date (Must be within last 28 days)
        const plantingTime = new Date(plantingDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - plantingTime) / (1000 * 3600 * 24);

        if (diffDays > 28) {
            alert("The planting date is too old (> 4 weeks ago). We focus on tracking new care cycles for fresh starts.");
            return;
        }

        // 2. Change Detection & Confirmation
        const dateChanged = plantingDate !== purchaseDate;
        // Use loose equality for zips to handle nulls vs empty strings gracefully
        const zipChanged = (plantingZip || "") !== (initialData.storeZip || "");

        if (dateChanged || zipChanged) {
            let msg = "Please confirm your changes:\n\n";
            if (dateChanged) msg += `• Planting Date: ${plantingDate} (Receipt was ${purchaseDate})\n`;
            if (zipChanged) msg += `• Planting Zip: ${plantingZip} (Receipt was ${initialData.storeZip || 'Unknown'})\n`;

            msg += "\nProceed with these details?";

            if (!window.confirm(msg)) {
                return;
            }
        }

        // Convert matched items to full Plant objects with instance data
        const finalPlants = identifiedItems.map(item => {
            // Find base species data
            const basePlant = allPlants.find(p => p.id === item.matchedPlant?.id) || PLANTS.find(p => p.id === item.matchedPlant?.id);

            // Construct enriched object
            const enrichedPlant: Plant = {
                ...(basePlant || {
                    id: item.matchedPlant?.id || "unknown",
                    name: item.matchedPlant?.name || "Unknown",
                    botanicalName: "Unknown",
                    careSchedule: [],
                    troubleshooting: []
                }),
                // Append instance data
                purchasePrice: item.price !== null ? item.price : undefined,
                potSize: item.potSize !== null ? item.potSize : undefined,
                quantity: item.quantity || 1
            };

            return enrichedPlant;
        });

        onConfirm({
            receiptId,
            purchaseDate,
            plantingDate,
            storeName,
            storeZip, // Legacy payload field, optional
            plantingZip,
            city,
            selectedPlants: finalPlants
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Review Scan Results</h2>
                <p className="text-gray-500">Verify the store details and plants found. You can adjust the planting date if you waited to plant.</p>
            </div>

            {/* Receipt Details Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt ID</label>
                    <input type="text" value={receiptId} onChange={e => setReceiptId(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>

                {/* DATES */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                    <input
                        type="date"
                        value={plantingDate}
                        onChange={e => setPlantingDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]} // Block future dates
                        className="w-full p-2 border rounded-md bg-green-50 border-green-200"
                        title="When did you put them in soil?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Store Zip Code</label>
                    <input
                        type="text"
                        value={storeZip}
                        onChange={e => setStoreZip(e.target.value)}
                        placeholder="Optional"
                        className="w-full p-2 border rounded-md text-gray-600 bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">Planting Zip Code</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={plantingZip}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                                setPlantingZip(val);
                            }}
                            placeholder="Home Zip"
                            className={`w-full p-2 border rounded-md ${zipError ? 'border-red-500' : 'border-green-300 ring-1 ring-green-100'}`}
                            required
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {verifyingZip && <Loader2 className="animate-spin text-gray-400" size={16} />}
                            {!verifyingZip && zipValid && <Check className="text-green-500" size={16} />}
                        </div>
                    </div>
                    {zipError && <p className="text-xs text-red-500 mt-1">{zipError}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
            </div>

            {/* IDENTIFIED PLANTS */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-800">
                    <Check size={20} className="text-green-600" />
                    Identified Plants ({identifiedItems.length})
                </h3>

                {identifiedItems.length === 0 ? (
                    <div className="text-gray-400 italic text-sm p-4 border border-dashed rounded-lg text-center">
                        No plants recognized yet. Edit unrecognized items below to match them.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {identifiedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-700 h-fit">
                                        <Tag size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{item.matchedPlant?.name}</div>
                                        <div className="text-xs text-gray-400">Scanned: "{item.originalText}"</div>
                                        <div className="flex gap-2 mt-1">
                                            {item.potSize && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200" title="Starter Size">{item.potSize}</span>}
                                            {item.price && <span className="text-xs bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-mono border border-green-100">${item.price.toFixed(2)}</span>}
                                            {item.quantity > 1 && <span className="text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 font-bold border border-blue-100">x{item.quantity}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-green-600">
                                    <Check size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* UNRECOGNIZED ITEMS (Same as before, simplified for this replace) */}
            {unrecognizedItems.length > 0 && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl relative">
                    <h3 className="text-md font-bold mb-2 flex items-center gap-2 text-orange-800">
                        <AlertCircle size={18} />
                        Unrecognized Text ({unrecognizedItems.length})
                    </h3>
                    <p className="text-sm text-orange-700 mb-4">
                        Edit these lines to match a plant from our database, or delete if they are junk.
                    </p>

                    <div className="space-y-3">
                        {items.map((item, idx) => {
                            if (item.matchedPlant) return null; // Skip identified

                            const isEditing = editingIndex === idx;

                            return (
                                <div key={idx} className="relative">
                                    {isEditing ? (
                                        <div className="relative">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        placeholder="Search plant name..."
                                                        className="w-full p-2 pl-9 text-sm border rounded-md shadow-sm outline-none ring-2 ring-green-100 border-green-300"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                saveManualEdit(idx);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingIndex(null);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <button type="button" onClick={() => saveManualEdit(idx)} className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700" title="Keep Manual Text">
                                                    <Save size={16} />
                                                </button>
                                                <button type="button" onClick={() => setEditingIndex(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* SUGGESTIONS DROPDOWN */}
                                            {suggestions.length > 0 && (
                                                <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-white shadow-xl max-h-60 overflow-y-auto">
                                                    {suggestions.map(plant => (
                                                        <button
                                                            key={plant.id}
                                                            type="button"
                                                            onClick={() => selectSuggestion(idx, plant)}
                                                            className="w-full text-left p-3 hover:bg-green-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                                                        >
                                                            <div>
                                                                <div className="font-semibold text-gray-800 text-sm">{plant.name}</div>
                                                                <div className="text-xs text-gray-500 italic">{plant.botanicalName}</div>
                                                            </div>
                                                            <Plus size={16} className="text-green-600" />
                                                        </button>
                                                    ))}
                                                </Card>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group">
                                            <div className="flex-1 p-3 bg-white border border-orange-200 rounded-lg flex justify-between items-center shadow-sm">
                                                <div>
                                                    <span className="text-sm text-gray-600 font-mono truncate max-w-[200px] block">{item.originalText}</span>
                                                    {/* Display extracted price/qty for unrecognized items too */}
                                                    <div className="flex gap-2 mt-0.5">
                                                        {item.price && <span className="text-[10px] bg-orange-100 text-orange-800 px-1 rounded border border-orange-200">${item.price}</span>}
                                                        {item.potSize && <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded border border-gray-200" title="Starter Size">{item.potSize}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => startEdit(idx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Match to Plant">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button type="button" onClick={() => deleteItem(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-full" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-8 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={identifiedItems.length === 0 || !zipValid || verifyingZip}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold text-white shadow-sm transition-all ${identifiedItems.length > 0 && zipValid && !verifyingZip ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    {identifiedItems.length > 0
                        ? `Add ${identifiedItems.length} Plants`
                        : "No Plants Selected"}
                </button>
            </div>
        </form>
    );
}
