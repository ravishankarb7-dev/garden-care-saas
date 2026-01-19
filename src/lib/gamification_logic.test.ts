import { describe, it, expect } from 'vitest';
import { calculateLevel, calculateWordCountXP, calculateNewStreak } from './gamification_logic';

describe('Gamification Logic', () => {

    describe('calculateLevel', () => {
        it('should start at Level 1 for 0 XP', () => {
            expect(calculateLevel(0)).toBe(1);
        });

        it('should remain Level 1 up to 199 XP', () => {
            expect(calculateLevel(199)).toBe(1);
        });

        it('should promote to Level 2 at 200 XP', () => {
            expect(calculateLevel(200)).toBe(2);
        });

        it('should promote to Level 3 at 600 XP', () => {
            expect(calculateLevel(600)).toBe(3);
        });

        it('should promote to Level 4 at 1500 XP', () => {
            expect(calculateLevel(1500)).toBe(4);
        });

        it('should reach Master (Level 5) at 2500 XP', () => {
            expect(calculateLevel(2500)).toBe(5);
        });

        it('should handle very high XP', () => {
            expect(calculateLevel(100000)).toBe(5);
        });

        it('should handle negative input gracefully (Edge Case)', () => {
            expect(calculateLevel(-50)).toBe(1);
        });
    });

    describe('calculateWordCountXP (Journalist Score)', () => {
        it('should return 0 for empty or null notes', () => {
            expect(calculateWordCountXP("")).toBe(0);
            expect(calculateWordCountXP("   ")).toBe(0);
            expect(calculateWordCountXP(null)).toBe(0);
            expect(calculateWordCountXP(undefined)).toBe(0);
        });

        it('should return Scribble Bonus (5 XP) for short notes (< 5 words)', () => {
            expect(calculateWordCountXP("Good")).toBe(5);
            expect(calculateWordCountXP("1 2 3 4")).toBe(5);
        });

        it('should return Field Report Bonus (20 XP) for 5-19 words', () => {
            expect(calculateWordCountXP("one two three four five")).toBe(20);
            const nineteen = new Array(19).fill("word").join(" ");
            expect(calculateWordCountXP(nineteen)).toBe(20);
        });

        it('should return Master Bonus (40 XP) for 20+ words', () => {
            const twenty = new Array(20).fill("word").join(" ");
            expect(calculateWordCountXP(twenty)).toBe(40);
        });

        it('should ignore multiple spaces', () => {
            expect(calculateWordCountXP("word1   word2")).toBe(5); // 2 words, not 4
        });
    });

    describe('calculateNewStreak', () => {
        const TODAY = "2026-05-20";
        const YESTERDAY = "2026-05-19";
        const DAY_BEFORE = "2026-05-18";

        it('should start streak at 1 if no history', () => {
            expect(calculateNewStreak(0, null, TODAY)).toBe(1);
        });

        it('should increment streak if last active was yesterday', () => {
            expect(calculateNewStreak(5, YESTERDAY, TODAY)).toBe(6);
        });

        it('should maintain streak if already active today (Idempotency)', () => {
            expect(calculateNewStreak(5, TODAY, TODAY)).toBe(5);
        });

        it('should reset streak to 1 if last active was day before yesterday (Missed Day)', () => {
            expect(calculateNewStreak(10, DAY_BEFORE, TODAY)).toBe(1);
        });

        it('should reset streak to 1 if last active was very old', () => {
            expect(calculateNewStreak(10, "2020-01-01", TODAY)).toBe(1);
        });
    });

});
