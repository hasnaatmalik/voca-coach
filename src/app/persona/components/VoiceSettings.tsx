'use client';

interface VoiceSettingsProps {
  settings: {
    voiceStability: number;
    voiceSimilarity: number;
    voiceStyle: number;
    voiceSpeakerBoost: boolean;
    speechRate: number;
  };
  onChange: (settings: VoiceSettingsProps['settings']) => void;
}

export default function VoiceSettings({ settings, onChange }: VoiceSettingsProps) {
  const handleChange = (key: keyof typeof settings, value: number | boolean) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
        Voice Settings
      </div>

      {/* Stability */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: '#4B5563' }}>Stability</label>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{Math.round(settings.voiceStability * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.voiceStability}
          onChange={(e) => handleChange('voiceStability', parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #7C3AED ${settings.voiceStability * 100}%, #E5E7EB ${settings.voiceStability * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
          <span>More variable</span>
          <span>More stable</span>
        </div>
      </div>

      {/* Similarity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: '#4B5563' }}>Clarity + Similarity</label>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{Math.round(settings.voiceSimilarity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.voiceSimilarity}
          onChange={(e) => handleChange('voiceSimilarity', parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #7C3AED ${settings.voiceSimilarity * 100}%, #E5E7EB ${settings.voiceSimilarity * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Style */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: '#4B5563' }}>Style Exaggeration</label>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{Math.round(settings.voiceStyle * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.voiceStyle}
          onChange={(e) => handleChange('voiceStyle', parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #7C3AED ${settings.voiceStyle * 100}%, #E5E7EB ${settings.voiceStyle * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
          <span>None</span>
          <span>Exaggerated</span>
        </div>
      </div>

      {/* Speech Rate */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: '#4B5563' }}>Speech Rate</label>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{settings.speechRate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.speechRate}
          onChange={(e) => handleChange('speechRate', parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #7C3AED ${((settings.speechRate - 0.5) / 1.5) * 100}%, #E5E7EB ${((settings.speechRate - 0.5) / 1.5) * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
          <span>0.5x (Slow)</span>
          <span>2x (Fast)</span>
        </div>
      </div>

      {/* Speaker Boost */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        background: '#F9FAFB',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>Speaker Boost</div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Enhance voice clarity and presence</div>
        </div>
        <button
          onClick={() => handleChange('voiceSpeakerBoost', !settings.voiceSpeakerBoost)}
          style={{
            width: '48px',
            height: '26px',
            borderRadius: '13px',
            border: 'none',
            background: settings.voiceSpeakerBoost ? '#7C3AED' : '#D1D5DB',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s'
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: settings.voiceSpeakerBoost ? '24px' : '2px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }} />
        </button>
      </div>
    </div>
  );
}
