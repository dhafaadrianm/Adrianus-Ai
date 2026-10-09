import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, Paperclip, X, ArrowDown, Plus } from 'lucide-react';
import { ChatMessage as ChatMessageType } from './types/chat';
import { ChatMessage } from './components/ChatMessage';
import { SubsidiariesModal } from './components/SubsidiariesModal';

const ROTATING_TEXTS = [
  'Terus belajar & belajar',
  'Siap membantu anda kapanpun',
];

const SUGGESTIONS = [
  {
    label: '💡 Konsultasi Bisnis',
    prompt: 'Konsultasi bisnis terbaik',
  },
  {
    label: '💻 Coding & Pemrograman',
    prompt: 'Buatkan contoh kode Python',
  },
  {
    label: '📚 Belajar & Edukasi',
    prompt: 'Topik belajar dan edukasi',
  },
  {
    label: '🖨️ 3D Printing & Manufaktur',
    prompt: 'Solusi 3D printing & laser engraving',
  },
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('adrianus_chat_history');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adrianus_theme');
      if (stored !== null) return stored === 'dark';
      // Default always dark mode
      return true;
    }
    return true;
  });

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isEcosystemModalOpen, setIsEcosystemModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Dynamic text rotation effect
  const [dynamicTextIndex, setDynamicTextIndex] = useState(0);
  const [dynamicTextOpacity, setDynamicTextOpacity] = useState(1);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme synchronization with html class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('adrianus_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Dynamic subtitle rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicTextOpacity(0);
      setTimeout(() => {
        setDynamicTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
        setDynamicTextOpacity(1);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Web Speech API initialization
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
            .map((res: any) => res[0].transcript)
            .join('');
          setInputVal(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setIsListening(!isListening);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  // Persist chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adrianus_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll detection: allow user to freely scroll up and read without any interruptions
  const checkScrollPosition = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // If user is further than 45px from bottom, consider them scrolled up to read
    const isUp = distanceFromBottom > 45;
    isUserScrolledUpRef.current = isUp;
    setShowScrollBottomBtn(isUp);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      // User is scrolling upwards to read
      isUserScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    }
  };

  const handleTouchMove = () => {
    checkScrollPosition();
  };

  // Smooth scroll to bottom when user explicitly requests
  const scrollToBottom = () => {
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll ONLY when user has not intentionally scrolled up to read
  useEffect(() => {
    if (!isUserScrolledUpRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  const handleClearChat = () => {
    if (isLoading) handleStop();
    setMessages([]);
    setInputVal('');
    setAttachedFile(null);
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    localStorage.removeItem('adrianus_chat_history');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let finalPrompt = trimmed;
    if (attachedFile) {
      finalPrompt = `[Lampiran File: ${attachedFile.name} (${attachedFile.size})]\n\n${trimmed}`;
      setAttachedFile(null);
    }

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `asst_${Date.now() + 1}`;

    const newUserMessage: ChatMessageType = {
      id: userMessageId,
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now(),
    };

    const newAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages([...updatedMessages, newAssistantMessage]);
    setInputVal('');
    setIsLoading(true);

    // Reset user scroll state so user starts seeing the response
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.content,
          })),
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response stream tidak tersedia.');

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const l = line.trim();
          if (!l.startsWith('data:')) continue;
          const payload = l.slice(5).trim();

          if (payload === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              assistantContent += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch {
            // ignore non-json chunk
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: assistantContent, isStreaming: false }
            : msg
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  err.message || 'Terjadi kendala saat memproses jawaban. Silakan coba kembali.',
                isStreaming: false,
                error: true,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setMessages((prev) => prev.filter((m) => !m.error));
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setAttachedFile({ name: file.name, size: sizeStr });
    }
  };

  const isChatEmpty = messages.length === 0;

  return (
    <>
      {/* Top Bar dengan Apple-Style Sesi Baru button & Ekosistem Brand */}
      <div className="top-bar">
        <div className="w-full max-w-[768px] mx-auto flex justify-between items-center">
          <button
            onClick={() => setIsEcosystemModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Lihat ekosistem anak perusahaan PT DHAFA TETAP BERUSAHA"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Ekosistem Brand</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Tombol Sesi Chat Baru - Clean Modern ala UI/UX Apple */}
            <button
              onClick={handleClearChat}
              className="apple-new-chat-btn"
              title="Mulai sesi obrolan baru"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Sesi Baru</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle"
              id="themeToggleBtn"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Terkunci di Viewport, Scroll Area di Atas, Input di Bawah */}
      <div className="main-layout">
        {/* Chat Scroll Area dengan event listener onScroll & onWheel & onTouchMove */}
        <div
          className="chat-scroll-area"
          id="chatScrollArea"
          ref={scrollAreaRef}
          onScroll={checkScrollPosition}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
        >
          {isChatEmpty ? (
            <>
              {/* Header Sambutan */}
              <div className="header" id="welcomeHeader">
                <h1>Adrianus AI</h1>
                <p id="dynamic-text" style={{ opacity: dynamicTextOpacity }}>
                  {ROTATING_TEXTS[dynamicTextIndex]}
                </p>
                <div className="disclaimer-text">
                  Adrianus AI dapat menampilkan informasi yang mungkin berisi kesalahan.
                </div>
              </div>

              {/* Suggestion Cards Grid */}
              <div className="suggestions-grid" id="suggestionsGrid">
                {SUGGESTIONS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="suggestion-card"
                  >
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Chat Stream */
            <div
              id="chatStream"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}
            >
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLatest={index === messages.length - 1}
                  onRetry={msg.error ? handleRetryLast : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Apple-Style Pill saat pengguna menggulir ke atas untuk membaca pesan */}
        {showScrollBottomBtn && !isChatEmpty && (
          <button
            onClick={scrollToBottom}
            className="scroll-bottom-pill"
            title="Gulir ke pesan terbaru"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            <span>Pesan Terbaru</span>
          </button>
        )}

        {/* File attachment preview badge jika ada file dipilih */}
        {attachedFile && (
          <div className="w-full mb-2 flex items-center justify-between rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] px-3.5 py-2 text-xs text-[var(--text-primary)]">
            <div className="flex items-center gap-2 truncate">
              <Paperclip className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="truncate font-medium">{attachedFile.name}</span>
              <span className="text-[var(--text-secondary)]">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Bagian Bawah Tetap Terkunci (Input Perintah & Footer Permanen) */}
        <div className="bottom-pinned-area">
          <div className="input-wrapper">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="input-top"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Tombol Tambah Menu / Chat Baru */}
              <button
                type="button"
                onClick={() => {
                  if (!isChatEmpty) {
                    handleClearChat();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="action-icon-btn"
                title="Sesi Baru / Tambah"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Tombol Lampiran (Klip Kertas) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="action-icon-btn"
                title="Lampirkan File/Gambar"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Kolom Perintah: Menggunakan Transparan Penuh agar Tidak Pernah Menjadi Putih */}
              <input
                ref={inputRef}
                type="text"
                id="userInput"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isListening
                    ? 'Mendengarkan suara Anda...'
                    : isLoading
                    ? 'Adrianus AI sedang berpikir & menjawab...'
                    : 'Tanyakan apa saja kepada Adrianus AI...'
                }
                className="chat-input"
                style={{
                  backgroundColor: 'transparent',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                }}
              />

              {/* Tombol Suara */}
              <button
                type="button"
                onClick={handleToggleVoice}
                id="micBtn"
                className={`action-icon-btn ${isListening ? 'mic-active' : ''}`}
                title="Gunakan Suara"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

              {/* Tombol Kirim / Stop Pill */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="send-btn"
                  title="Hentikan Proses"
                >
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="send-btn disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Kirim Perintah"
                >
                  <svg viewBox="0 0 24 24">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Footer Tetap Hadir di Bawah Tanpa Hilang Ketika Menjalankan Perintah */}
          <div className="footer">
            Adrianus Ai dikembangkan oleh <span>PT DHAFA TETAP BERUSAHA</span> dilindungi oleh undang - undang{' '}
            <span
              className="privacy-link"
              id="openPrivacyModal"
              onClick={() => setIsPrivacyModalOpen(true)}
            >
              baca kebijakan penggunaan data dan privasi
            </span>
            .
          </div>
        </div>
      </div>

      {/* Modal Privacy Policy */}
      {isPrivacyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay"
          id="privacyModal"
          onClick={() => setIsPrivacyModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kebijakan Penggunaan Data & Privasi</h3>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="close-modal"
                id="closePrivacyModal"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>1. Pengantar</strong>
                <br />
                Kebijakan Privasi ini menjelaskan bagaimana Adrianus AI dan PT DHAFA TETAP BERUSAHA mengumpulkan, menggunakan, dan melindungi informasi serta data pribadi Anda saat menggunakan layanan kami.
              </p>
              <p>
                <strong>2. Pengumpulan Data</strong>
                <br />
                Kami mengumpulkan data interaksi, masukan teks, serta file atau gambar yang Anda unggah secara sukarela semata-mata untuk meningkatkan kualitas respons dan performa sistem kecerdasan buatan.
              </p>
              <p>
                <strong>3. Perlindungan Informasi</strong>
                <br />
                Seluruh data pengguna dilindungi dengan standar keamanan tinggi sesuai ketentuan hukum dan perundang-undangan yang berlaku di Republik Indonesia.
              </p>
              <p>
                <strong>4. Hak Kekayaan Intelektual</strong>
                <br />
                Seluruh elemen sistem, desain antarmuka, merek dagang Adrianus AI, dan ekosistem anak perusahaan di bawah PT DHAFA TETAP BERUSAHA dilindungi oleh undang-undang hak kekayaan intelektual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ekosistem Anak Perusahaan */}
      <SubsidiariesModal
        isOpen={isEcosystemModalOpen}
        onClose={() => setIsEcosystemModalOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
      />
    </>
  );
}
