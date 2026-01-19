"use client";

import { useState } from "react";
import { AlertTriangle, Info, X, ThermometerSnowflake, Sprout } from "lucide-react";

export type AlertType = "WEATHER" | "TASK" | "SYSTEM";
export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

interface SageAlertBannerProps {
    type: AlertType;
    level: AlertLevel;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function SageAlertBanner({ type, level, message, actionLabel, onAction }: SageAlertBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    // Styles based on Level
    const styles = {
        INFO: "bg-blue-50 text-blue-900 border-b border-blue-200",
        WARNING: "bg-amber-50 text-amber-900 border-b border-amber-200",
        CRITICAL: "bg-red-50 text-red-900 border-b border-red-200"
    };

    // Icons based on Type
    const getIcon = () => {
        if (type === 'WEATHER') return <ThermometerSnowflake size={20} />;
        if (type === 'TASK') return <Sprout size={20} />;
        if (level === 'CRITICAL') return <AlertTriangle size={20} />;
        return <Info size={20} />;
    };

    return (
        <div className={`w-full px-4 py-3 flex items-center justify-between ${styles[level]} animate-in slide-in-from-top-2`}>
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/50 rounded-full">
                    {getIcon()}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1">
                    <span className="font-bold text-sm uppercase tracking-wider opacity-80">{type} ALERT:</span>
                    <span className="font-medium text-sm">{message}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="text-xs font-bold underline hover:opacity-80 transition-opacity"
                    >
                        {actionLabel}
                    </button>
                )}
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
