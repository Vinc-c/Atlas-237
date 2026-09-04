import { useEffect, useState } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
}

const ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN as string | undefined;
const PROFILE_URL = 'https://www.instagram.com/liafrik_tech';

/**
 * Shows real, live Instagram posts via the Instagram Graph API when
 * VITE_INSTAGRAM_ACCESS_TOKEN is configured (requires a Meta developer app
 * + Instagram professional account authorization — the same one-time
 * OAuth-style setup as Slack, not something Atlas can fabricate). Without a
 * token, falls back to a real "Follow us" card linking to the actual
 * profile — never fake placeholder post images, which would be the exact
 * kind of "not real" content this whole pass exists to remove.
 */
export function InstagramFeed({ lang }: { lang: string }) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(Boolean(ACCESS_TOKEN));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ACCESS_TOKEN) return;
    fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=6&access_token=${ACCESS_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data)) setPosts(data.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!ACCESS_TOKEN || error) {
    return (
      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/50 px-4 py-3 text-sm text-ink-300 transition hover:border-ink-700 hover:text-white"
      >
        <Instagram size={20} className="flex-none text-primary-400" />
        <span className="flex-1">{lang === 'fr' ? 'Suivez @liafrik_tech sur Instagram' : 'Follow @liafrik_tech on Instagram'}</span>
        <ExternalLink size={14} className="flex-none" />
      </a>
    );
  }

  if (loading) {
    return <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-ink-800" />)}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {posts.map(post => (
        <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg">
          <img
            src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
            alt={post.caption?.slice(0, 80) || 'Instagram post'}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
