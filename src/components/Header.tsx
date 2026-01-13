import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Header() {
    return (
        <header style={{
            backgroundColor: "var(--color-green-800)",
            color: "var(--color-white)",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            <Link href="/" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sprout size={24} />
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: "bold" }}>BetterRoots</span>
            </Link>

            <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <Link href="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>My Garden</Link>
                <Link href="/intake" style={{ textDecoration: "none", color: "white", fontWeight: 500 }}>Scan Receipt</Link>
            </nav>
        </header>
    );
}
