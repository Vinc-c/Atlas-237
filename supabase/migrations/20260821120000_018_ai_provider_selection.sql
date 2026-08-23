-- Lets each organization choose which AI powers Ask Atlas / AI features:
-- 'platform_free' uses Atlas's own shared API key (Gemini, which has a real
-- free tier) at no cost to the tenant. 'openai'/'anthropic'/'gemini' mean
-- "bring your own key" — the org connects their own account via the
-- Integrations marketplace (category 'AI'), and their own key is used
-- instead, so a paying customer with their own API budget can use GPT or
-- Claude directly.
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'platform_free';
