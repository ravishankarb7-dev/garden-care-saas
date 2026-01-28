"use client";

import { motion } from "framer-motion";
import { Sprout, CloudSun, Settings, ClipboardCheck, ArrowRight, ShieldCheck } from "lucide-react";

export default function SystemOverview() {
    const steps = [
        { icon: <Sprout size={18} />, label: "Add Plants", color: "bg-slate-100 text-slate-700 border-slate-200" },
        { icon: <CloudSun size={18} />, label: "Site Conditions", color: "bg-slate-100 text-slate-700 border-slate-200" },
        { icon: <Settings size={18} />, label: "Decision Engine", color: "bg-slate-100 text-slate-700 border-slate-200" },
        { icon: <ClipboardCheck size={18} />, label: "Daily Protocol", color: "bg-slate-100 text-slate-700 border-slate-200" },
    ];

    return (
        <section className="py-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Process Flow</h3>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4 w-full md:w-auto">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm w-full md:w-auto ${step.color}`}
                        >
                            <div className={`p-1.5 rounded bg-white border border-slate-100 shadow-sm text-slate-500`}>
                                {step.icon}
                            </div>
                            <span className="font-semibold text-sm whitespace-nowrap text-slate-700">{step.label}</span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div className="hidden md:block text-slate-300">
                                <ArrowRight size={16} />
                            </div>
                        )}
                        {idx < steps.length - 1 && (
                            <div className="md:hidden flex h-6 w-0.5 bg-slate-200 mx-auto my-1"></div>
                        )}
                    </div>
                ))}
                <div className="hidden md:block text-slate-300">
                    <ArrowRight size={16} />
                </div>
                <div className="md:hidden flex h-6 w-0.5 bg-slate-200 mx-auto my-1"></div>

                {/* Final Success Node */}
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-slate-800 shadow-sm w-full md:w-auto border border-emerald-200 ring-1 ring-emerald-50"
                >
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <span className="font-semibold text-sm">Reduced Failure Risk</span>
                </div>
            </div>
        </section>
    );
}
