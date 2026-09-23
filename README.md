# Mariam Hamed — Portfolio

A single-page personal portfolio site for Mariam Ahmed Hamed (Digital Marketing Specialist / AI Director / AI Automation Specialist).

Static site — plain HTML, CSS, and JavaScript. No build step, no framework, no npm dependencies.

## Structure

```
index.html          Entry point — all sections (hero, about, services, experience, projects, skills, education, contact)
css/styles.css       All styles (CSS variables, no preprocessor)
js/script.js         Nav behavior, scroll reveal, counters, hero tilt effect, booking form + Supabase submission
assets/images/       Profile photo
```

## Contact form → Supabase

The booking form on the Contact section inserts submissions into a Supabase table, `contact_submissions` (first name, last name, email, phone).

- The Supabase project URL and anon/publishable key are set as constants at the top of `js/script.js`. These are safe to expose client-side — they are public keys, not secrets — access is restricted entirely by Postgres Row Level Security.
- Row Level Security is enabled on `contact_submissions` with a single policy: the `anon` role may `INSERT` only. No `SELECT`, `UPDATE`, or `DELETE` policy exists for public/anon, so the form can submit but never read, edit, or delete data.
- The Supabase **service-role key is never used here** and must never be added to any client-side file.

To point the site at a different Supabase project, update `SUPABASE_URL` and `SUPABASE_ANON_KEY` near the top of `js/script.js`, and run the migration in `supabase/migrations/` (or the SQL below) against that project.

### Table schema

```sql
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "public_can_insert_submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (true);
```

## Local development

Any static file server works, e.g.:

```bash
npx serve .
```

## Deployment

Deployed on Vercel as a static site (no build command required). Pushing to `main` on GitHub triggers an automatic redeploy.
