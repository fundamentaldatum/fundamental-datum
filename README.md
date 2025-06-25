# 🚨 fundamental datum 🚨

*A continuous window into a single point in space‑time—my backyard in Houston—served, styled, and streamed entirely with Cloudflare.*

---

## Project Vision
> **fundamental datum** transforms a humble security‑cam feed into an ambient art installation.  Visitors witness a 24/7 live video stream while generative soundtracks and real‑time oscilloscope visuals create an ever‑changing audiovisual backdrop.  All delivery, logic, and storage run exclusively on Cloudflare’s edge, so the site stays low‑latency and zero‑ops.

## Live Feature Set
| Layer | Feature |
|-------|---------|
| **Video** | 24/7 Cloudflare Stream iframe (`HLS` + `DASH`) |
| **Audio** | Time‑based soundtrack rotation from a private R2 bucket, signed per request |
| **Visualizer** | 4 × 4 grid of oscilloscope canvases driven by the `<audio>` element |
| **Routing** | Pages Functions endpoint **`/next-track`** chooses the correct MP3 and signs the URL |
| **Fallback** | If the Worker/API fails, a local `fundamental-sound.mp3` loops client‑side |
| **Sub‑pages** | `/what-is-fundamental-datum/` and `/adjacent-fundaments/` (content TBD) |

---

## 100 % Cloudflare Architecture

Browser ─┐
│  (HLS video)
▼
Cloudflare
Stream  ←──  backyard RTSP camera
▲
│  (signed URL JSON)
│
Browser ─┤        Pages Function  /next-track  ─┐
│                                     │
▼                                     │
fundamental‑sound   (private R2 bucket) ─────┘
▲
│  (static assets)
▼
Cloudflare Pages   (HTML • CSS • JS)  🠒  fundamentaldatum.com/org

### Why no servers?
* **Pages & Functions** scale automatically across CF’s global edge, so the API call that decides which track plays never leaves the visitor’s region.
* **R2 signed URLs** keep the MP3s private without a single origin server; Cloudflare signs and streams directly.
* **Stream** handles transmuxing, manifests, and CDN caching for the live camera feed.

---

## Repo Layout

public/              # static assets served by Pages
├─ audio/            # local fallback MP3
├─ style.css         # base styles (fixed nav + grid layout)
├─ index.html        # home page with Stream iframe
├─ what-is-fundamental-datum/index.html
├─ adjacent-fundaments/index.html
├─ player.js         # fetches /next-track and swaps 
└─ visualizer.js     # 16‑canvas oscilloscope grid
functions/
└─ next-track.ts     # Pages Function (Typescript) – chooses & signs track
wrangler.toml        # bucket binding + env vars
package.json         # only dependency is suncalc

## Getting Started
```bash
# 1. Install toolchain
brew install git node
npm i -g wrangler

# 2. Clone & install deps
git clone https://github.com/<you>/fundamental-datum.git
cd fundamental-datum
npm install

# 3. Develop locally (Stream iframe won’t load until UID set)
wrangler pages dev public

# 4. Deploy
# – create Pages project in CF dashboard (output dir = public)
# – configure env vars below
# – git push main to trigger build

Environment Variables (Pages → Settings → Env Vars)

Key

Example

Purpose

TZ

America/Chicago

Evaluate hours in Central Time

LAT LON

29.7604 -95.3698

For sunrise/sunset via SunCalc

DEFAULT_TRACK

fundamental-sound.mp3

Looping ambience

EVEN_TRACK

fundamental-squares.mp3

Even‑hour chime

ODD_TRACK

fundamental-triangles.mp3

Odd‑hour chime

SUNSET_TRACK

fundamental-rest.mp3

Plays once at sunset

SUNRISE_TRACK

fundamental-rise.mp3

Plays once at sunrise

SIGNED_TTL

1800

Seconds validity for R2 signed URL

(FUNDAMENTAL_SOUND R2 binding is declared in wrangler.toml and injected automatically.)

Customisation Pointers

Different timezone? Change TZ env var; the Worker handles localisation.

More tracks / rules? Extend the pickKey() logic in next-track.ts.

Visualizer colours? Edit ctx.strokeStyle in visualizer.js.

Alternate camera source? Replace the Stream UID in public/index.html.

Roadmap



License

MIT © 2025 James Blackwell – content of the live stream remains © James Blackwell.