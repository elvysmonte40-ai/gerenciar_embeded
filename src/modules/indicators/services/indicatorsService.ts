
import { supabase } from '../../../lib/supabase';
import type { Indicator, IndicatorEntry, CalculatedEntry } from '../types';
import { calculatePerformance, getComprehensiveStatus, calculateTrend } from '../utils/calculations';

export const indicatorsService = {
    async getIndicators(organizationId: string) {
        const { data, error } = await supabase
            .from('indicators')
            .select('*')
            .eq('organization_id', organizationId)
            .order('sort_order', { ascending: true })
            .order('title', { ascending: true });

        if (error) throw error;
        return data as Indicator[];
    },

    async getIndicatorsWithPerformance(organizationId: string) {
        // Fetch indicators with optimized entries query
        // We only need current year and previous year entries to calculate performance and trend
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const { data, error } = await supabase
            .from('indicators')
            .select(`
                *,
                indicator_entries!inner (
                    id, month, year, realized, target, budget
                )
            `)
            .eq('organization_id', organizationId)
            .in('indicator_entries.year', [currentYear, previousYear])
            .order('sort_order', { ascending: true })
            .order('title', { ascending: true });

        // If inner join fails because there are no entries, fetch them without inner join
        let indicatorsData = data;
        if (error || !data || data.length === 0) {
            const { data: allData, error: allErr } = await supabase
                .from('indicators')
                .select(`
                  *,
                  indicator_entries (
                      id, month, year, realized, target, budget
                  )
              `)
                .eq('organization_id', organizationId)
                .order('sort_order', { ascending: true })
                .order('title', { ascending: true });

            if (allErr) throw allErr;
            indicatorsData = allData;
        }

        // Process to find latest entry and calculate metrics
        const indicatorsWithPerformance = (indicatorsData || []).map((ind: any) => {
            let entries = (ind.indicator_entries || []) as IndicatorEntry[];

            // Filter entries to only current and previous year if not already done by inner join
            entries = entries.filter(e => e.year === currentYear || e.year === previousYear);

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

            // Calculate accumulated values for annual indicators
            if (ind.periodicity === 'annual' && calculatedEntry) {
                const yearToCalc = lastEntry?.year || currentYear;
                const monthToCalc = lastEntry?.month || new Date().getMonth() + 1;

                // Filter entries for the calculated year up to current month (or all year for past years)
                const yearlyEntries = sortedEntries.filter(e => e.year === yearToCalc && e.month <= monthToCalc);

                const accumulatedRealized = yearlyEntries.reduce((sum, e) => sum + (e.realized || 0), 0);
                const accumulatedTarget = yearlyEntries.reduce((sum, e) => sum + (e.target || 0), 0);

                // Only calculate performance if target > 0 to avoid division by zero
                let accumulatedPerformance = 0;
                if (accumulatedTarget !== 0) {
                    accumulatedPerformance = calculatePerformance(accumulatedRealized, accumulatedTarget, ind.direction);
                }

                calculatedEntry = {
                    ...calculatedEntry,
                    accumulated: {
                        realized: accumulatedRealized,
                        target: accumulatedTarget,
                        performance: accumulatedPerformance
                    }
                };
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
