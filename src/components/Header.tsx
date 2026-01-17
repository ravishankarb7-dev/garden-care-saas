import { useState } from "react";
import Link from "next/link";
import { Sprout, Menu, X, MessageSquarePlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "BetterRoots" }: HeaderProps) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="w-full bg-green-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-white p-1 rounded-full">
                        <Sprout size={24} className="text-green-900" />
                    </div>
                    <h1 className="font-serif text-xl font-bold tracking-wide">{title}</h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/dashboard" className="hover:text-green-200 transition-colors">
                        Your Canopy
                    </Link>
                    <Link href="/intake" className="hover:text-green-200 transition-colors">
                        Welcome a Newcomer
                    </Link>
                    <Link href="/feedback" className="text-green-200 hover:text-white transition-colors" title="Petals & Prickles">
                        <MessageSquarePlus size={20} />
                    </Link>
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
                    <Link
                        href="/dashboard"
                        className="py-3 text-lg font-bold border-b border-green-800 hover:text-green-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Your Canopy
                    </Link>
                    <Link
                        href="/intake"
                        className="py-3 text-lg font-bold border-b border-green-800 hover:text-green-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Welcome a Newcomer
                    </Link>
                    <Link
                        href="/feedback"
                        className="py-3 text-lg font-bold hover:text-green-200 flex items-center gap-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <MessageSquarePlus size={20} />
                        Petals & Prickles
                    </Link>
                </div>
            )}
        </header>
    );
}
