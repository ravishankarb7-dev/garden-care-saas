"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";

interface ReceiptLookupProps {
    onLookup: (receiptId: string) => void;
}

export default function ReceiptLookup({ onLookup }: ReceiptLookupProps) {
    const [receiptId, setReceiptId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (receiptId.trim()) {
            onLookup(receiptId.trim());
        }
    };

    return (
        <div className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Load existing garden
            </h2>
            <form onSubmit={handleSubmit} className="relative">
                <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                    type="text"
                    placeholder="e.g. X7K9"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value.toUpperCase())}
                    className="h-14 text-center text-lg tracking-widest uppercase font-mono placeholder:normal-case placeholder:tracking-normal placeholder:font-sans pl-12 pr-14 rounded-full border-gray-200 shadow-sm"
                    maxLength={6}
                />
                <Button
                    type="submit"
                    disabled={!receiptId.trim()}
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                >
                    <ArrowRight size={18} />
                </Button>
            </form>
            <p className="mt-3 text-sm text-gray-400">
                Your care schedule is linked to your unique receipt number.
            </p>
        </div>
    );
}
