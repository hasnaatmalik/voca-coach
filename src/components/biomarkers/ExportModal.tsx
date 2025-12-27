'use client';

import { useState } from 'react';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  background: '#FAF7F3',
  cardBg: '#F0E4D3',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
};

// Icon components
const TableIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const CodeIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const DocumentIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const DownloadIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface ExportModalProps {
  onClose: () => void;
  onExport: (options: {
    format: 'csv' | 'json' | 'pdf';
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
}

export default function ExportModal({ onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let start: string | undefined;
      let end: string | undefined;

      if (dateRange === 'custom' && startDate && endDate) {
        start = startDate;
        end = endDate;
      } else if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const now = new Date();
        end = now.toISOString().split('T')[0];
        const startDateObj = new Date(now);
        startDateObj.setDate(startDateObj.getDate() - days);
        start = startDateObj.toISOString().split('T')[0];
      }

      await onExport({ format, startDate: start, endDate: end });
      onClose();
    } finally {
      setExporting(false);
    }
  };

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Spreadsheet format for Excel, Sheets',
      Icon: TableIcon,
      color: '#7AB89E',
    },
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Structured data for developers',
      Icon: CodeIcon,
      color: '#E4B17A',
    },
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional report with charts',
      Icon: DocumentIcon,
      color: themeColors.primary,
    },
  ];

  const dateOptions = [
    { value: '7d' as const, label: '7 days' },
    { value: '30d' as const, label: '30 days' },
    { value: '90d' as const, label: '90 days' },
    { value: 'all' as const, label: 'All time' },
    { value: 'custom' as const, label: 'Custom' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        background: 'rgba(45, 45, 45, 0.4)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          maxWidth: '400px',
          width: '95%',
          boxShadow: '0 20px 60px rgba(217, 162, 153, 0.25)',
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${themeColors.primary}10 0%, ${themeColors.secondary}10 100%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: `${themeColors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DownloadIcon color={themeColors.primaryDark} size={14} />
            </div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: themeColors.text }}>
              Export Data
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: 'none',
              background: themeColors.cardBg,
              color: themeColors.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '14px 18px', background: themeColors.background }}>
          {/* Format selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: themeColors.text, marginBottom: '8px' }}>
              Export Format
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {formatOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: format === option.value ? `2px solid ${themeColors.primaryDark}` : `1px solid ${themeColors.border}`,
                    background: format === option.value ? `${themeColors.primary}15` : 'white',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${option.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                  }}>
                    <option.Icon color={option.color} size={16} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: themeColors.text }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '9px', color: themeColors.textMuted, marginTop: '2px', lineHeight: 1.2 }}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date range selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: themeColors.text, marginBottom: '8px' }}>
              Date Range
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {dateOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: dateRange === option.value ? `2px solid ${themeColors.primaryDark}` : `1px solid ${themeColors.border}`,
                    background: dateRange === option.value ? `${themeColors.primary}15` : 'white',
                    color: dateRange === option.value ? themeColors.primaryDark : themeColors.textMuted,
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom date inputs */}
            {dateRange === 'custom' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', color: themeColors.textMuted, display: 'block', marginBottom: '4px' }}>
                    From
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${themeColors.border}`,
                      fontSize: '12px',
                      outline: 'none',
                      background: 'white',
                      color: themeColors.text,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', color: themeColors.textMuted, display: 'block', marginBottom: '4px' }}>
                    To
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${themeColors.border}`,
                      fontSize: '12px',
                      outline: 'none',
                      background: 'white',
                      color: themeColors.text,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'white',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${themeColors.border}`,
              background: 'white',
              color: themeColors.textMuted,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || (dateRange === 'custom' && (!startDate || !endDate))}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: exporting || (dateRange === 'custom' && (!startDate || !endDate))
                ? themeColors.border
                : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
              color: exporting || (dateRange === 'custom' && (!startDate || !endDate))
                ? themeColors.textMuted
                : themeColors.text,
              fontSize: '12px',
              fontWeight: 500,
              cursor: exporting || (dateRange === 'custom' && (!startDate || !endDate)) ? 'not-allowed' : 'pointer',
              boxShadow: exporting || (dateRange === 'custom' && (!startDate || !endDate))
                ? 'none'
                : '0 2px 8px rgba(217, 162, 153, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <DownloadIcon color={exporting || (dateRange === 'custom' && (!startDate || !endDate)) ? themeColors.textMuted : themeColors.text} size={12} />
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
