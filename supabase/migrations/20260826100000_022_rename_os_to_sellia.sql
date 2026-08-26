-- The "Os" e-commerce integration has been replaced by Sellia (sellia.liafrik.com).
-- Re-point any existing connected rows so tenants who had "Os" connected keep
-- a working (though now-disconnected-looking, until they re-enter credentials)
-- record instead of silently losing history. Config fields keep their old
-- values; users will need to re-enter their Sellia API key since the two
-- services do not share credentials.
UPDATE public.integrations
SET provider = 'sellia',
    category = 'E-commerce'
WHERE provider = 'os';
