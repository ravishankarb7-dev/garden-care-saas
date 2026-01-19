import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SmartCareNarrative from './SmartCareNarrative';

// Mock Lucide icons to avoid render issues in test env
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="sparkles-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    Sprout: () => <div data-testid="sprout-icon" />
}));

describe('SmartCareNarrative', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should disable care tasks (invoke onRiskChange) when Agent returns POSTPONE', async () => {
        // Mock fetch response
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    narrative: "Too cold to plant.",
                    action: "POSTPONE",
                    riskLevel: "CRITICAL"
                }),
            })
        ) as any;

        const onRiskChangeMock = vi.fn();

        render(
            <SmartCareNarrative
                plantId="123"
                plantName="Test Plant"
                zipCode="90210"
                onRiskChange={onRiskChangeMock}
            />
        );

        // Expect loading state first
        expect(screen.getByText(/consulting/i)).toBeInTheDocument();

        // Wait for fetch to resolve and state to update
        await waitFor(() => {
            expect(screen.getByText("Too cold to plant.")).toBeInTheDocument();
        });

        // Verify Callback was called with true (Disable care)
        expect(onRiskChangeMock).toHaveBeenCalledWith(true);
    });

    it('should NOT disable care tasks when Agent returns PROCEED', async () => {
        // Mock fetch response
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    narrative: "Go ahead.",
                    action: "PROCEED",
                    riskLevel: "LOW"
                }),
            })
        ) as any;

        const onRiskChangeMock = vi.fn();

        render(
            <SmartCareNarrative
                plantId="123"
                plantName="Test Plant"
                zipCode="90210"
                onRiskChange={onRiskChangeMock}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Go ahead.")).toBeInTheDocument();
        });

        // Verify Callback was called with false (Enable care)
        expect(onRiskChangeMock).toHaveBeenCalledWith(false);
    });
});
