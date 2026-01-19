import { Flame, Leaf, Trophy } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface GamificationHUDProps {
    xp: number;
    level: number;
    streak: number;
}

export function GamificationHUD({ xp, level, streak }: GamificationHUDProps) {
    // Level Calculations
    const levels = [
        { lvl: 1, min: 0, max: 200, name: "Seedling" },
        { lvl: 2, min: 200, max: 600, name: "Sprout" },
        { lvl: 3, min: 600, max: 1500, name: "Budding" },
        { lvl: 4, min: 1500, max: 2500, name: "Bloomer" },
        { lvl: 5, min: 2500, max: 10000, name: "Master" },
    ];

    const currentLevel = levels.find(l => l.lvl === level) || levels[0];
    const nextLevel = levels.find(l => l.lvl === level + 1);

    // Progress Calculation
    // XP within current level
    const levelStart = currentLevel.min;
    const levelEnd = nextLevel ? nextLevel.min : currentLevel.max;
    const levelRange = levelEnd - levelStart;
    const xpInLevel = xp - levelStart;
    const progress = Math.min(100, Math.max(0, (xpInLevel / levelRange) * 100));

    return (
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-emerald-100 rounded-full pl-2 pr-4 py-1 shadow-sm">
            {/* Level Badge */}
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
                {level}
            </div>

            {/* Info & Bar */}
            <div className="flex flex-col justify-center min-w-[100px]">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-0.5">
                    <span>{currentLevel.name}</span>
                    <span className="text-emerald-400">{xp} XP</span>
                </div>
                <div className="h-1.5 bg-emerald-100 rounded-full w-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
                <div className="flex items-center gap-1 pl-2 border-l border-emerald-100 mobile-hide">
                    <Flame size={14} className={streak >= 7 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-orange-400"} />
                    <span className="text-xs font-bold text-orange-600">{streak}</span>
                </div>
            )}
        </div>
    );
}
