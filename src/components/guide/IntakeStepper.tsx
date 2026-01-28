"use client";

import { ScanLine, Search, PenTool } from "lucide-react";

export default function IntakeStepper() {
    const steps = [
        {
            icon: <ScanLine size={20} />,
            title: "1. Scan Receipt (Beta)",
            desc: "Upload a photo. AI reads the species and text to auto-populate your garden.",
            badge: "Fastest"
        },
        {
            icon: <Search size={20} />,
            title: "2. Manual Search",
            desc: "Type a plant name (e.g. 'Rosemary'). Auto-complete matches against our species database.",
            badge: "Standard"
        }
    ];

    return (
        <div className="flex flex-col gap-8 relative max-w-md mx-auto lg:mx-0">
            {/* Vertical Line - Centered relative to w-14 (56px) icon -> 28px center - 1px width = 27px */}
            <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-slate-200 -z-10" />

            {steps.map((step, idx) => (
                <div key={idx} className="flex gap-5">
                    <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 z-10 text-emerald-600">
                        {step.icon}
                    </div>
                    <div className="pt-2">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-800 text-base">{step.title}</h4>
                            {step.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                                    {step.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            {step.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
