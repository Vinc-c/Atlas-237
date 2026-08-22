-- companies.revenue and campaigns.budget had no associated currency column,
-- so amounts were displayed with a hardcoded '$' regardless of the org's
-- actual currency, with no way to record which currency they were in.
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
