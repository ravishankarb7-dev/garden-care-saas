"use client";

import { useEffect, useState } from "react";
import { TimelineEvent } from "@/lib/reporting";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface CycleAutopsyReportProps {
    sessionId: string;
    plantName: string;
    onClose?: () => void;
}

export default function CycleAutopsyReport({ sessionId, plantName, onClose }: CycleAutopsyReportProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        if (!sessionId) return;

        async function fetchHistory() {
            try {
                // Dynamically import to separate heavy logic
                const { getPlantHistory } = await import("@/lib/reporting");
                const history = await getPlantHistory(sessionId);
                if (mounted) setEvents(history);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchHistory();

        return () => { mounted = false; };
    }, [sessionId]);

    if (loading) {
        return <div className="p-8 text-center text-zinc-500 animate-pulse">Generating Report...</div>;
    }

    if (events.length === 0) {
        return <div className="p-8 text-center text-zinc-500">No history found for this plant.</div>;
    }

    const plantedEvent = events.find(e => e.type === 'PLANTED');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata: any = plantedEvent?.metadata || {};

    return (
        <Card className="h-full border-0 shadow-none flex flex-col bg-white print-container">
            <style jsx global>{`
                @media print {
                    /* Strict hiding of all body content */
                    body {
                        visibility: hidden;
                        height: auto;
                        overflow: visible;
                    }
                    /* Ensure no other fixed elements interfere */
                    * {
                        position: static !important;
                    }
                
                    /* Restore our container */
                    .print-container {
                        visibility: visible !important;
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        z-index: 2147483647 !important; /* Max Z-Index */
                        background: white !important;
                        overflow: visible !important;
                    }
                    
                    /* Restore visibility of children of print container */
                    .print-container * {
                        visibility: visible !important;
                        position: static !important; 
                        /* Re-enable flex/grid inside if needed, but 'static' on * above kills them. 
                           We need to be specific or not use universal selector above.
                           Better strategy below:
                        */
                    }
                }
            `}</style>

            {/* Improved Print Styles V2 */}
            <style jsx global>{`
                @media print {
                    /* Hide everything */
                    body * {
                        visibility: hidden;
                    }
                    /* Kill fixed positioning on all parents to prevent repeating pages 
                       DialogContent usually has fixed/absolute.
                    */
                    [role="dialog"], [data-state="open"] {
                        position: static !important;
                        transform: none !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        height: auto !important;
                        max-width: none !important;
                    }
                    
                    /* Show Container */
                    .print-container, .print-container * {
                        visibility: visible !important;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        background: white;
                    }
                    .no-print { display: none !important; }
                    
                    /* Ensure flex works */
                    .flex { display: flex !important; }
                    .grid { display: grid !important; }
                }
            `}</style>

            <CardHeader className="pb-4 border-b border-zinc-100 flex-shrink-0 print-area">
                <div className="flex items-start justify-between">
                    <div>
                        {/* BRANDING HEADER */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 relative">
                                <img src="/logo.png" alt="RootCause Logo" className="object-contain w-full h-full" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-zinc-900 leading-none">RootCause</h1>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Professional Garden Care</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-2xl font-serif font-bold text-zinc-900">Lifecycle Report</CardTitle>
                            <span className="bg-zinc-100 text-zinc-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-zinc-200">
                                Final Record
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4">Subject: <span className="font-semibold text-zinc-900">{metadata.skuName || metadata.categoryName || plantName}</span></p>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-xs text-zinc-500 border-t border-dashed border-zinc-200 pt-3">
                            <div>
                                <span className="block font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Source</span>
                                <span className="text-zinc-900 font-medium">{metadata.store || "Not Recorded"}</span>
                            </div>
                            <div>
                                <span className="block font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Purchased</span>
                                <span className="text-zinc-900 font-medium">
                                    {metadata.purchaseDate ? new Date(metadata.purchaseDate).toLocaleDateString() : "Unknown"}
                                </span>
                            </div>
                            <div>
                                <span className="block font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Starter Size</span>
                                <span className="text-zinc-900 font-medium">{metadata.size || "Unknown"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 no-print">
                        <button
                            onClick={() => window.print()}
                            className="text-xs font-bold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 transition-colors"
                        >
                            Print / PDF
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full">
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 overflow-y-auto max-h-[60vh] pr-4 print:overflow-visible print:max-h-none print:pr-0">
                <div className="relative border-l-2 border-zinc-100 ml-3 space-y-10 pb-8">
                    {events.map((evt, idx) => (
                        <div key={idx} className="relative pl-8 break-inside-avoid">
                            {/* Icon Bubble */}
                            <div className={cn(
                                "absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs print:border-zinc-300",
                                evt.severity === 'critical' ? "bg-red-500 text-white print:text-black print:bg-white" :
                                    evt.severity === 'warning' ? "bg-amber-500 text-white print:text-black print:bg-white" :
                                        evt.severity === 'success' ? "bg-green-500 text-white print:text-black print:bg-white" :
                                            "bg-zinc-200 text-zinc-600 print:text-black print:bg-white"
                            )}>
                                {evt.icon || "•"}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider print:text-zinc-600">
                                        {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase print:border print:border-zinc-200 print:bg-transparent print:text-zinc-600",
                                        evt.type === 'WEATHER' ? "bg-blue-50 text-blue-600" :
                                            evt.type === 'OUTCOME' ? "bg-zinc-900 text-white" :
                                                "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {evt.type}
                                    </span>
                                </div>
                                <h4 className={cn(
                                    "font-serif font-bold text-sm print:text-black",
                                    evt.severity === 'critical' ? "text-red-700" :
                                        evt.severity === 'warning' ? "text-amber-700" :
                                            "text-zinc-900"
                                )}>
                                    {evt.title}
                                </h4>
                                <p className="text-sm text-zinc-600 leading-relaxed print:text-zinc-800">
                                    {evt.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
