export type IndicatorDirection = 'HIGHER_BETTER' | 'LOWER_BETTER';
export type IndicatorUnit = 'currency' | 'percent' | 'number';
export type IndicatorPeriodicity = 'monthly';

export interface Indicator {
    id: string;
    organization_id: string;
    owner_id?: string; // Optional as per schema (nullable)
    title: string;
    direction: IndicatorDirection;
    unit: IndicatorUnit;
    periodicity: IndicatorPeriodicity;
    created_at: string;
    updated_at: string;
}

export interface IndicatorEntry {
    id: string;
    indicator_id: string;
    month: number;
    year: number;
    target: number | null;
    budget: number | null;
    realized: number | null;
    created_at: string;
    updated_at: string;
}

export type IndicatorStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface CalculatedEntry extends IndicatorEntry {
    performance: number; // Percentage (e.g., 105.5 for 105.5%)
    deviation: number;   // Absolute difference
    status: IndicatorStatus;
    trend: 'UP' | 'DOWN' | 'FLAT'; // Compared to previous month
}
