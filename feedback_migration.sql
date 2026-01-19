-- Create table for capturing user feedback via Sage (AI Agent)
create table public.app_feedback (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    feedback_text text not null, -- The core message
    category text,               -- 'FEATURE', 'BUG', 'UI', 'CONTENT', 'GENERAL'
    sentiment text,              -- 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
    
    source text default 'SAGE_CHAT' -- To track where it came from
);

-- Enable RLS
alter table public.app_feedback enable row level security;

create policy "Enable insert for all"
on public.app_feedback
for insert
with check (true);

create policy "Enable read for developers"
on public.app_feedback
for select
using (true);
