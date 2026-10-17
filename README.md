# Grind Log

Static site (`index.html`) plus one Vercel function (`api/state.js`) that stores your data in Neon Postgres.

## Deploy
1. Create a Neon project and copy its connection string.
2. Push this folder to a GitHub repo and import it in Vercel (no build settings needed).
3. In Vercel > Settings > Environment Variables add `DATABASE_URL` (your Neon string) and `APP_PASSCODE` (any secret).
4. Deploy. On first open the site asks for the passcode. It creates the `app_state` table by itself.

## Local test
`npm i -g vercel`, copy `.env.example` to `.env`, fill it in, run `vercel dev`.

## Move your existing data
In the old Claude page: Your data > Show backup, copy the text.
In the new site: paste it into the same box and press Restore from text.

The passcode is the only thing stopping others from reading or writing your data, so make it long.
