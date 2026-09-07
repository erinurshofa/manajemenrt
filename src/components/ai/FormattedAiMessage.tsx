import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  AlertCircle,
  Info,
  CheckCircle2,
  ListOrdered,
  Sparkles,
} from 'lucide-react';

interface FormattedAiMessageProps {
  content: string;
}

/**
 * Helper to parse inline markdown: **bold**, *italic*, `code`, and [links](url)
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex to split by bold (**text**), italic (*text*), code (`text`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-stone-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-amber-100/70 text-amber-900 font-mono text-[12px] font-semibold border border-amber-200/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Subcomponent for Copyable Letter / Announcement Draft Box
 */
const DraftCard: React.FC<{ draftText: string }> = ({ draftText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-xl border border-amber-300/80 bg-gradient-to-b from-[#fffefb] to-[#fbf7ee] shadow-sm overflow-hidden">
      {/* Draft Header */}
      <div className="px-3.5 py-2 bg-amber-100/60 border-b border-amber-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-amber-700" />
          <span>Draf Surat / Pengumuman Resmi RT</span>
        </div>
        <button
          onClick={handleCopyDraft}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors shadow-2xs cursor-pointer"
          title="Salin isi draf ini"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-amber-700" />
              <span>Salin Draf</span>
            </>
          )}
        </button>
      </div>

      {/* Draft Content */}
      <div className="p-4 font-sans text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap select-text border-l-2 border-amber-500/40 ml-2 my-2 bg-white/70 rounded-r-lg">
        {draftText}
      </div>
    </div>
  );
};

export const FormattedAiMessage: React.FC<FormattedAiMessageProps> = ({ content }) => {
  if (!content) return null;

  // Split content into blocks: code/draft blocks vs standard markdown paragraphs
  const rawLines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let currentListItems: { type: 'ul' | 'ol'; text: string; num?: string }[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentListItems.length === 0) return;

    const isNumbered = currentListItems[0].type === 'ol';
    elements.push(
      <div key={`list-${keyPrefix}`} className="my-2.5 space-y-1.5 pl-0.5">
        {currentListItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
            {isNumbered ? (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/70 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.num || idx + 1}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2 ml-1.5" />
            )}
            <div className="flex-1 text-stone-800">{renderInlineFormatting(item.text)}</div>
          </div>
        ))}
      </div>
    );
    currentListItems = [];
  };

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check code/draft blocks (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <DraftCard key={`draft-${idx}`} draftText={codeBlockBuffer.join('\n')} />
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        flushList(`before-code-${idx}`);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    // Unordered List (-, *, •)
    const ulMatch = line.match(/^[\s]*[-*•]\s+(.+)/);
    if (ulMatch) {
      currentListItems.push({ type: 'ul', text: ulMatch[1] });
      return;
    }

    // Ordered List (1., 2., a., b.)
    const olMatch = line.match(/^[\s]*([0-9]+|[a-zA-Z])\.\s+(.+)/);
    if (olMatch) {
      currentListItems.push({ type: 'ol', text: olMatch[2], num: olMatch[1] });
      return;
    }

    // Not a list item -> flush list if any
    flushList(`flush-${idx}`);

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    // Headings (###, ##, #)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <div
          key={`h3-${idx}`}
          className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide mt-3 mb-1.5 pb-1 border-b border-amber-200/60 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{trimmed.replace(/^###\s+/, '')}</span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h4
          key={`h2-${idx}`}
          className="text-sm sm:text-base font-bold text-stone-900 mt-3.5 mb-1.5 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-amber-600 rounded-full" />
          <span>{trimmed.replace(/^##\s+/, '')}</span>
        </h4>
      );
      return;
    }

    // Blockquote (>)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${idx}`}
          className="my-2.5 p-3 rounded-xl bg-amber-50/70 border-l-4 border-amber-600 text-xs sm:text-sm text-stone-700 leading-relaxed flex items-start gap-2.5 shadow-2xs"
        >
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>{renderInlineFormatting(quoteText)}</div>
        </div>
      );
      return;
    }

    // Normal Paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-stone-800 my-1">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  // Flush remaining list items if text ends with a list
  flushList('final');

  // If unclosed code block, render it
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    elements.push(
      <DraftCard key="draft-final" draftText={codeBlockBuffer.join('\n')} />
    );
  }

  return <div className="space-y-1 text-stone-800 font-sans antialiased">{elements}</div>;
};
