import React from 'react';
import { Sparkles, Building2, Sun, Moon, Plus } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSubsidiaries: () => void;
  onNewChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSubsidiaries,
  onNewChat,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Adrianus AI
              </span>
              <span className="hidden text-neutral-300 dark:text-neutral-700 sm:inline" aria-hidden="true">
                /
              </span>
              <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:inline font-medium">
                PT DHAFA TETAP BERUSAHA
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 sm:hidden">
              PT DHAFA TETAP BERUSAHA
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Subsidiaries Button */}
          <button
            onClick={onOpenSubsidiaries}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            title="Lihat anak perusahaan & ekosistem PT Dhafa Tetap Berusaha"
          >
            <Building2 className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">Ekosistem Brand</span>
            <span className="sm:hidden">Ekosistem</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            title="Mulai percakapan baru"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">Sesi Baru</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
            title={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
