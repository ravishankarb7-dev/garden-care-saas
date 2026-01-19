-- Create user_stats table to track Gamification progress
create table if not exists user_stats (
  device_id text primary key,
  xp integer default 0,
  level integer default 1,
  streak_days integer default 0,
  last_active_date date,
  badges jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (though for this demo app we mostly rely on client ID)
alter table user_stats enable row level security;

create policy "Users can view their own stats"
  on user_stats for select
  using (device_id = current_setting('request.headers')::json->>'x-device-id' or true); -- Simplified for MVP

create policy "Users can update their own stats"
  on user_stats for update
  using (true);

create policy "Users can insert their own stats"
  on user_stats for insert
  with check (true);
