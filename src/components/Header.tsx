"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sprout, Menu, X, MessageSquarePlus, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getGardenHistory, saveDeviceId, SavedGarden } from "@/lib/device";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "RootCause" }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Canopy Dropdown
    const [history, setHistory] = useState<SavedGarden[]>([]);
    const [isCanopyOpen, setIsCanopyOpen] = useState(false);

    useEffect(() => {
        setHistory(getGardenHistory());
    }, []);

    const handleSwitchGarden = (id: string) => {
        saveDeviceId(id);
        setIsCanopyOpen(false);
        setIsMenuOpen(false);
        // Force refresh via window to ensure all client components pick up the new cookie/localstorage
        window.location.href = `/dashboard?id=${id}`;
    };

    return (
        <header className="w-full bg-green-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <img src="/logo-v3.png" alt="RootCause Logo" className="w-14 h-14 object-contain drop-shadow-sm" />
                    <h1 className="font-serif text-xl font-bold tracking-wide">{title}</h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium relative">

                    {/* My Canopy Dropdown */}
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1 hover:text-green-200 transition-colors focus:outline-none"
                            onClick={() => setIsCanopyOpen(!isCanopyOpen)}
                            onBlur={() => setTimeout(() => setIsCanopyOpen(false), 200)}
                        >
                            Your Canopy <ChevronDown size={14} />
                        </button>

                        {isCanopyOpen && history.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white text-zinc-800 rounded-lg shadow-xl border border-zinc-200 overflow-hidden py-1 z-50">
                                {history.map(garden => (
                                    <button
                                        key={garden.id}
                                        onClick={() => handleSwitchGarden(garden.id)}
                                        className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm flex flex-col"
                                    >
                                        <span className="font-bold">{garden.label}</span>
                                        <span className="text-xs text-zinc-400">ID: {garden.id}</span>
                                    </button>
                                ))}
                                <div className="border-t border-zinc-100 mt-1 pt-1">
                                    <Link href="/intake" className="block px-4 py-2 text-xs text-green-700 font-bold hover:bg-green-50">
                                        + Add New Garden
                                    </Link>
                                </div>
                            </div>
                        )}
                        {/* Fallback for empty history: navigate to dashboard */}
                        {isCanopyOpen && history.length === 0 && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white text-zinc-800 rounded-lg shadow-xl border border-zinc-200 py-1 z-50">
                                <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-green-50">
                                    Go to Dashboard
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link href="/intake" className="hover:text-green-200 transition-colors">
                        Welcome a Newcomer
                    </Link>
                    <button
                        onClick={() => window.dispatchEvent(new Event('open-sage-feedback'))}
                        className="text-green-200 hover:text-white transition-colors flex items-center gap-2"
                        title="Petals & Prickles (Feedback)"
                    >
                        <span className="hidden lg:inline text-sm font-medium">Petals & Prickles</span>
                        <MessageSquarePlus size={20} />
                    </button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white hover:text-green-200 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-green-900 border-t border-green-800 shadow-xl flex flex-col p-6 gap-4 animate-in slide-in-from-top-2">
                    <div className="border-b border-green-800 pb-2">
                        <div className="font-bold text-green-400 mb-2 text-sm uppercase">Switch Garden</div>
                        {history.length > 0 ? (
                            history.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => handleSwitchGarden(g.id)}
                                    className="block w-full text-left py-2 text-lg hover:text-green-200"
                                >
                                    {g.label} <span className="text-xs opacity-50 ml-2">({g.id})</span>
                                </button>
                            ))
                        ) : (
                            <Link href="/dashboard" className="block py-2 text-lg hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
                                Default Garden
                            </Link>
                        )}
                    </div>

                    <Link
                        href="/intake"
                        className="py-3 text-lg font-bold border-b border-green-800 hover:text-green-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Welcome a Newcomer
                    </Link>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            window.dispatchEvent(new Event('open-sage-feedback'));
                        }}
                        className="py-3 text-lg font-bold hover:text-green-200 flex items-center gap-2 w-full text-left"
                    >
                        <MessageSquarePlus size={20} />
                        Petals & Prickles
                    </button>
                </div>
            )}
        </header>
    );
}
