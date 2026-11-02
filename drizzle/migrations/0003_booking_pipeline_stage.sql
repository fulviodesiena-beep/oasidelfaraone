create type public.pipeline_stage as enum ('lead','quoted','follow_up','confirmed','pre_stay','staying','post_stay','loyal');
alter table public.bookings add column pipeline_stage public.pipeline_stage not null default 'lead';
update public.bookings set pipeline_stage = 'confirmed' where status = 'confirmed';