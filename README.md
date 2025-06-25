# 🚨 fundamental datum 🚨

Cloudflare‑native portfolio site featuring:
* 24/7 Cloudflare Stream embed
* Time‑aware audio from a private R2 bucket, signed on demand
* 16‑panel oscilloscope background drawn in WebAudio / Canvas
* Deployed via Cloudflare Pages + Functions — no servers required

## 1 · Setup
```bash
npm i           # installs suncalc
wrangler pages deploy public --project-name fundamental-datum