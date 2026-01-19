"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { Sprout, Calendar, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-cream">
      <Header />

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-green-900 mb-6 leading-tight">
            The care manual nature forgot to pack. <br />
          </h1>
          <p className="text-xl text-gray-600">
            The only system that adapts to your local weather. Zero guesswork. 100% bloom guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">

          {/* Card 1: Add New Plants */}
          <Link href="/intake" className="group no-underline w-full">
            <div className="h-full bg-white p-10 rounded-3xl shadow-lg border border-sage-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-green-100 transition-colors">
                <Sprout size={48} className="text-green-700" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold font-serif text-green-900 mb-4 group-hover:text-green-700 transition-colors">
                Welcome a Newcomer
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Scan your receipt or manually add plants to get started.
              </p>
              <span className="mt-auto text-sm font-bold tracking-widest uppercase text-green-800 border-b border-green-200 pb-1 group-hover:border-green-600 transition-colors">
                Get Started
              </span>
            </div>
          </Link>

          {/* Card 2: My Garden */}
          <Link href="/dashboard" className="group no-underline w-full">
            <div className="h-full bg-white p-10 rounded-3xl shadow-lg border border-sage-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-blue-100 transition-colors">
                <Calendar size={48} className="text-blue-700" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold font-serif text-green-900 mb-4 group-hover:text-green-700 transition-colors">
                Tend Your Terrain
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                View your personalized schedule for watering & care.
              </p>
              <span className="mt-auto text-sm font-bold tracking-widest uppercase text-green-800 border-b border-green-200 pb-1 group-hover:border-green-600 transition-colors">
                View Dashboard
              </span>
            </div>
          </Link>

          {/* Card 3: Trophy Shed */}
          <Link href="/profile" className="group no-underline w-full">
            <div className="h-full bg-white p-10 rounded-3xl shadow-lg border border-sage-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-amber-100 transition-colors">
                <Trophy size={48} className="text-amber-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold font-serif text-green-900 mb-4 group-hover:text-amber-600 transition-colors">
                Trophy Shed
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                View your achievements, badges, and gardening stats.
              </p>
              <span className="mt-auto text-sm font-bold tracking-widest uppercase text-green-800 border-b border-green-200 pb-1 group-hover:border-green-600 transition-colors">
                View Profile
              </span>
            </div>
          </Link>

        </div>
      </section>
    </main>
  );
}
