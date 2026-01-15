"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";

export default function FeedbackPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, send to API
        await new Promise(r => setTimeout(r, 1000));
        setSubmitted(true);
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-cream)" }}>
            <Header />

            <main className="max-w-[800px] mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-green-900 mb-4">
                        We'd Love Your Feedback
                    </h1>
                    <p className="text-lg text-gray-600">
                        Help us help your garden grow better.
                    </p>
                </div>

                {submitted ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-sage-100 text-center">
                        <div className="text-5xl mb-4">🌿</div>
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h2>
                        <p className="text-gray-600 mb-6">Your feedback has been received.</p>
                        <Button onClick={() => setSubmitted(false)}>Send Another</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-sage-100">
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Feedback</label>
                            <textarea
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Tell us what you like or what we can improve..."
                            />
                        </div>

                        <Button type="submit" fullWidth size="lg">Submit Feedback</Button>
                    </form>
                )}
            </main>
        </div>
    );
}
