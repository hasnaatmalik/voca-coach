'use client';

import { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';

interface MediaUploaderProps {
  onFileSelect: (file: File, preview?: string) => void;
  onCancel: () => void;
  accept?: string;
  maxSize?: number; // bytes, default 10MB
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
  'audio/mpeg': '🎵',
  'audio/wav': '🎵',
  'video/mp4': '🎬',
  'video/quicktime': '🎬',
};

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export default function MediaUploader({
  onFileSelect,
  onCancel,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
  maxSize = 10 * 1024 * 1024, // 10MB
  darkMode = false
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileValidation(file);
            return;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileValidation = useCallback((file: File) => {
    setError(null);

    // Check file type
    const isAllowedType = ALLOWED_TYPES.includes(file.type) || file.type.startsWith('image/');
    if (!isAllowedType) {
      setError('File type not supported');
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [maxSize]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileValidation(file);
    }
  }, [handleFileValidation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, preview || undefined);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    return FILE_TYPE_ICONS[mimeType] || '📎';
  };

  const containerStyle: CSSProperties = {
    padding: '16px',
    background: darkMode ? '#1F2937' : 'white',
    borderTop: '1px solid',
    borderColor: darkMode ? '#374151' : '#E5E7EB'
  };

  const dropZoneStyle: CSSProperties = {
    border: `2px dashed ${isDragging ? '#7C3AED' : darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    background: isDragging
      ? (darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)')
      : 'transparent',
    transition: 'all 0.2s ease'
  };

  const previewContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const imagePreviewStyle: CSSProperties = {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
    margin: '0 auto'
  };

  const fileInfoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: darkMode ? '#374151' : '#F3F4F6',
    borderRadius: '8px'
  };

  const fileIconStyle: CSSProperties = {
    fontSize: '32px'
  };

  const fileDetailsStyle: CSSProperties = {
    flex: 1,
    overflow: 'hidden'
  };

  const fileNameStyle: CSSProperties = {
    fontWeight: '500',
    fontSize: '14px',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const fileSizeStyle: CSSProperties = {
    fontSize: '12px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const buttonRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px'
  };

  const cancelButtonStyle: CSSProperties = {
    padding: '8px 16px',
    background: 'transparent',
    border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '8px',
    color: darkMode ? '#D1D5DB' : '#6B7280',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const sendButtonStyle: CSSProperties = {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const errorStyle: CSSProperties = {
    color: '#EF4444',
    fontSize: '13px',
    marginTop: '8px',
    textAlign: 'center'
  };

  const hintStyle: CSSProperties = {
    fontSize: '12px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    marginTop: '8px'
  };

  return (
    <div style={containerStyle}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <div
          ref={dropZoneRef}
          style={dropZoneStyle}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>
            {isDragging ? '📥' : '📎'}
          </div>
          <div style={{
            fontWeight: '500',
            color: darkMode ? '#F3F4F6' : '#1F2937',
            marginBottom: '4px'
          }}>
            {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
          </div>
          <div style={hintStyle}>
            Images, PDFs, documents up to {formatFileSize(maxSize)}
          </div>
          <div style={{ ...hintStyle, marginTop: '4px' }}>
            Tip: Press Ctrl+V to paste images
          </div>
        </div>
      ) : (
        <div style={previewContainerStyle}>
          {preview ? (
            <img src={preview} alt="Preview" style={imagePreviewStyle} />
          ) : (
            <div style={fileInfoStyle}>
              <span style={fileIconStyle}>
                {getFileIcon(selectedFile.type)}
              </span>
              <div style={fileDetailsStyle}>
                <div style={fileNameStyle}>{selectedFile.name}</div>
                <div style={fileSizeStyle}>{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
          )}

          {preview && (
            <div style={fileInfoStyle}>
              <div style={fileDetailsStyle}>
                <div style={fileNameStyle}>{selectedFile.name}</div>
                <div style={fileSizeStyle}>{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      <div style={buttonRowStyle}>
        <button
          style={cancelButtonStyle}
          onClick={onCancel}
          onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#F3F4F6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Cancel
        </button>
        {selectedFile && (
          <button
            style={sendButtonStyle}
            onClick={handleSend}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
