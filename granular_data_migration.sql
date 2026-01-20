-- 1. Create Store Hierarchy Tables
create table if not exists public.store_chains (
    id uuid default gen_random_uuid() primary key,
    name text not null, -- e.g. "Home Depot"
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.store_branches (
    id uuid default gen_random_uuid() primary key,
    chain_id uuid not null references public.store_chains(id) on delete cascade,
    name text, -- e.g. "Buckhead Station"
    store_number text, -- e.g. "Store #1234"
    zip text, -- e.g. "30303"
    state text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Plant Health Metrics Table (Historical Anaylsis)
create table if not exists public.plant_health_metrics (
    id uuid default gen_random_uuid() primary key,
    care_session_id uuid not null references public.care_sessions(id) on delete cascade,
    score integer not null check (score >= 0 and score <= 100),
    calculated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enhance care_sessions (Provenance & Plant Specifics)
alter table public.care_sessions 
add column if not exists store_branch_id uuid references public.store_branches(id),
add column if not exists purchase_price decimal(10, 2), -- Supports ROI tracking
add column if not exists purchase_date timestamp with time zone, -- Distinct from planting date
add column if not exists receipt_image_url text, -- Audit trail
add column if not exists pot_size text; -- e.g. "1 Gallon"

-- 4. Enhance care_logs (Diagnostics)
alter table public.care_logs
add column if not exists soil_moisture text check (soil_moisture in ('WET', 'MOIST', 'DRY')),
add column if not exists pest_detected boolean default false,
add column if not exists image_url text; -- Daily photo

-- 5. Enable RLS on new tables (Default Policy: Open for prototype)
alter table public.store_chains enable row level security;
alter table public.store_branches enable row level security;
alter table public.plant_health_metrics enable row level security;

create policy "Enable all access for store_chains" on public.store_chains for all using (true) with check (true);
create policy "Enable all access for store_branches" on public.store_branches for all using (true) with check (true);
create policy "Enable all access for plant_health_metrics" on public.plant_health_metrics for all using (true) with check (true);

-- 6. Chat Analysis Table (Hybrid Architecture)
-- Stores extracted metadata, NOT raw logs.
CREATE TABLE IF NOT EXISTS public.user_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id TEXT NOT NULL, -- The user device identity
    created_at TIMESTAMPTZ DEFAULT NOW(),
    intent TEXT, -- e.g. 'watering_inquiry', 'pest_id'
    plant_name TEXT, -- e.g. 'Tomato'
    sentiment TEXT, -- 'positive', 'frustrated'
    verified_issue BOOLEAN DEFAULT FALSE -- Flag for serious issues
);

-- Enable RLS for Insights (Admins only read)
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
create policy "Admins read insights" on public.user_insights for select using (true); 
create policy "Anon insert insights" on public.user_insights for insert with check (true);
