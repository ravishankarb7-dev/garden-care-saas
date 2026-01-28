-- Analytics Schema Migration
-- Purpose: "Data-Grade" infrastructure for traceability and reproducible analytics.

-- 1. Enums for Standardized Outcomes
CREATE TYPE public.outcome_type_enum AS ENUM (
    'success',
    'returned',
    'replacement_sent',
    'dead',
    'customer_complaint',
    'cold_damage',
    'heat_damage',
    'root_rot',
    'drought_stress',
    'pest_damage',
    'unknown'
);

CREATE TYPE public.outcome_source_enum AS ENUM (
    'customer_reported',
    'seller_reported',
    'support_interaction',
    'system_inferred',
    'manual_review'
);

CREATE TYPE public.outcome_confidence_enum AS ENUM ('low', 'medium', 'high');

-- 2. Care Outcomes Table
CREATE TABLE IF NOT EXISTS public.care_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL, -- Logical tenant ID (even if not strictly enforced by FK yet)
    care_session_id UUID NOT NULL REFERENCES public.care_sessions(id) ON DELETE CASCADE,
    outcome_type public.outcome_type_enum NOT NULL,
    outcome_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source public.outcome_source_enum NOT NULL,
    confidence public.outcome_confidence_enum NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for filtering
CREATE INDEX IF NOT EXISTS idx_care_outcomes_store_date ON public.care_outcomes(store_id, outcome_at);
CREATE INDEX IF NOT EXISTS idx_care_outcomes_session_date ON public.care_outcomes(care_session_id, outcome_at);
CREATE INDEX IF NOT EXISTS idx_care_outcomes_type_date ON public.care_outcomes(outcome_type, outcome_at);

-- RLS for Care Outcomes
ALTER TABLE public.care_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for store users" ON public.care_outcomes FOR SELECT USING (true); -- Refine later with tenant check
CREATE POLICY "Enable insert for store users" ON public.care_outcomes FOR INSERT WITH CHECK (true);

-- 3. Weather Observations Daily (Reproducible History)
CREATE TABLE IF NOT EXISTS public.weather_observations_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    zip TEXT NOT NULL,
    date DATE NOT NULL,
    temp_min_f NUMERIC NOT NULL,
    temp_max_f NUMERIC NOT NULL,
    precip_in NUMERIC NOT NULL DEFAULT 0,
    wind_max_mph NUMERIC,
    humidity_avg_pct NUMERIC,
    frost_flag BOOLEAN NOT NULL DEFAULT FALSE,
    heat_flag BOOLEAN NOT NULL DEFAULT FALSE,
    raw_payload JSONB, -- Audit trail
    source_provider TEXT NOT NULL DEFAULT 'NWS',
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq_store_zip_date UNIQUE (store_id, zip, date)
);

-- Indices for Weather
CREATE INDEX IF NOT EXISTS idx_weather_daily_lookup ON public.weather_observations_daily(store_id, zip, date);
CREATE INDEX IF NOT EXISTS idx_weather_daily_date ON public.weather_observations_daily(date);

-- RLS for Weather
ALTER TABLE public.weather_observations_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for all" ON public.weather_observations_daily FOR SELECT USING (true);
CREATE POLICY "Service Role write only" ON public.weather_observations_daily FOR ALL USING (false); -- Implicitly blocks anon/authenticated, allows service_role

-- 4. Geocode Cache (To respect API limits)
CREATE TABLE IF NOT EXISTS public.zip_geocodes (
    zip TEXT PRIMARY KEY,
    lat NUMERIC NOT NULL,
    lon NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.zip_geocodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read geocodes" ON public.zip_geocodes FOR SELECT USING (true);

-- 5. Alter Care Sessions (Delivery Anchor)
ALTER TABLE public.care_sessions ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
