import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Simple in-memory cache for link previews
const previewCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check cache
    const cached = previewCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VocaCoach/1.0; +https://vocacoach.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const preview = extractMetadata(html, url, parsedUrl.hostname);

    // Cache the result
    previewCache.set(url, { data: preview, timestamp: Date.now() });

    // Clean up old cache entries periodically
    if (previewCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of previewCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          previewCache.delete(key);
        }
      }
    }

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}

function extractMetadata(html: string, url: string, hostname: string) {
  const getMetaContent = (property: string): string | undefined => {
    // Try og: prefix first
    const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'));
    if (ogMatch) return ogMatch[1];

    // Try twitter: prefix
    const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                         html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, 'i'));
    if (twitterMatch) return twitterMatch[1];

    // Try regular meta name
    const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
    if (metaMatch) return metaMatch[1];

    return undefined;
  };

  // Extract title
  let title = getMetaContent('title');
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleMatch ? titleMatch[1].trim() : undefined;
  }

  // Extract description
  const description = getMetaContent('description');

  // Extract image
  let image = getMetaContent('image');
  if (image && !image.startsWith('http')) {
    // Convert relative URL to absolute
    try {
      image = new URL(image, url).href;
    } catch {
      image = undefined;
    }
  }

  // Extract site name
  const siteName = getMetaContent('site_name') || hostname.replace('www.', '');

  // Extract favicon
  let favicon: string | undefined;
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
                       html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
  if (faviconMatch) {
    favicon = faviconMatch[1];
    if (!favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, url).href;
      } catch {
        favicon = `https://${hostname}/favicon.ico`;
      }
    }
  } else {
    favicon = `https://${hostname}/favicon.ico`;
  }

  return {
    url,
    title: title ? decodeHtmlEntities(title) : undefined,
    description: description ? decodeHtmlEntities(description).slice(0, 200) : undefined,
    image,
    siteName,
    favicon
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}
