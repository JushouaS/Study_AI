-- StudyAI Supabase schema + RLS
-- Required tables:
-- - profiles (id, email, created_at)
-- - chat_sessions (id, user_id, title, created_at)
-- - messages (id, session_id, role, content, created_at)

create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Create a profile automatically on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CHAT SESSIONS
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Chat',
  created_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions_select_own"
on public.chat_sessions
for select
to authenticated
using (user_id = auth.uid());

create policy "chat_sessions_insert_own"
on public.chat_sessions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "chat_sessions_update_own"
on public.chat_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "chat_sessions_delete_own"
on public.chat_sessions
for delete
to authenticated
using (user_id = auth.uid());

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Users can only access messages that belong to their sessions
create policy "messages_select_own"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions cs
    where cs.id = messages.session_id
      and cs.user_id = auth.uid()
  )
);

create policy "messages_insert_own"
on public.messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.chat_sessions cs
    where cs.id = messages.session_id
      and cs.user_id = auth.uid()
  )
);

create policy "messages_delete_own"
on public.messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions cs
    where cs.id = messages.session_id
      and cs.user_id = auth.uid()
  )
);

create policy "messages_update_own"
on public.messages
for update
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions cs
    where cs.id = messages.session_id
      and cs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.chat_sessions cs
    where cs.id = messages.session_id
      and cs.user_id = auth.uid()
  )
);

