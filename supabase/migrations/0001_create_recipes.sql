create table recipes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users not null,
  name              text not null check (char_length(name) <= 30),
  mode              text not null check (mode in ('percent', 'gram')),
  target_type       text not null check (target_type in ('mold', 'gram')),
  target_gram       numeric check (target_gram >= 0),
  mold_id           text,
  mold_params       jsonb,
  quantity          int default 1 check (quantity >= 1 and quantity <= 99),
  loss_type         text check (loss_type in ('preset', 'manual')),
  loss_value        numeric,
  ingredients       jsonb not null,
  is_pinned         boolean default false,
  client_updated_at timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table recipes enable row level security;

create policy "users can only access own recipes"
  on recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at_column();

create index recipes_user_id_updated_at_idx
  on recipes (user_id, updated_at desc);
