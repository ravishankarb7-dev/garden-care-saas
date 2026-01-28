"use client";

import { Droplets, Check, Utensils, Scissors, CloudRain, AlertCircle } from "lucide-react";

export default function CareEngine() {
    return (
        <div className="space-y-6">

            {/* Logic Header */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b border-slate-200 pb-4">
                <span className="font-semibold text-slate-700">Sequence:</span>
                <span className="flex items-center gap-2">
                    <CloudRain size={14} /> Weather Analysis
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                    <AlertCircle size={14} /> Stress Check
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                    <Utensils size={14} /> Action Assignment
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Allowed (Safe) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allowed Actions (Monitoring)</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 text-slate-700 font-semibold text-sm">
                            <Check size={16} className="text-emerald-600" /> Observation
                        </div>
                        <p className="text-xs text-slate-500">Check soil moisture, look for pests, log daily notes.</p>
                    </div>
                </div>

                {/* 2. Conditional (Check First) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conditional Actions</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 text-slate-700 font-semibold text-sm">
                            <Droplets size={16} className="text-blue-600" /> Watering
                        </div>
                        <p className="text-xs text-slate-500">Only if soil indicates dryness. Never purely on schedule.</p>
                    </div>
                </div>

                {/* 3. Discouraged (High Risk) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discouraged Actions</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm opacity-75">
                        <div className="flex items-center gap-2 mb-1 text-slate-600 font-semibold text-sm">
                            <Utensils size={16} className="text-slate-400" /> Fertilizing
                        </div>
                        <p className="text-xs text-slate-400">Risk of root burn during establishment.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm opacity-75">
                        <div className="flex items-center gap-2 mb-1 text-slate-600 font-semibold text-sm">
                            <Scissors size={16} className="text-slate-400" /> Pruning
                        </div>
                        <p className="text-xs text-slate-400">Avoid removing foliage unless diseased.</p>
                    </div>
                </div>

            </div>

            <p className="text-xs text-slate-400 italic text-center pt-2">
                * Static schedules often ignore real weather conditions. This engine adapts dynamically.
            </p>
        </div>
    );
}
