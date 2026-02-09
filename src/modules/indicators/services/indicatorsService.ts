
import { supabase } from '../../../lib/supabase';
import type { Indicator, IndicatorEntry, CalculatedEntry } from '../types';
import { calculatePerformance, getComprehensiveStatus, calculateTrend } from '../utils/calculations';

export const indicatorsService = {
    async getIndicators(organizationId: string) {
        const { data, error } = await supabase
            .from('indicators')
            .select('*')
            .eq('organization_id', organizationId)
            .order('title');

        if (error) throw error;
        return data as Indicator[];
    },

    async getIndicatorsWithPerformance(organizationId: string) {
        // Fetch indicators with ALL entries to determine latest
        // optimize: trigger or view for latest entry would be better, but JS sort is fine for MVP
        const { data, error } = await supabase
            .from('indicators')
            .select(`
                *,
                indicator_entries (
                    id, month, year, realized, target, budget
                )
            `)
            .eq('organization_id', organizationId)
            .order('title');

        if (error) throw error;

        // Process to find latest entry and calculate metrics
        const indicatorsWithPerformance = data.map((ind: any) => {
            const entries = ind.indicator_entries as IndicatorEntry[];

            // Sort by Date Descending
            const sortedEntries = entries.sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });

            const lastEntry = sortedEntries[0];
            let calculatedEntry: CalculatedEntry | null = null;

            if (lastEntry && lastEntry.realized != null && lastEntry.target != null) {
                const performance = calculatePerformance(lastEntry.realized, lastEntry.target, ind.direction);
                // Simple status check (no history for dashboard list view)
                const status = getComprehensiveStatus(performance, []);

                // Determine trend compared to previous entry
                const previousEntry = sortedEntries[1];
                let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
                if (previousEntry && previousEntry.realized != null) {
                    trend = calculateTrend(lastEntry.realized, previousEntry.realized);
                }

                calculatedEntry = {
                    ...lastEntry,
                    performance,
                    deviation: (lastEntry.realized || 0) - (lastEntry.target || 0),
                    status,
                    trend
                };
            }

            // If realized or target is missing, we can't calculate performance fully but still return entry data
            else if (lastEntry) {
                calculatedEntry = {
                    ...lastEntry,
                    performance: 0,
                    deviation: 0,
                    status: 'YELLOW', // Default/Unknown
                    trend: 'FLAT'
                }
            }

            return {
                ...ind,
                lastEntry: calculatedEntry
            };
        });

        return indicatorsWithPerformance as (Indicator & { lastEntry: CalculatedEntry | null })[];
    },

    async getIndicator(id: string) {
        const { data, error } = await supabase
            .from('indicators')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Indicator;
    },

    async createIndicator(indicator: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('indicators')
            .insert(indicator)
            .select()
            .single();

        if (error) throw error;
        return data as Indicator;
    },

    async updateIndicator(id: string, updates: Partial<Indicator>) {
        const { data, error } = await supabase
            .from('indicators')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Indicator;
    },

    async deleteIndicator(id: string) {
        const { error } = await supabase
            .from('indicators')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getEntries(indicatorId: string, year: number) {
        const { data, error } = await supabase
            .from('indicator_entries')
            .select('*')
            .eq('indicator_id', indicatorId)
            .eq('year', year)
            .order('month');

        if (error) throw error;
        return data as IndicatorEntry[];
    },

    async upsertEntry(entry: Omit<IndicatorEntry, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('indicator_entries')
            .upsert(entry, { onConflict: 'indicator_id, month, year' })
            .select()
            .single();

        if (error) throw error;
        return data as IndicatorEntry;
    }
};
