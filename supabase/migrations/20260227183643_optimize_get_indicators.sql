CREATE OR REPLACE VIEW public.indicators_with_last_entry AS
WITH RankedEntries AS (
    SELECT 
        ie.*,
        ROW_NUMBER() OVER (PARTITION BY ie.indicator_id ORDER BY ie.year DESC, ie.month DESC) as rn
    FROM public.indicator_entries ie
),
AccumulatedEntries AS (
    SELECT 
        ie.indicator_id,
        SUM(ie.realized) as acc_realized,
        SUM(ie.target) as acc_target
    FROM public.indicator_entries ie
    JOIN RankedEntries re ON ie.indicator_id = re.indicator_id AND re.rn = 1
    WHERE ie.year = re.year AND ie.month <= re.month
    GROUP BY ie.indicator_id
)
SELECT 
    i.*,
    re1.id AS last_entry_id, 
    re1.month AS last_entry_month, 
    re1.year AS last_entry_year,
    re1.realized AS last_entry_realized, 
    re1.target AS last_entry_target, 
    re1.budget AS last_entry_budget,
    re2.realized AS prev_entry_realized,
    ae.acc_realized AS accumulated_realized, 
    ae.acc_target AS accumulated_target
FROM public.indicators i
LEFT JOIN RankedEntries re1 ON i.id = re1.indicator_id AND re1.rn = 1
LEFT JOIN RankedEntries re2 ON i.id = re2.indicator_id AND re2.rn = 2
LEFT JOIN AccumulatedEntries ae ON i.id = ae.indicator_id;

-- RLS para a VIEW
ALTER VIEW public.indicators_with_last_entry SET (security_invoker = true);

