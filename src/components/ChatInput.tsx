import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  inputRef: externalRef,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text, textareaRef]);

  // Speech recognition setup if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setText(transcript);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition failed to start:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-neutral-300/80 bg-white p-2 shadow-xs transition-all focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus-within:border-neutral-600 dark:focus-within:ring-neutral-700"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan apa saja kepada Adrianus AI..."
          rows={1}
          disabled={isLoading}
          className="max-h-[180px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[14px] sm:text-[15px] text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
        />

        <div className="flex items-center gap-1 pb-1">
          {/* Voice button */}
          {recognitionRef.current && (
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
              }`}
              title={isRecording ? 'Hentikan rekaman suara' : 'Gunakan suara (dikte)'}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* Send / Stop button */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              title="Hentikan pembuatan respon"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              title="Kirim pesan"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      <p className="mt-2 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        Adrianus AI dimiliki oleh <strong className="font-semibold text-neutral-600 dark:text-neutral-400">PT DHAFA TETAP BERUSAHA</strong>. Respon dirancang presisi, terpercaya, dan ringkas.
      </p>
    </div>
  );
};
