-- Add new columns to indicators table
ALTER TABLE public.indicators
ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
ADD COLUMN decimal_places integer NOT NULL DEFAULT 2,
ADD COLUMN description text,
ADD COLUMN calculation_type text NOT NULL DEFAULT 'SIMPLE';

-- Add comment to calculation_type to document expected values
COMMENT ON COLUMN public.indicators.calculation_type IS 'SIMPLE, NUMERATOR_DENOMINATOR, COMPOUND';
