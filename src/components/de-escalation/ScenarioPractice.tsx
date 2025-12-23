'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DeEscalationScenario,
  ScenarioMessage,
  DEFAULT_SCENARIOS,
  VoiceBiomarkers
} from '@/types/de-escalation';

interface ScenarioPracticeProps {
  onClose: () => void;
  onComplete?: (scenarioId: string, score: number, messages: ScenarioMessage[]) => void;
  voiceId?: string;
  darkMode?: boolean;
}

type Stage = 'selection' | 'briefing' | 'practice' | 'complete';

export default function ScenarioPractice({
  onClose,
  onComplete,
  voiceId,
  darkMode = false,
}: ScenarioPracticeProps) {
  const [stage, setStage] = useState<Stage>('selection');
  const [selectedScenario, setSelectedScenario] = useState<DeEscalationScenario | null>(null);
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [currentBiomarkers, setCurrentBiomarkers] = useState<VoiceBiomarkers | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_ROUNDS = 5;

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';
  const cardBg = darkMode ? '#111827' : '#F9FAFB';

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start recording voice input
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice input - transcribe and analyze
  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const base64Audio = await blobToBase64(audioBlob);

      // Transcribe audio
      const transcribeRes = await fetch('/api/de-escalation/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!transcribeRes.ok) throw new Error('Transcription failed');
      const transcription = await transcribeRes.json();

      if (transcription.text) {
        // Analyze biomarkers
        const biomarkerRes = await fetch('/api/de-escalation/analyze-biomarkers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (biomarkerRes.ok) {
          const biomarkers = await biomarkerRes.json();
          setCurrentBiomarkers(biomarkers);
        }

        // Send the transcribed text
        await handleUserMessage(transcription.text);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle user message (text or transcribed)
  const handleUserMessage = async (text: string) => {
    if (!text.trim() || !selectedScenario) return;

    const userMessage: ScenarioMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiResponding(true);

    try {
      const response = await fetch('/api/de-escalation/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          message: text.trim(),
          conversationHistory: messages,
          biomarkers: currentBiomarkers,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      const aiMessage: ScenarioMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.response,
        timestamp: Date.now(),
        emotion: data.emotion,
        intensity: data.intensity,
      };

      setMessages(prev => [...prev, aiMessage]);
      setScore(prev => prev + (data.pointsEarned || 0));
      setRoundsCompleted(prev => prev + 1);

      // Speak AI response
      if (voiceId) {
        await speakResponse(data.response);
      }

      // Check if scenario is complete
      if (roundsCompleted + 1 >= MAX_ROUNDS) {
        setStage('complete');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Text-to-speech for AI responses
  const speakResponse = async (text: string) => {
    try {
      setIsAiSpeaking(true);
      const response = await fetch('/api/de-escalation/breathing-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: voiceId || '21m00Tcm4TlvDq8ikWAM',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audioRef.current = audio;
          audio.onended = () => setIsAiSpeaking(false);
          await audio.play();
        }
      }
    } catch (error) {
      console.error('Error speaking response:', error);
      setIsAiSpeaking(false);
    }
  };

  // Start scenario practice
  const startPractice = useCallback(() => {
    if (!selectedScenario) return;

    // Add initial AI message
    const initialMessage: ScenarioMessage = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: getInitialMessage(selectedScenario),
      timestamp: Date.now(),
    };

    setMessages([initialMessage]);
    setStage('practice');
    setRoundsCompleted(0);
    setScore(0);

    if (voiceId) {
      speakResponse(initialMessage.content);
    }
  }, [selectedScenario, voiceId]);

  const getInitialMessage = (scenario: DeEscalationScenario): string => {
    switch (scenario.category) {
      case 'conflict':
        return "Look, we need to talk. I've been waiting for this project for three weeks now, and you promised it would be done by last Friday. This is completely unacceptable.";
      case 'anxiety':
        return "Alright, thank you for that presentation. I have a few questions. First, can you explain how exactly you arrived at those projected figures? They seem quite optimistic.";
      case 'anger':
        return "I can't believe you did that. After everything I've done, this is how you repay me? You never think about how your actions affect others.";
      case 'panic':
        return "Okay, imagine you're stuck in heavy traffic. You're already 20 minutes late for an important meeting. Your phone just died. What's going through your mind right now?";
      default:
        return "Let's begin our scenario practice. How would you like to proceed?";
    }
  };

  const handleComplete = () => {
    if (onComplete && selectedScenario) {
      onComplete(selectedScenario.id, score, messages);
    }
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return mutedColor;
    }
  };

  // Selection Stage
  if (stage === 'selection') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}>
        <div style={{
          background: bgColor,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🎭</span>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor, margin: 0 }}>
                Scenario Practice
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>

          {/* Scenario List */}
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '14px', color: mutedColor, marginBottom: '16px' }}>
              Select a scenario to practice your de-escalation skills in a safe environment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DEFAULT_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setStage('briefing');
                  }}
                  style={{
                    padding: '16px',
                    background: cardBg,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: `1px solid ${borderColor}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px' }}>{scenario.icon}</span>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: textColor, margin: 0 }}>
                          {scenario.name}
                        </h3>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: `${getDifficultyColor(scenario.difficulty)}20`,
                          color: getDifficultyColor(scenario.difficulty),
                          borderRadius: '4px',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}>
                          {scenario.difficulty}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: mutedColor }}>→</span>
                  </div>
                  <p style={{ fontSize: '13px', color: mutedColor, margin: 0 }}>
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Briefing Stage
  if (stage === 'briefing' && selectedScenario) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}>
        <div style={{
          background: bgColor,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            background: `linear-gradient(135deg, ${getDifficultyColor(selectedScenario.difficulty)}20 0%, ${bgColor} 100%)`,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>
              {selectedScenario.icon}
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: textColor, margin: '0 0 8px 0' }}>
              {selectedScenario.name}
            </h2>
            <span style={{
              fontSize: '12px',
              padding: '4px 12px',
              background: getDifficultyColor(selectedScenario.difficulty),
              color: 'white',
              borderRadius: '999px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              {selectedScenario.difficulty}
            </span>
          </div>

          {/* Tips */}
          <div style={{ padding: '20px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: textColor,
              marginBottom: '12px',
            }}>
              💡 Tips for this scenario:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedScenario.tips?.map((tip, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px',
                    background: cardBg,
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ color: '#7C3AED' }}>✓</span>
                  <span style={{ fontSize: '13px', color: mutedColor }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '14px',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '12px',
              borderLeft: '3px solid #7C3AED',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7C3AED', marginBottom: '4px' }}>
                How it works
              </div>
              <div style={{ fontSize: '12px', color: mutedColor }}>
                You'll engage in a {MAX_ROUNDS}-round conversation. The AI will respond based on how well
                you apply de-escalation techniques. Speak calmly and use the tips above.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: '16px 20px 20px',
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={() => {
                setSelectedScenario(null);
                setStage('selection');
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: cardBg,
                color: textColor,
                border: 'none',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={startPractice}
              style={{
                flex: 2,
                padding: '14px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>▶️</span>
              Start Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice Stage
  if (stage === 'practice' && selectedScenario) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{selectedScenario.icon}</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: textColor, margin: 0 }}>
                {selectedScenario.name}
              </h3>
              <span style={{ fontSize: '12px', color: mutedColor }}>
                Round {roundsCompleted + 1} of {MAX_ROUNDS}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '999px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#7C3AED' }}>
                Score: {score}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#EF4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              End Session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '14px 18px',
                  borderRadius: message.role === 'user'
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  background: message.role === 'user'
                    ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                    : cardBg,
                  color: message.role === 'user' ? 'white' : textColor,
                }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    {message.content}
                  </p>
                  {message.emotion && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '11px',
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      opacity: 0.8,
                    }}>
                      Emotion: {message.emotion}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isAiResponding && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '18px 18px 18px 4px',
                  background: cardBg,
                }}>
                  <span style={{ fontSize: '14px', color: mutedColor }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${borderColor}`,
          background: cardBg,
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px',
          }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isAiResponding) {
                  handleUserMessage(inputText);
                }
              }}
              placeholder="Type your response..."
              disabled={isAiResponding || isRecording}
              style={{
                flex: 1,
                padding: '14px 18px',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                fontSize: '14px',
                color: textColor,
                outline: 'none',
              }}
            />

            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isAiResponding}
              style={{
                padding: '14px 20px',
                background: isRecording ? '#EF4444' : cardBg,
                color: isRecording ? 'white' : textColor,
                border: `1px solid ${isRecording ? '#EF4444' : borderColor}`,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{isRecording ? '⏹️' : '🎤'}</span>
              {isRecording ? 'Recording...' : 'Hold to Speak'}
            </button>

            <button
              onClick={() => handleUserMessage(inputText)}
              disabled={!inputText.trim() || isAiResponding}
              style={{
                padding: '14px 24px',
                background: inputText.trim() && !isAiResponding
                  ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                  : darkMode ? '#374151' : '#E5E7EB',
                color: inputText.trim() && !isAiResponding ? 'white' : mutedColor,
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: inputText.trim() && !isAiResponding ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>

          {/* Speaking indicator */}
          {isAiSpeaking && (
            <div style={{
              maxWidth: '700px',
              margin: '12px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              color: mutedColor,
            }}>
              <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>🔊</span>
              AI is speaking...
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Complete Stage
  if (stage === 'complete' && selectedScenario) {
    const maxScore = MAX_ROUNDS * 20; // Assuming max 20 points per round
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}>
        <div style={{
          background: bgColor,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '450px',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Header */}
          <div style={{
            padding: '32px 24px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>
              {percentage >= 70 ? '🎉' : percentage >= 40 ? '👍' : '💪'}
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: textColor, margin: '0 0 8px 0' }}>
              {percentage >= 70 ? 'Excellent Work!' : percentage >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
            </h2>
            <p style={{ fontSize: '14px', color: mutedColor, margin: 0 }}>
              You've completed the {selectedScenario.name} scenario
            </p>
          </div>

          {/* Score */}
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '24px',
            }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#7C3AED' }}>
                  {score}
                </div>
                <div style={{ fontSize: '12px', color: mutedColor }}>Points Earned</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981' }}>
                  {percentage}%
                </div>
                <div style={{ fontSize: '12px', color: mutedColor }}>Performance</div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: cardBg,
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                💡 Tip for next time
              </div>
              <p style={{ fontSize: '13px', color: mutedColor, margin: 0 }}>
                {percentage >= 70
                  ? "You showed great de-escalation skills. Try a harder scenario next!"
                  : percentage >= 40
                  ? "Remember to pause before responding and acknowledge the other person's feelings."
                  : "Take more time to breathe and use grounding techniques before responding."}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setStage('selection');
                  setSelectedScenario(null);
                  setMessages([]);
                  setScore(0);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: cardBg,
                  color: textColor,
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Try Another
              </button>
              <button
                onClick={handleComplete}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
