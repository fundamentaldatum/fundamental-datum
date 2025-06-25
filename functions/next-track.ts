import { getTimes } from 'suncalc';
import type { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  FUNDAMENTAL_SOUND: R2Bucket;
  TZ: string; LAT: string; LON: string;
  DEFAULT_TRACK: string; EVEN_TRACK: string; ODD_TRACK: string;
  SUNSET_TRACK: string; SUNRISE_TRACK: string; SIGNED_TTL: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // 1. Localised time (America/Chicago) ---------------------------------
  const utc   = new Date();
  const local = new Date(utc.toLocaleString('en-US', { timeZone: env.TZ }));

  // 2. Sunrise & sunset for *today* -------------------------------------
  const { sunrise, sunset } = getTimes(local, +env.LAT, +env.LON);

  // 3. Decide which key to serve ----------------------------------------
  let key = env.DEFAULT_TRACK;
  const within = (a: Date, b: Date, ms = 60_000) => Math.abs(a.getTime() - b.getTime()) <= ms;

  if (within(local, sunrise)) {
    key = env.SUNRISE_TRACK;
  } else if (within(local, sunset)) {
    key = env.SUNSET_TRACK;
  } else if (local.getMinutes() === 0) {
    key = local.getHours() % 2 === 0 ? env.EVEN_TRACK : env.ODD_TRACK;
  }

  // 4. Create a signed URL good for ~30 min ------------------------------
  try {
    const url = await env.FUNDAMENTAL_SOUND.getSignedUrl(key, { expiry: Date.now() + (+env.SIGNED_TTL * 1000) });

    return new Response(JSON.stringify({ url }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (_) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};
```ts
import { getTimes } from 'suncalc';
import type { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  FUNDAMENTAL_SOUND: R2Bucket;
  TZ: string; LAT: string; LON: string;
  DEFAULT_TRACK: string; EVEN_TRACK: string; ODD_TRACK: string;
  SUNSET_TRACK: string; SUNRISE_TRACK: string; SIGNED_TTL: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // — 1.  Localised time (America/Chicago) —
  const utc   = new Date();
  const local = new Date(utc.toLocaleString('en-US', { timeZone: env.TZ }));

  // Sunrise & sunset for *today* ---------------------------------------
  const { sunrise, sunset } = getTimes(local, +env.LAT, +env.LON);

  // — 2.  Decide which key to serve —
  let key = env.DEFAULT_TRACK;

  const within = (a: Date, b: Date, ms = 60_000) => Math.abs(a.getTime() - b.getTime()) <= ms;

  if (within(local, sunrise)) {
    key = env.SUNRISE_TRACK;
  } else if (within(local, sunset)) {
    key = env.SUNSET_TRACK;
  } else if (local.getMinutes() === 0) {
    key = local.getHours() % 2 === 0 ? env.EVEN_TRACK : env.ODD_TRACK;
  }

  // — 3.  Create a signed URL good for ~30 min —
  const obj = await env.FUNDAMENTAL_SOUND.get(key);
  if (!obj) {
    return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const url = await obj.getSignedUrl({ expiry: Date.now() + (+env.SIGNED_TTL * 1000) });

  return new Response(JSON.stringify({ url }), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
};
