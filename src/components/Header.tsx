"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "BetterRoots" }: HeaderProps) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <header className="w-full py-4 px-6 bg-green-900 text-white shadow-md flex items-center justify-between sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="bg-white p-1 rounded-full">
                    <Sprout size={24} className="text-green-900" />
                </div>
                <h1 className="font-serif text-xl font-bold tracking-wide">{title}</h1>
            </Link>

            {!isHome && (
                <nav className="flex items-center gap-4 md:gap-8 text-sm font-medium">
                    <Link href="/intake" className="hover:text-green-200 transition-colors">
                        Add New Plants
                    </Link>
                    <Link href="/dashboard" className="hover:text-green-200 transition-colors">
                        My Garden
                    </Link>
                    <Link href="/feedback" className="hover:text-green-200 transition-colors">
                        Feedback
                    </Link>
                </nav>
            )}
        </header>
    );
}
