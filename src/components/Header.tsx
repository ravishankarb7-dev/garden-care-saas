import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Header() {
    return (
        <header className="bg-green-900 text-white px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between border-b-4 border-sage-500 shadow-lg">
            <Link href="/" className="flex items-center gap-3 no-underline text-white mb-3 md:mb-0 group">
                <div className="bg-white/10 p-2 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                    <Sprout size={24} color="var(--color-success)" />
                </div>
                <div className="flex flex-col">
                    <span className="font-serif text-xl md:text-2xl font-bold leading-none">BetterRoots</span>
                    <span className="text-xs text-sage-400 tracking-wider uppercase">Professional Garden Care</span>
                </div>
            </Link>

            <nav className="flex items-center gap-4 md:gap-8">
                <Link href="/dashboard" className="text-sage-100 no-underline font-medium text-sm md:text-base hover:text-white transition-colors">
                    My Garden
                </Link>
                <Link href="/intake" className="bg-sage-500 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors hover:bg-sage-400 no-underline">
                    Scan Receipt
                </Link>
            </nav>
        </header>
    );
}
