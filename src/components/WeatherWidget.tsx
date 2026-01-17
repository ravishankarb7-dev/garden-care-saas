"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, CloudSnow, CloudFog, CloudLightning, Wind, Thermometer, Loader2, AlertTriangle, CloudSun } from "lucide-react";
import { WeatherData, WeatherAlert } from "@/lib/weather";

interface WeatherWidgetProps {
    zipCode: string;
}

export default function WeatherWidget({ zipCode }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Mapping icons from our NWS helper "iconCode" to Lucide
    const getIcon = (code: string) => {
        switch (code) {
            case 'rain': return <CloudRain size={32} className="text-blue-500" />;
            case 'snow': return <CloudSnow size={32} className="text-sky-300" />;
            case 'thunder': return <CloudLightning size={32} className="text-yellow-600" />;
            case 'fog': return <CloudFog size={32} className="text-gray-400" />;
            case 'cloudy': return <Cloud size={32} className="text-gray-500" />;
            case 'partly-cloudy': return <CloudSun size={32} className="text-yellow-500" />;
            case 'clear': return <Sun size={32} className="text-yellow-400" />;
            default: return <Sun size={32} className="text-yellow-500" />;
        }
    };

    const getBackground = (code: string) => {
        switch (code) {
            case 'rain': return 'bg-blue-600/10';
            case 'snow': return 'bg-sky-100';
            case 'thunder': return 'bg-gray-200';
            case 'fog': return 'bg-gray-100';
            case 'cloudy': return 'bg-gray-100';
            case 'partly-cloudy': return 'bg-orange-50';
            case 'clear': return 'bg-yellow-50/50';
            default: return 'bg-yellow-50/50'; // warm default
        }
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/weather?zip=${zipCode}`);
                if (!res.ok) {
                    // Try to parse error
                    try {
                        const err = await res.json();
                        throw new Error(err.error || 'Weather unavailable');
                    } catch {
                        throw new Error(`Weather check failed (${res.status})`);
                    }
                }
                const data: WeatherData = await res.json();
                setWeather(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (zipCode && zipCode.length === 5) {
            load();
        }
    }, [zipCode]);


    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-48 animate-pulse">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="animate-spin" size={16} />
                    Checking NWS forecast for {zipCode}...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center h-48">
                <div className="text-center text-red-500">
                    <AlertTriangle size={24} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Weather Unavailable</p>
                    <p className="text-xs opacity-75">{error}</p>
                    <p className="text-[10px] mt-2 text-gray-400">Zip: {zipCode}</p>
                </div>
            </div>
        );
    }

    if (!weather) return null;

    // Prioritize Alerts
    const hasAlerts = weather.alerts && weather.alerts.length > 0;
    const priorityEvent = hasAlerts ? weather.alerts[0] : null;

    // Is it bad weather? (Rain, Snow, Extreme Heat/Cold logic could go here)
    const isRainy = weather.iconCode === 'rain' || weather.iconCode === 'thunder';

    return (
        <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md bg-white`}>
            {/* dynamic bg accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${getBackground(weather.iconCode)}`}></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Current Conditions</h3>
                        <div className="text-xl font-bold text-gray-900 flex items-center gap-2 font-serif">
                            {weather.city}
                            <span className="text-gray-300 font-sans text-sm font-normal">({zipCode})</span>
                        </div>
                    </div>
                    {getIcon(weather.iconCode)}
                </div>

                {/* Main Stats */}
                <div className="flex items-end gap-4 mb-6">
                    <div className="text-5xl font-bold text-gray-900 tracking-tight">{weather.temp}°</div>
                    <div className="mb-2">
                        <div className="text-gray-900 font-medium capitalize">{weather.condition}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Wind size={12} /> {weather.windSpeed} mph
                        </div>
                    </div>
                </div>

                {/* Narrative / Alerts Section */}
                {hasAlerts && priorityEvent ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-red-900 text-sm mb-1">
                                {priorityEvent.event === "Special Weather Statement" ? "Atmospheric Advice" : priorityEvent.event}
                            </div>
                            <p className="text-red-800 text-xs leading-relaxed line-clamp-3">
                                {priorityEvent.description || priorityEvent.headline}
                            </p>
                            {priorityEvent.instruction && (
                                <p className="mt-1 text-[10px] font-semibold text-red-700 uppercase tracking-wide">
                                    Action: {priorityEvent.instruction.slice(0, 60)}...
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    // Standard Advice
                    <div className={`rounded-xl p-3 flex items-start gap-3 border ${isRainy ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                        {isRainy ? <CloudRain size={20} className="text-blue-500 mt-1" /> : <Sun size={20} className="text-green-600 mt-1" />}
                        <div>
                            <div className={`font-bold text-sm mb-1 ${isRainy ? 'text-blue-900' : 'text-green-900'}`}>
                                {isRainy ? "Nature is watering today" : "Good growing weather"}
                            </div>
                            <p className={`text-xs leading-relaxed ${isRainy ? 'text-blue-800' : 'text-green-800'}`}>
                                {isRainy
                                    ? "Rain is in the forecast. You can likely skip manual watering."
                                    : "No active alerts. Stick to your regular care schedule."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

