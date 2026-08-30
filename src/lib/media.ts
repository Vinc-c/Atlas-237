/**
 * Background video sources for marketing/auth surfaces (landing hero,
 * final CTA before the footer, auth page).
 *
 * Centralized here on purpose: swap a URL in one place instead of editing
 * every page that uses it, and <VideoBackground> (src/components/VideoBackground.tsx)
 * fails over cleanly to the existing gradient design if a URL 404s, so
 * changing these can never break the page — worst case it just falls back
 * silently to what was already there.
 *
 * IMPORTANT — before relying on this in production:
 * The default URLs below point at Pexels' own CDN (videos.pexels.com).
 * Pexels' license lets you use these clips for free, including commercially,
 * with no attribution required — but hotlinking a third party's CDN directly
 * from a production app is fragile (their infra, their uptime, their
 * bandwidth policy, not yours) and the files below are full UHD exports,
 * heavier than a compressed web loop should be. Recommended before launch:
 *   1. Download the clip(s) you like (Pexels/Mixkit/Coverr all offer
 *      license-clear downloads for commercial use).
 *   2. Compress to ~1080p, ~15-20s, H.264 mp4 (and ideally a .webm copy),
 *      aiming for a few MB, not tens of MB.
 *   3. Upload to a Supabase Storage public bucket (or /public if it's small
 *      enough to ship in the repo) and paste the resulting URL(s) below.
 */

// Main landing-page hero — "premium corporate office" style.
export const HERO_VIDEO_SOURCES: string[] = [
  'https://videos.pexels.com/video-files/7147921/7147921-uhd_2560_1440_25fps.mp4',
];
export const HERO_VIDEO_POSTER =
  'https://images.pexels.com/videos/7147921/colleagues-computer-laptop-conference-room-corporate-7147921.jpeg?auto=compress&cs=tinysrgb&h=720&fit=crop&w=1280';

// Final CTA hero, right before the footer — same corporate style, reused.
export const FINAL_CTA_VIDEO_SOURCES: string[] = HERO_VIDEO_SOURCES;
export const FINAL_CTA_VIDEO_POSTER = HERO_VIDEO_POSTER;

// Auth page brand panel — "tech / data network" style.
export const AUTH_VIDEO_SOURCES: string[] = [
  'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4',
];
export const AUTH_VIDEO_POSTER =
  'https://images.pexels.com/videos/3129671/free-video-3129671.jpg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1280';
