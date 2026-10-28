# Dalil Spy — ظلّ الدوحة

An Arabic Telegram social-deduction game set in Qatar. One player is the spy; everyone else receives the same secret location. Players ask indirect questions, discuss suspicious answers, and vote to identify the spy.

## Features

- Arabic-first game flow with a Qatari/Gulf atmosphere.
- Location deck inspired by Doha and Qatar: Souq Waqif, Katara, Msheireb, the Corniche, the Museum of Islamic Art, Lusail Stadium, and more.
- Private role cards, group registration, secret voting, tie handling, and narrative case prompts.
- The `/photo` command searches Wikimedia Commons for real photographs rather than generating images. Review each selected file's source and license before reusing it outside the bot.
- Cloudflare Worker + D1 storage.

## Commands

- `/newgame` — open a case in a group.
- `/join` — join the current case.
- `/begin` — assign roles and start (minimum four players).
- `/players` — show participants.
- `/vote` — open secret voting.
- `/endgame` — close and clear the current case.
- `/photo` — fetch a real photo related to the current location.
- `/help` — show instructions.

Every player must open the bot in a private chat and press Start before role distribution, otherwise Telegram may prevent the bot from messaging them.

## Deploy

1. Create or select a Cloudflare D1 database and apply `schema.sql`.
2. Update `wrangler.toml` with your D1 database ID if you use a different database.
3. Set secrets:
   - `BOT_TOKEN` — Telegram bot token.
   - `WEBHOOK_SECRET` — optional webhook secret (use a random value).
4. Install Wrangler and deploy:

   ```sh
   npm install
   npx wrangler secret put BOT_TOKEN
   npx wrangler secret put WEBHOOK_SECRET
   npx wrangler deploy
   ```

5. Register the Telegram webhook to your deployed Worker URL. If using `WEBHOOK_SECRET`, pass the same value as Telegram's `secret_token` when calling `setWebhook`.

Do not commit bot tokens or secrets.

## Story direction

The game is framed as a fictional case file, “File 017”. Each round introduces a small narrative twist. Players are encouraged to use indirect questions and observation rather than naming the location directly. All story elements are fictional and intended for social play.

## Images

Photographs are searched from Wikimedia Commons at runtime. Images are not AI-generated. Individual files may have different licenses and attribution requirements; inspect the file page before redistributing any image outside Telegram.
