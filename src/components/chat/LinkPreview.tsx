'use client';

import { useState, useEffect, CSSProperties } from 'react';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
  darkMode?: boolean;
}

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function extractUrls(text: string): string[] {
  return text.match(URL_REGEX) || [];
}

export default function LinkPreview({
  url,
  isOwn = false,
  darkMode = false
}: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch('/api/chat/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          setPreview(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div style={{
        padding: '12px',
        background: isOwn ? 'rgba(255,255,255,0.1)' : (darkMode ? '#374151' : '#F3F4F6'),
        borderRadius: '8px',
        marginTop: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: isOwn ? 'rgba(255,255,255,0.6)' : (darkMode ? '#9CA3AF' : '#9CA3AF'),
          fontSize: '12px'
        }}>
          <span style={{ animation: 'pulse 1s infinite' }}>🔗</span>
          Loading preview...
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return null; // Silently fail - the URL is still visible in the message
  }

  const containerStyle: CSSProperties = {
    display: 'block',
    textDecoration: 'none',
    background: isOwn ? 'rgba(255,255,255,0.1)' : (darkMode ? '#374151' : '#F3F4F6'),
    borderRadius: '8px',
    overflow: 'hidden',
    marginTop: '8px',
    border: `1px solid ${isOwn ? 'rgba(255,255,255,0.1)' : (darkMode ? '#4B5563' : '#E5E7EB')}`,
    maxWidth: '300px'
  };

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block'
  };

  const contentStyle: CSSProperties = {
    padding: '10px 12px'
  };

  const siteNameStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: isOwn ? 'rgba(255,255,255,0.6)' : (darkMode ? '#9CA3AF' : '#6B7280'),
    marginBottom: '4px'
  };

  const faviconStyle: CSSProperties = {
    width: '14px',
    height: '14px',
    borderRadius: '2px'
  };

  const titleStyle: CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    color: isOwn ? 'white' : (darkMode ? '#F3F4F6' : '#1F2937'),
    lineHeight: '1.3',
    marginBottom: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const descriptionStyle: CSSProperties = {
    fontSize: '12px',
    color: isOwn ? 'rgba(255,255,255,0.7)' : (darkMode ? '#D1D5DB' : '#6B7280'),
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const getDomain = (urlStr: string) => {
    try {
      const urlObj = new URL(urlStr);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return urlStr;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={containerStyle}
    >
      {preview.image && (
        <img
          src={preview.image}
          alt={preview.title || 'Link preview'}
          style={imageStyle}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <div style={contentStyle}>
        <div style={siteNameStyle}>
          {preview.favicon && (
            <img
              src={preview.favicon}
              alt=""
              style={faviconStyle}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <span>{preview.siteName || getDomain(url)}</span>
        </div>
        {preview.title && <div style={titleStyle}>{preview.title}</div>}
        {preview.description && <div style={descriptionStyle}>{preview.description}</div>}
      </div>
    </a>
  );
}

// Component to render text with embedded link previews
export function TextWithLinkPreviews({
  text,
  isOwn = false,
  darkMode = false
}: {
  text: string;
  isOwn?: boolean;
  darkMode?: boolean;
}) {
  const urls = extractUrls(text);
  const uniqueUrls = [...new Set(urls)];

  // Convert URLs in text to clickable links
  const renderTextWithLinks = () => {
    const parts = text.split(URL_REGEX);
    return parts.map((part, index) => {
      if (URL_REGEX.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isOwn ? 'rgba(255,255,255,0.9)' : '#7C3AED',
              textDecoration: 'underline'
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div>
      <div>{renderTextWithLinks()}</div>
      {uniqueUrls.slice(0, 1).map((url) => (
        <LinkPreview
          key={url}
          url={url}
          isOwn={isOwn}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}
