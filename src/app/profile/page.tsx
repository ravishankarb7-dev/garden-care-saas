"use client";

import { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import { getOrCreateDeviceId, saveDeviceId, isValidGardenCode } from "@/lib/device";
import { getUserStats, UserStats } from "@/lib/queries";
import { Trophy, Flame, Sprout, Medal, Lock, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function ProfileContent() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    // Badges Definition (Static for now, unlocks dynamic)
    const ALL_BADGES = [
        { id: 'first_bloom', name: 'First Bloomer', desc: 'Added your first plant.', icon: Sprout, xp: 50 },
        { id: 'journalist', name: 'The Journalist', desc: 'Wrote a detailed care note.', icon: Star, xp: 20 },
        { id: 'streak_7', name: 'Week Warrior', desc: '7-Day Care Streak.', icon: Flame, xp: 100 },
        { id: 'survivor_28', name: 'Survivor', desc: 'Kept a plant alive for 28 days.', icon: Medal, xp: 200 },
        { id: 'master', name: 'Groundskeeper', desc: 'Reached Level 5.', icon: Trophy, xp: 500 },
    ];

    useEffect(() => {
        async function load() {
            let id = searchParams.get('id');
            if (id && isValidGardenCode(id)) {
                saveDeviceId(id);
            } else {
                id = getOrCreateDeviceId();
            }

            const data = await getUserStats(id || "guest");
            setStats(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!stats) return null;

    // Level Calc (Duplicate logic for visualization)
    const levels = [
        { lvl: 1, min: 0, max: 200, name: "Seedling" },
        { lvl: 2, min: 200, max: 600, name: "Sprout" },
        { lvl: 3, min: 600, max: 1500, name: "Budding Gardener" },
        { lvl: 4, min: 1500, max: 2500, name: "Bloomer" },
        { lvl: 5, min: 2500, max: 10000, name: "Master Groundskeeper" },
    ];
    const currentLevel = levels.find(l => l.lvl === stats.level) || levels[0];
    const nextLevel = levels.find(l => l.lvl === stats.level + 1);

    const levelStart = currentLevel.min;
    const levelEnd = nextLevel ? nextLevel.min : currentLevel.max;
    const progress = Math.min(100, Math.max(0, ((stats.xp - levelStart) / (levelEnd - levelStart)) * 100));

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold font-serif text-zinc-900 mb-2 flex items-center gap-3">
                    <Trophy className="text-amber-500" />
                    Trophy Shed
                </h1>
                <p className="text-zinc-500 mb-8">Your gardening achievements and progress.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Identity Card */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="p-6 border-zinc-200 bg-white shadow-sm text-center">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700 font-bold text-3xl border-4 border-white shadow-md">
                                {stats.level}
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 mb-1">{currentLevel.name}</h2>
                            <p className="text-emerald-600 font-bold mb-6">{stats.xp} XP</p>

                            <div className="text-left mb-1 flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{nextLevel ? `${nextLevel.min - stats.xp} to Lvl ${nextLevel.lvl}` : 'Max Level'}</span>
                            </div>
                            <Progress value={progress} className="h-3 mb-6" />

                            <div className="bg-zinc-50 rounded-lg p-4 flex items-center justify-center gap-3 border border-zinc-100">
                                <Flame className={stats.streak_days > 0 ? "text-orange-500 fill-orange-500" : "text-zinc-300"} />
                                <div className="text-left">
                                    <div className="text-xs text-zinc-400 font-bold uppercase">Current Streak</div>
                                    <div className="text-zinc-900 font-bold">{stats.streak_days} Days</div>
                                </div>
                            </div>
                        </Card>

                        <Link href="/dashboard">
                            <Button variant="outline" fullWidth className="border-zinc-200 text-zinc-600">
                                Return to Garden
                            </Button>
                        </Link>
                    </div>

                    {/* Right Column: Badges */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Badges</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {ALL_BADGES.map((badge) => {
                                const isUnlocked = stats.badges?.includes(badge.id) ||
                                    (badge.id === 'first_bloom' && stats.xp >= 50) || // Fallback logic if badges array empty
                                    (badge.id === 'master' && stats.level >= 5);

                                return (
                                    <div
                                        key={badge.id}
                                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${isUnlocked
                                                ? 'bg-white border-emerald-100 shadow-sm'
                                                : 'bg-zinc-50 border-zinc-100 opacity-60'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${isUnlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-200 text-zinc-400'
                                            }`}>
                                            {isUnlocked ? <badge.icon size={24} /> : <Lock size={24} />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${isUnlocked ? 'text-zinc-900' : 'text-zinc-500'}`}>
                                                {badge.name}
                                            </h4>
                                            <p className="text-sm text-zinc-500 leading-snug mb-1">{badge.desc}</p>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60">
                                                +{badge.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading Trophy Shed...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
