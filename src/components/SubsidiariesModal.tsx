import React, { useState } from 'react';
import { X, Printer, Shirt, UtensilsCrossed, Sparkles, ShieldCheck, ChevronRight, Lock, Youtube, ExternalLink } from 'lucide-react';
import { SubsidiaryInfo } from '../types/chat';

interface SubsidiariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  initialTab?: 'ecosystem' | 'privacy';
}

export const SubsidiariesModal: React.FC<SubsidiariesModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  initialTab = 'ecosystem',
}) => {
  const [activeTab, setActiveTab] = useState<'ecosystem' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  const subsidiaries: Array<
    SubsidiaryInfo & { icon: React.ReactNode; prompt: string; website?: string }
  > = [
    {
      id: 'rexel',
      name: 'REXEL ID',
      category: 'Media Digital & YouTube Content',
      headline: 'Channel YouTube Populer (>200.000 Subscribers)',
      description:
        'Channel YouTube terkemuka di bawah naungan PT DHAFA TETAP BERUSAHA dengan lebih dari 200.000 subscribers, menghadirkan konten-konten berkualitas tinggi yang menarik dan informatif bagi para penonton di Indonesia maupun Jepang.',
      capabilities: ['200.000+ Subscribers', 'High-Quality Digital Content', 'Jangkauan Indonesia & Jepang', 'Creative Entertainment'],
      parentBrand: 'PT DHAFA TETAP BERUSAHA',
      website: 'https://rexelid.my.id/',
      icon: <Youtube className="h-5 w-5 text-[#ff0000]" />,
      prompt: 'Ceritakan tentang channel YouTube REXEL ID dan prestasinya.',
    },
    {
      id: 'arata',
      name: 'Arata Manufacturing',
      category: 'Manufaktur & 3D Prototyping',
      headline: '3D Printing & Laser Engraving Mutakhir',
      description:
        'Divisi manufaktur presisi di bawah PT DHAFA TETAP BERUSAHA yang melayani industrial-grade 3D printing, laser cutting/engraving, serta rapid prototyping berkualitas tinggi.',
      capabilities: ['Industrial 3D Printing', 'Laser Engraving & Marking', 'Rapid Prototyping', 'Precision Parts Fabrication'],
      parentBrand: 'PT DHAFA TETAP BERUSAHA',
      website: 'https://aratamanufacturing.my.id/',
      icon: <Printer className="h-5 w-5 text-[#f5f5f7]" />,
      prompt: 'Jelaskan layanan manufaktur, 3D printing, dan laser engraving dari Arata Manufacturing.',
    },
    {
      id: 'vadeel',
      name: 'Vadeel Clothing',
      category: 'Fashion & Apparel',
      headline: 'Lini Busana Kontemporer & Elegan',
      description:
        'Brand apparel dengan perpaduan kenyamanan premium, siluet kontemporer, dan material bermutu tinggi dengan estetika minimalis modern.',
      capabilities: ['Premium Daily Wear', 'Contemporary Streetwear', 'Custom Corporate Apparel', 'Minimalist Aesthetics'],
      parentBrand: 'PT DHAFA TETAP BERUSAHA',
      icon: <Shirt className="h-5 w-5 text-[#f5f5f7]" />,
      prompt: 'Berikan rekomendasi produk dan konsep busana dari Vadeel Clothing.',
    },
    {
      id: 'flitoo',
      name: 'Flitoo Food',
      category: 'Food & Beverage / Snack',
      headline: 'Camilan Berkualitas & Pilihan Kuliner Lezat',
      description:
        'Koleksi makanan ringan, camilan lezat, serta aneka produk pangan modern dengan standar higienis tinggi dan cita rasa istimewa.',
      capabilities: ['Artisanal Snacks', 'Gourmet Flavors', 'Hygienic Standards', 'Delightful Food Experiences'],
      parentBrand: 'PT DHAFA TETAP BERUSAHA',
      icon: <UtensilsCrossed className="h-5 w-5 text-[#f5f5f7]" />,
      prompt: 'Apa saja varian camilan dan produk makanan unggulan dari Flitoo Food?',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subsidiaries-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] flex flex-col text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--text-secondary)]">
                PT DHAFA TETAP BERUSAHA
              </span>
            </div>
            <h2 id="subsidiaries-modal-title" className="text-xl font-semibold tracking-tight text-[var(--text-primary)] mt-1">
              {activeTab === 'ecosystem' ? 'Ekosistem Bisnis & Anak Perusahaan' : 'Kebijakan Penggunaan Data & Privasi'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mt-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
          <button
            onClick={() => setActiveTab('ecosystem')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'ecosystem'
                ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Portofolio Perusahaan
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Kebijakan Privasi
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1">
          {activeTab === 'ecosystem' ? (
            <div className="space-y-3.5">
              {subsidiaries.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 transition-all hover:bg-[var(--surface-hover)]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]">
                      {sub.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            {sub.name}
                          </h3>
                          {sub.website && (
                            <a
                              href={sub.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
                            >
                              <span>Website</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {sub.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[var(--text-primary)] opacity-90">
                        {sub.headline}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                        {sub.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {sub.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="text-[11px] text-[var(--text-secondary)] bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--border-color)]"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex justify-end">
                        <button
                          onClick={() => {
                            onSelectPrompt(sub.prompt);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)] hover:underline transition cursor-pointer"
                        >
                          <span>Tanyakan ke Adrianus AI</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--text-primary)] text-[var(--bg-color)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      Adrianus AI
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Asisten intelijensi buatan resmi yang terintegrasi langsung dengan ekosistem PT DHAFA TETAP BERUSAHA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium mb-1">
                  <Lock className="h-4 w-4" />
                  <span>Prinsip Perlindungan Privasi Ketat</span>
                </div>
                <p>
                  Adrianus AI dikembangkan dan dioperasikan di bawah naungan PT DHAFA TETAP BERUSAHA. Sistem ini mematuhi standar perlindungan data dan kerahasiaan informasi yang ketat.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">1. Informasi Pendiri & Privasi Profesional</h4>
                <p>
                  Dhafa Adrian Maulana adalah pendiri dan visionary di balik PT Dhafa Tetap Berusaha. Beliau adalah sosok yang memprakarsai lahirnya ekosistem bisnis modern ini. Namun, demi menjaga privasi dan batasan profesional, detail kehidupan pribadi beliau tidak dipublikasikan secara luas, karena fokus utama kami adalah mendedikasikan inovasi dan layanan terbaik bagi para pengguna.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">2. Pengolahan Data Percakapan</h4>
                <p>
                  Percakapan Anda diproses semata-mata untuk memberikan jawaban yang akurat, terstruktur, dan relevan. Data tidak disalahgunakan untuk kepentingan pihak ketiga tanpa persetujuan.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">3. Perlindungan Hak Cipta</h4>
                <p>
                  Seluruh merek dagang, termasuk REXEL ID, Arata Manufacturing, Vadeel Clothing, Flitoo Food, dan Adrianus AI, merupakan aset sah milik PT DHAFA TETAP BERUSAHA dan dilindungi oleh undang-undang yang berlaku di Republik Indonesia.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Hak Cipta & Kepemilikan: PT DHAFA TETAP BERUSAHA</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-primary)] hover:underline font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
