-- Create table for tracking daily care check-ins
create table public.care_logs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    care_session_id uuid not null references public.care_sessions(id) on delete cascade,
    
    action_type text not null,   -- e.g., 'Water', 'Check', 'Fertilize'
    log_date date not null,      -- The scheduled date of the task
    
    status text not null,        -- 'THRIVING', 'CONCERN', 'CRITICAL'
    note text,                   -- Free-form observations
    
    -- Constraint: Only one log per task per day (optional, but good for data integrity)
    unique(care_session_id, action_type, log_date)
);

-- Enable RLS (if you are using it, otherwise optional for dev)
alter table public.care_logs enable row level security;

create policy "Enable all access for now"
on public.care_logs
for all
using (true)
with check (true);
