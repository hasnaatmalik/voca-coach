'use client';

import { useState, CSSProperties } from 'react';

interface MediaMessageProps {
  mediaUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isOwn: boolean;
  darkMode?: boolean;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
  'text/plain': '📃',
  'text/csv': '📊',
};

export default function MediaMessage({
  mediaUrl,
  fileName,
  fileSize,
  mimeType,
  isOwn,
  darkMode = false
}: MediaMessageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = mimeType?.startsWith('image/');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime?: string) => {
    if (!mime) return '📎';
    return FILE_TYPE_ICONS[mime] || '📎';
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const containerStyle: CSSProperties = {
    maxWidth: '240px'
  };

  const imageContainerStyle: CSSProperties = {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: darkMode ? '#374151' : '#F3F4F6'
  };

  const imageStyle: CSSProperties = {
    display: imageLoaded ? 'block' : 'none',
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px'
  };

  const imagePlaceholderStyle: CSSProperties = {
    display: imageLoaded ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    height: '150px',
    background: darkMode ? '#374151' : '#F3F4F6',
    borderRadius: '8px'
  };

  const fileContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: isOwn ? 'rgba(255,255,255,0.1)' : darkMode ? '#374151' : '#F3F4F6',
    borderRadius: '8px',
    cursor: 'pointer'
  };

  const fileIconStyle: CSSProperties = {
    fontSize: '28px',
    flexShrink: 0
  };

  const fileInfoStyle: CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const fileNameStyle: CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: isOwn ? 'white' : darkMode ? '#F3F4F6' : '#1F2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const fileSizeStyle: CSSProperties = {
    fontSize: '11px',
    color: isOwn ? 'rgba(255,255,255,0.7)' : darkMode ? '#9CA3AF' : '#6B7280'
  };

  const downloadIconStyle: CSSProperties = {
    fontSize: '16px',
    opacity: 0.7
  };

  // Lightbox styles
  const lightboxOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'zoom-out'
  };

  const lightboxImageStyle: CSSProperties = {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain'
  };

  const lightboxCloseStyle: CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const lightboxDownloadStyle: CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  if (isImage) {
    return (
      <>
        <div style={containerStyle}>
          <div
            style={imageContainerStyle}
            onClick={() => !imageError && setIsLightboxOpen(true)}
          >
            <div style={imagePlaceholderStyle}>
              <span style={{ fontSize: '24px' }}>🖼️</span>
            </div>
            {!imageError && (
              <img
                src={mediaUrl}
                alt={fileName || 'Image'}
                style={imageStyle}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
            {imageError && (
              <div style={{
                ...imagePlaceholderStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <span style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                  Failed to load
                </span>
              </div>
            )}
          </div>
          {fileName && (
            <div style={{
              fontSize: '11px',
              marginTop: '4px',
              opacity: 0.7,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {fileName}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <div
            style={lightboxOverlayStyle}
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              style={lightboxCloseStyle}
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
            >
              ✕
            </button>
            <img
              src={mediaUrl}
              alt={fileName || 'Image'}
              style={lightboxImageStyle}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              style={lightboxDownloadStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              ⬇ Download
            </button>
          </div>
        )}
      </>
    );
  }

  // File display
  return (
    <div style={containerStyle}>
      <div
        style={fileContainerStyle}
        onClick={handleDownload}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <span style={fileIconStyle}>{getFileIcon(mimeType)}</span>
        <div style={fileInfoStyle}>
          <div style={fileNameStyle}>{fileName || 'File'}</div>
          {fileSize && <div style={fileSizeStyle}>{formatFileSize(fileSize)}</div>}
        </div>
        <span style={downloadIconStyle}>⬇</span>
      </div>
    </div>
  );
}
