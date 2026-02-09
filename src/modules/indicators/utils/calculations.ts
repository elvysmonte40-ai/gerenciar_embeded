
import type { IndicatorDirection, IndicatorStatus, IndicatorEntry } from '../types';

/**
 * Calculates the performance percentage based on Realized vs Target.
 * @param realized The actual value achieved.
 * @param target The target value.
 * @param direction 'HIGHER_BETTER' or 'LOWER_BETTER'.
 * @returns Performance percentage (e.g., 100 for 100%).
 */
export function calculatePerformance(realized: number, target: number, direction: IndicatorDirection): number {
    if (target === 0) return 0; // Avoid division by zero

    if (direction === 'LOWER_BETTER') {
        // If goal is to minimize (e.g. Cost), Realized < Target is Good (>100%)
        if (realized === 0) return 100; // Perfect score if cost is 0?
        return (target / realized) * 100;
    }

    // HIGHER_BETTER (Default)
    return (realized / target) * 100;
}

/**
 * Calculates the deviation (Realized - Target).
 */
export function calculateDeviation(realized: number, target: number): number {
    return realized - target;
}

/**
 * Determines the simplified status (Green/Yellow) based purely on current month.
 * Does NOT account for history (Red condition).
 */
export function getBasicStatus(performance: number): IndicatorStatus {
    if (performance >= 100) return 'GREEN';
    return 'YELLOW';
}

/**
 * Determines the comprehensive status including Red conditions.
 * @param currentPerformance The calculated performance % for the current month.
 * @param previousEntries sorted by month descending (closest month first).
 * @param annualTarget Optional annual target for "compromised" check.
 * @param currentAccumulated Optional accumulated realized so far (for annual check).
 */
export function getComprehensiveStatus(
    currentPerformance: number,
    previousEntries: { performance: number }[],
    // annualTarget?: number,
    // currentAccumulated?: number
): IndicatorStatus {
    // 1. If Hit Target -> GREEN
    if (currentPerformance >= 100) return 'GREEN';

    // 2. If Missed Target -> Check for RED conditions
    // Cond 1: 3rd Consecutive Miss
    // We need to check if previous 2 entries were also misses (<100)
    let consecutiveMisses = 1; // Current is miss
    for (const entry of previousEntries) {
        if (entry.performance < 100) {
            consecutiveMisses++;
        } else {
            break; // Streak broken
        }
    }

    if (consecutiveMisses >= 3) return 'RED';

    // Cond 2: Annual Target Compromised (TODO: Implement complexity if needed)
    // if (isAnnualCompromised(annualTarget, currentAccumulated)) return 'RED';

    // 3. If missed but not critical -> YELLOW
    return 'YELLOW';
}

/**
 * Helper to calculate trending direction
 */
export function calculateTrend(currentRealized: number, previousRealized: number): 'UP' | 'DOWN' | 'FLAT' {
    if (currentRealized > previousRealized) return 'UP';
    if (currentRealized < previousRealized) return 'DOWN';
    return 'FLAT';
}
