import { useState, useEffect } from "react";
import { X, Sprout, Calendar as CalendarIcon, Store, DollarSign, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import { Plant } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ManualPlantCardProps {
    plant: Plant;
    onChange: (updatedPlant: Plant) => void;
    onRemove: (id: string) => void;
}

export default function ManualPlantCard({ plant, onChange, onRemove }: ManualPlantCardProps) {
    const [isPlanted, setIsPlanted] = useState(plant.isPlanted ?? false);
    const [date, setDate] = useState<Date | undefined>(
        plant.plantingDate ? new Date(plant.plantingDate) : undefined
    );
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Sync local state to parent when mapped props change (if needed) or when local changes occur
    useEffect(() => {
        // If the plant prop updates from outside, we might need to sync, but usually we drive from here.
        // For now, we trust the parent passes the latest state.
    }, [plant]);

    const handleStatusToggle = (newStatus: boolean) => {
        setIsPlanted(newStatus);
        const newDate = newStatus ? (date || new Date()) : undefined;
        if (newStatus && !date) setDate(newDate); // Set default if turning on

        onChange({
            ...plant,
            isPlanted: newStatus,
            plantingDate: newStatus && newDate ? newDate.toISOString() : undefined
        });
    };

    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate);
        onChange({
            ...plant,
            plantingDate: newDate ? newDate.toISOString() : undefined
        });
    };

    const handleSizeChange = (val: string) => {
        onChange({ ...plant, potSize: val });
    };

    const handleStoreChange = (field: 'storeName' | 'storeZip' | 'purchasePrice', val: string) => {
        onChange({
            ...plant,
            [field]: field === 'purchasePrice' ? parseFloat(val) : val
        });
    };

    return (
        <div className="group relative bg-white border border-zinc-200 rounded-xl p-4 transition-all hover:border-zinc-300 hover:shadow-sm">
            {/* Header Row: Name & Remove */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700">
                        <Sprout size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-zinc-900">{plant.name}</div>
                        {plant.botanicalName && (
                            <div className="text-xs text-zinc-500 italic">{plant.botanicalName}</div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onRemove(plant.id)}
                    className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Main Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">

                {/* Size Selector */}
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Starter Size</label>
                    <select
                        className="w-full h-9 px-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                        value={plant.potSize || ""}
                        onChange={(e) => handleSizeChange(e.target.value)}
                    >
                        <option value="" disabled>Select Size...</option>
                        <option value="seed">Seed/Packet</option>
                        <option value="plug">Seedling/Plug</option>
                        <option value="4in">4-inch Pot</option>
                        <option value="1g">#1 (1 Gal)</option>
                        <option value="2g">#2 (2 Gal)</option>
                        <option value="3g">#3 (3 Gal)</option>
                        <option value="5g">#5 (5 Gal)</option>
                        <option value="7g+">#7 (7 Gal)+</option>
                        <option value="bb">Ball & Burlap</option>
                    </select>
                </div>

                {/* Status Toggle */}
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Current Planting Status</label>
                    <div className="flex bg-zinc-100 rounded-lg p-1 h-9 items-center relative z-0">
                        {/* Sliding Background */}
                        <div className={cn(
                            "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-all duration-200 z-0",
                            isPlanted ? "left-[calc(50%+2px)]" : "left-1"
                        )} />

                        <button
                            type="button"
                            onClick={() => handleStatusToggle(false)}
                            className={cn(
                                "flex-1 text-center text-xs font-semibold relative z-10 transition-colors",
                                !isPlanted ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <span className="relative z-10">Pending</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleStatusToggle(true)}
                            className={cn(
                                "flex-1 text-center text-xs font-semibold relative z-10 transition-colors",
                                isPlanted ? "text-green-700" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <span className="relative z-10">Planted</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Picker (Conditional) */}
            {isPlanted && (
                <div className="mb-3 animate-in fade-in slide-in-from-top-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-9 bg-white border-zinc-200",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                                <span className="text-sm">
                                    {date ? format(date, "PPP") : "Pick planting date"}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                initialFocus
                                disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            )}

            {/* Details Toggle */}
            <div className="border-t border-zinc-100 pt-2">
                <button
                    type="button"
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 font-medium w-full"
                >
                    {detailsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Purchase Details <span className="font-normal opacity-50">(Optional)</span>
                </button>

                {detailsOpen && (
                    <div className="pt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 relative">
                                <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    placeholder="Store Name"
                                    className="h-8 text-xs pl-8"
                                    value={plant.storeName || ""}
                                    onChange={(e) => handleStoreChange('storeName', e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    placeholder="Store Zip"
                                    className="h-8 text-xs pl-8"
                                    value={plant.storeZip || ""}
                                    onChange={(e) => handleStoreChange('storeZip', e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    className="h-8 text-xs pl-8"
                                    value={plant.purchasePrice || ""}
                                    onChange={(e) => handleStoreChange('purchasePrice', e.target.value)}
                                    min="0" step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
