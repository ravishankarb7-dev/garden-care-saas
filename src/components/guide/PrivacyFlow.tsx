"use client";

import { Smartphone, Lock, Cloud, ArrowRight, ShieldCheck } from "lucide-react";

export default function PrivacyFlow() {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">

            <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <Smartphone size={32} className="text-slate-600" />
                </div>
                <div className="text-sm font-medium text-slate-600">Your Device</div>
            </div>

            <ArrowRight className="text-slate-300 hidden md:block" />
            <div className="w-0.5 h-8 bg-slate-300 md:hidden" />

            <div className="flex flex-col items-center gap-2">
                <div className="px-4 py-2 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-lg border border-emerald-200 text-sm shadow-sm flex items-center gap-2">
                    <Lock size={14} />
                    <span>RSC5</span>
                </div>
                <div className="text-xs font-medium text-emerald-700">Unique Garden Code</div>
            </div>

            <ArrowRight className="text-slate-300 hidden md:block" />
            <div className="w-0.5 h-8 bg-slate-300 md:hidden" />

            <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <Cloud size={32} className="text-blue-500" />
                    <div className="absolute inset-0 bg-blue-50 opacity-20"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Secure Cloud</div>
            </div>

            <div className="md:ml-8 pl-8 md:border-l border-slate-200 flex flex-col gap-1 items-center md:items-start mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 w-full md:w-auto">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <ShieldCheck size={18} />
                    <span>No Login Required</span>
                </div>
                <p className="text-xs text-slate-500 max-w-[200px]">
                    We don't want your email. We just want your plants to live.
                </p>
            </div>

        </div>
    );
}
