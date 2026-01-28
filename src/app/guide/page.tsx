"use client";

import Header from '@/components/Header';
import { Sprout, ShieldCheck, BookOpen, AlertTriangle, Leaf } from 'lucide-react';
import SystemOverview from '@/components/guide/SystemOverview';
import SurvivalModel from '@/components/guide/SurvivalModel';
import PrivacyFlow from '@/components/guide/PrivacyFlow';
import IntakeStepper from '@/components/guide/IntakeStepper';
import CareEngine from '@/components/guide/CareEngine';
import CarePausedAlert from '@/components/guide/CarePausedAlert';

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">

                {/* HERO SECTION - RESTRAINED */}
                <header className="mb-16 border-b border-slate-100 pb-12">
                    <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold uppercase tracking-widest text-xs">
                        <Leaf size={14} />
                        <span>Field Manual v1.0</span>
                    </div>
                    <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight leading-tight">
                        How RootCause Protects New Plants
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        A simple guide to the first 28 days after planting — when mistakes matter most.
                    </p>
                </header>

                <div className="space-y-24">

                    {/* SECTION 1: SYSTEM OVERVIEW (Simplified) */}
                    <section>
                        <h2 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                            1. The Protection System
                        </h2>
                        <SystemOverview />
                    </section>

                    {/* SECTION 2: SURVIVAL TIMELINE (Clarified) */}
                    <section>
                        <h2 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                            2. The 28-Day Critical Phase
                        </h2>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-8">
                            <p className="text-slate-600 mb-8 max-w-3xl text-sm leading-relaxed">
                                Most plants fail because they are pushed for growth before they have roots. This system focuses <strong>only on early establishment</strong>. Long-term yield comes later.
                            </p>
                            <SurvivalModel />
                        </div>
                    </section>

                    {/* SECTION 3: INTAKE & IDENTITY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-slate-100 pt-16">

                        {/* INTAKE FLOW */}
                        <section>
                            <h3 className="font-bold text-slate-900 text-lg mb-6">
                                3. Plant Registration
                            </h3>
                            <IntakeStepper />
                        </section>

                        {/* PRIVACY FLOW */}
                        <section>
                            <h3 className="font-bold text-slate-900 text-lg mb-6">
                                4. Data Privacy Model
                            </h3>
                            <PrivacyFlow />
                        </section>
                    </div>

                    {/* SECTION 4: THE BRAIN (Tone Corrected) */}
                    <section className="border-t border-slate-100 pt-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg mb-6">5. The Care Engine</h2>
                                <p className="text-slate-500 leading-relaxed mb-6 text-sm">
                                    We query local weather data each morning to adjust care protocols. If conditions are unsafe, we prioritize survival over schedule.
                                </p>

                                <div className="mt-8">
                                    <h4 className="font-bold text-slate-700 text-sm mb-4">
                                        Active Protection Example:
                                    </h4>
                                    <CarePausedAlert />
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-700 text-sm mb-4">
                                    Decision Logic:
                                </h4>
                                <CareEngine />
                            </div>
                        </div>
                    </section>

                    {/* FOOTER CTA (Calm) */}
                    <section className="text-center max-w-xl mx-auto py-12 border-t border-slate-100 mt-12">
                        <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-4" />
                        <h4 className="font-serif text-lg text-slate-700 mb-2">Ready to begin?</h4>
                        <p className="text-slate-500 text-sm mb-6">
                            Add your first plant to begin care tracking. The system will guide decisions as conditions change.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
