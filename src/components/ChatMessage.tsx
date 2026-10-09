import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'kode program')
      .replace(/[#*`_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="user-message-wrapper">
        <div className="user-bubble">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Remove trailing footer from main body if already present to avoid duplication with .ai-message-footer
  const cleanBody = message.content.replace(
    /\n*— Adrianus adalah AI, mungkin bisa membuat kesalahan\.\s*$/,
    ''
  );

  return (
    <div className="ai-message-wrapper">
      <div className="ai-message-header">
        <span>Adrianus AI</span>
        {!message.isStreaming && !message.error && message.content.length > 0 && (
          <div className="flex items-center gap-1 font-normal">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              title="Salin teks"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span className="text-[11px]">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleToggleSpeech}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              title={isPlayingAudio ? 'Hentikan audio' : 'Dengarkan suara'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3 w-3 text-[var(--text-primary)]" />
                  <span className="text-[11px]">Hentikan</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  <span className="text-[11px]">Dengar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="ai-message-body">
        {message.error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-500">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Gagal memproses jawaban</span>
            </div>
            <p className="mt-1">{message.content}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2.5 inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-white hover:bg-red-700 transition cursor-pointer"
              >
                Coba Lagi
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <MarkdownRenderer content={cleanBody} />
            {message.isStreaming && (
              <span className="inline-block h-4 w-1.5 ml-1 animate-pulse rounded-full bg-[var(--text-primary)] align-middle" />
            )}
          </div>
        )}
      </div>

      {!message.error && (
        <div className="ai-message-footer">
          — Adrianus adalah AI, mungkin bisa membuat kesalahan.
        </div>
      )}
    </div>
  );
};
