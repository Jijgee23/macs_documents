# Deploy — docs.macs.mn (Ubuntu VPS)

## 1. PostgreSQL

```bash
sudo apt install postgresql
sudo -u postgres psql <<'SQL'
CREATE ROLE macs_docs WITH LOGIN PASSWORD 'CHANGE_ME';
CREATE DATABASE macs_docs OWNER macs_docs;
SQL
```
No `CREATEDB` grant needed in production — that's only required for `prisma migrate dev`'s shadow database, and deploys use `migrate deploy` instead.

## 2. Node + app

Install Node 24+ (nvm recommended), then in `/srv/macs-docs`:
```bash
npm ci
npx prisma generate
npm run db:migrate:deploy
npm run build
npm run db:seed-admin   # first deploy only, or to reset the admin password
npm run db:seed-docs    # first deploy only — requires .old_html_project/index.html present (see note below)
```

## 3. `.env` on the server

```
DATABASE_URL=postgresql://macs_docs:CHANGE_ME@localhost:5432/macs_docs
SESSION_SECRET=<32+ random chars, openssl rand -base64 32>
ADMIN_EMAIL=<real admin email>
ADMIN_PASSWORD=<real admin password>
ANTHROPIC_API_KEY=<real Anthropic key — AI chat returns a friendly "unavailable" message if unset, doesn't crash>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<32+ random chars, openssl rand -base64 32>
```
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` must be pinned — without it, Server Action IDs rotate on every deploy/restart and in-flight form submissions during a rolling deploy will fail. The Claude model used for AI chat is admin-configurable at `/admin/settings` (stored in DB, not env) — no redeploy needed to change it.

## 4. systemd

Copy `deploy/macs-docs.service` to `/etc/systemd/system/macs-docs.service`, adjust `User`/`WorkingDirectory` if different, then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now macs-docs
```

## 5. Caddy

Install Caddy, copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile` (or append it), point `docs.macs.mn`'s DNS A record at the server, then `sudo systemctl reload caddy`. Caddy handles Let's Encrypt TLS automatically.

## 6. Redeploys

```bash
git pull
npm ci
npx prisma generate
npm run db:migrate:deploy
npm run build
sudo systemctl restart macs-docs
```

## Notes / gotchas

- **`.old_html_project/index.html` is currently untracked in git** (shows as `??` in `git status`) — either `git add` + commit it, or `scp` it to the server manually before running `db:seed-docs`. It's only needed for that one-time migration script; the site itself never reads it at runtime.
- **Site-wide password gate**: the docs site prompts for a password (`macs2026`, matching the legacy app) before showing content, bypassable via visiting `/macs2026`. This is a **client-side-only soft gate** (`components/PasswordGate.tsx`) — it does not block server-rendered HTML from being fetched directly (e.g. via `curl`). If real access control is needed, that requires separate server-side enforcement. The password value itself is hardcoded in that file — change it there (and rebuild/redeploy) if it needs to differ from `macs2026`.
- **Admin auth is proxy-based UX + DAL-enforced** (see `proxy.ts` / `lib/auth.ts`) — real security, independent of the docs password gate above.
