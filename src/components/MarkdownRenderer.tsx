import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-[15px] leading-relaxed break-words font-sans text-[var(--text-primary)]">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = firstLine.length > 0 && !firstLine.includes(' ') && lines.length > 1;
          const language = hasLang ? firstLine : '';
          const code = (hasLang ? lines.slice(1) : lines).join('\n');

          return <CodeBlock key={index} language={language} code={code} />;
        }

        const paragraphs = part.split(/\n\n+/);
        return (
          <React.Fragment key={index}>
            {paragraphs.map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base font-semibold tracking-tight text-[var(--text-primary)] pt-2 pb-0.5">
                    {renderInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={pIdx} className="text-lg font-semibold tracking-tight text-[var(--text-primary)] pt-2 pb-1">
                    {renderInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={pIdx} className="text-xl font-bold tracking-tight text-[var(--text-primary)] pt-2 pb-1">
                    {renderInline(trimmed.slice(2))}
                  </h1>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={pIdx}
                    className="border-l-2 border-[var(--text-secondary)] pl-3.5 italic text-[var(--text-secondary)] my-2"
                  >
                    {renderInline(trimmed.replace(/^>\s*/gm, ''))}
                  </blockquote>
                );
              }

              const lines = trimmed.split('\n');
              const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
              const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

              if (isBulletList) {
                return (
                  <ul key={pIdx} className="list-disc list-outside pl-5 space-y-1 text-[var(--text-primary)]">
                    {lines.map((l, lIdx) => (
                      <li key={lIdx}>{renderInline(l.trim().replace(/^[-*]\s+/, ''))}</li>
                    ))}
                  </ul>
                );
              }

              if (isNumberedList) {
                return (
                  <ol key={pIdx} className="list-decimal list-outside pl-5 space-y-1 text-[var(--text-primary)]">
                    {lines.map((l, lIdx) => (
                      <li key={lIdx}>{renderInline(l.trim().replace(/^\d+\.\s+/, ''))}</li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={pIdx} className="text-[var(--text-primary)] leading-relaxed">
                  {lines.map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {renderInline(line)}
                      {lineIdx < lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    let extension = 'txt';
    const lang = language.toLowerCase();
    if (lang === 'python' || lang === 'py') extension = 'py';
    else if (lang === 'javascript' || lang === 'js') extension = 'js';
    else if (lang === 'typescript' || lang === 'ts') extension = 'ts';
    else if (lang === 'html') extension = 'html';
    else if (lang === 'css') extension = 'css';
    else if (lang === 'json') extension = 'json';
    else if (lang === 'cpp' || lang === 'c++') extension = 'cpp';
    else if (lang === 'java') extension = 'java';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adrianus_script.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-[8px] bg-[var(--code-bg)] border border-[var(--border-color)] p-3 pt-3 font-mono text-[13px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-secondary)] font-mono">
          {language || 'code'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="rounded-[4px] border border-[var(--border-color)] bg-[var(--surface-color)] px-2 py-1 text-[11px] text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]"
            title="Salin kode"
          >
            {copied ? 'Tersalin' : 'Salin'}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-[4px] border border-[var(--border-color)] bg-[var(--surface-color)] px-2 py-1 text-[11px] text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]"
            title="Download kode"
          >
            Download
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto text-[13px] font-mono leading-relaxed text-[var(--text-primary)]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-[var(--text-primary)]">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-xs font-mono text-[var(--text-primary)] border border-[var(--border-color)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const labelMatch = token.match(/\[(.*?)\]/);
      const urlMatch = token.match(/\((.*?)\)/);
      if (labelMatch && urlMatch) {
        tokens.push(
          <a
            key={match.index}
            href={urlMatch[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-primary)] underline underline-offset-2 hover:opacity-80"
          >
            {labelMatch[1]}
          </a>
        );
      }
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}
