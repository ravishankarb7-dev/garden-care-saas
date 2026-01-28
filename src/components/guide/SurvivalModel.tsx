"use client";

import { motion } from "framer-motion";

export default function SurvivalModel() {
    const milestones = [
        { day: 0, label: "Transplant Shock", desc: "High Vulnerability", color: "bg-slate-600" },
        { day: 14, label: "Root Establishment", desc: "Stabilization", color: "bg-slate-400" },
        { day: 28, label: "Seasonal Transition", desc: "Standard Care Begins", color: "bg-emerald-600" },
    ];

    return (
        <div className="relative py-12 px-2 overflow-hidden">
            {/* Timeline Rail */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block" />

            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10 font-sans">
                {milestones.map((m, idx) => (
                    <div
                        key={idx}
                        className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 md:text-center"
                    >
                        <div className={`w-10 h-10 rounded-full ${m.color} text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm ring-4 ring-white border border-slate-100`}>
                            {m.day}
                        </div>
                        <div className="flex flex-col md:items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Day {m.day}</span>
                            <h4 className="font-semibold text-slate-800 text-base">{m.label}</h4>
                            <p className="text-sm text-slate-500">{m.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Vertical Line */}
            <div className="absolute top-4 bottom-4 left-[1.75rem] w-0.5 bg-slate-200 -z-10 md:hidden" />

            <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 italic max-w-2xl mx-auto">
                    * RootCause prioritizes restraint during early planting stress. Inaction is often the safest action.
                </p>
            </div>
        </div>
    );
}
