"use client";

import { ThermometerSnowflake, ShieldAlert } from "lucide-react";

export default function CarePausedAlert() {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col items-start gap-4 shadow-sm max-w-lg">
            <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-white rounded-md shadow-sm text-amber-600 border border-amber-100">
                    <ShieldAlert size={20} />
                </div>
                <div className="flex-grow">
                    <h4 className="text-sm font-bold text-amber-900">Protective Pause Active</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                        Conditions unsafe for standard care.
                    </p>
                </div>
                <div className="px-2 py-1 bg-white border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded tracking-wider">
                    Status: Holding
                </div>
            </div>

            <div className="w-full bg-white/50 rounded p-4 border border-amber-100/50">
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                    "Conditions are unsafe for intervention. Switching to <strong>Monitoring Mode</strong>. Active care (Watering, Feeding) is disabled to prevent stress."
                </p>
            </div>
        </div>
    );
}
