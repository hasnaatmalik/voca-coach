'use client';

import { useState } from 'react';

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
      description: 'Spreadsheet-compatible format for Excel, Google Sheets',
      icon: 'Table',
    },
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Structured data format for developers and APIs',
      icon: 'Code',
    },
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional report with charts and insights',
      icon: 'Document',
    },
  ];

  const dateOptions = [
    { value: '7d' as const, label: 'Last 7 days' },
    { value: '30d' as const, label: 'Last 30 days' },
    { value: '90d' as const, label: 'Last 90 days' },
    { value: 'all' as const, label: 'All time' },
    { value: 'custom' as const, label: 'Custom range' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '95%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
            Export Biomarker Data
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#F3F4F6',
              color: '#6B7280',
              fontSize: '18px',
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
        <div style={{ padding: '24px' }}>
          {/* Format selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
              Export Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formatOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: format === option.value ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                    background: format === option.value ? '#F3E8FF' : 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{option.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date range selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
              Date Range
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dateOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: dateRange === option.value ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                    background: dateRange === option.value ? '#F3E8FF' : 'white',
                    color: dateRange === option.value ? '#7C3AED' : '#6B7280',
                    fontSize: '13px',
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
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                    From
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
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
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
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
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || (dateRange === 'custom' && (!startDate || !endDate))}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: exporting ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: exporting ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
