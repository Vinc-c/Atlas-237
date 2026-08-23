-- SSO/SAML was advertised in the pricing grid (Pro/Enterprise) but had
-- zero implementation anywhere in the product — an unfulfilled promise to
-- paying customers. Full SAML federation requires the customer's own
-- Identity Provider (Okta, Azure AD, etc.) and Supabase Enterprise-tier SSO
-- enablement, neither of which can be fabricated without the customer's
-- own IdP metadata. This adds real storage for that configuration and an
-- honest status, so Settings > Security can show a genuine setup flow
-- instead of a silently absent feature.
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS sso_config jsonb;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS sso_enabled boolean NOT NULL DEFAULT false;
