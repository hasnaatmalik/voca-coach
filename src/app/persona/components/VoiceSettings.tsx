'use client';

// Theme colors from globals.css - wellness theme
const THEME = {
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  tan: '#DCC5B2',
  rose: '#D9A299',
  roseDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  success: '#7AB89E',
};

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
      <div style={{ fontSize: '14px', fontWeight: '600', color: THEME.text, marginBottom: '4px' }}>
        Voice Settings
      </div>

      {/* Stability */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: THEME.text }}>Stability</label>
          <span style={{ fontSize: '13px', color: THEME.textMuted }}>{Math.round(settings.voiceStability * 100)}%</span>
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
            background: `linear-gradient(to right, ${THEME.rose} ${settings.voiceStability * 100}%, ${THEME.beige} ${settings.voiceStability * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: THEME.textMuted }}>
          <span>More variable</span>
          <span>More stable</span>
        </div>
      </div>

      {/* Similarity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: THEME.text }}>Clarity + Similarity</label>
          <span style={{ fontSize: '13px', color: THEME.textMuted }}>{Math.round(settings.voiceSimilarity * 100)}%</span>
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
            background: `linear-gradient(to right, ${THEME.rose} ${settings.voiceSimilarity * 100}%, ${THEME.beige} ${settings.voiceSimilarity * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: THEME.textMuted }}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Style */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: THEME.text }}>Style Exaggeration</label>
          <span style={{ fontSize: '13px', color: THEME.textMuted }}>{Math.round(settings.voiceStyle * 100)}%</span>
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
            background: `linear-gradient(to right, ${THEME.rose} ${settings.voiceStyle * 100}%, ${THEME.beige} ${settings.voiceStyle * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: THEME.textMuted }}>
          <span>None</span>
          <span>Exaggerated</span>
        </div>
      </div>

      {/* Speech Rate */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', color: THEME.text }}>Speech Rate</label>
          <span style={{ fontSize: '13px', color: THEME.textMuted }}>{settings.speechRate.toFixed(1)}x</span>
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
            background: `linear-gradient(to right, ${THEME.rose} ${((settings.speechRate - 0.5) / 1.5) * 100}%, ${THEME.beige} ${((settings.speechRate - 0.5) / 1.5) * 100}%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: THEME.textMuted }}>
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
        background: THEME.beige,
        borderRadius: '10px',
        border: `1px solid ${THEME.tan}`,
      }}>
        <div>
          <div style={{ fontSize: '13px', color: THEME.text, fontWeight: '500' }}>Speaker Boost</div>
          <div style={{ fontSize: '11px', color: THEME.textMuted }}>Enhance voice clarity and presence</div>
        </div>
        <button
          onClick={() => handleChange('voiceSpeakerBoost', !settings.voiceSpeakerBoost)}
          style={{
            width: '48px',
            height: '26px',
            borderRadius: '13px',
            border: 'none',
            background: settings.voiceSpeakerBoost ? THEME.rose : THEME.tan,
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
