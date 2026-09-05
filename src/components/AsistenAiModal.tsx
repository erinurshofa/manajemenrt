import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { ProfilRt } from '../types';
import { askGeminiAssistant, ChatMessage } from '../services/geminiService';

interface AsistenAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRt: ProfilRt;
  totalWarga?: number;
  totalKk?: number;
  saldoKas?: number;
}

const QUICK_PROMPTS = [
  '📋 Syarat Surat Pengantar SKCK',
  '📑 Syarat Pembuatan KK Baru',
  '🌙 Aturan Jam Malam & Tamu',
  '✉️ Draf Undangan Kerja Bakti',
  '💰 Informasi Iuran Kas RT',
];

export const AsistenAiModal: React.FC<AsistenAiModalProps> = ({
  isOpen,
  onClose,
  profilRt,
  totalWarga = 0,
  totalKk = 0,
  saldoKas = 0,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Halo warga & pengurus Gasem Raya RT ${profilRt.nomorRt} / RW ${profilRt.nomorRw}! 👋\n\nSaya **Asisten Cerdas RT**, siap membantu Anda seputar persyaratan surat menyurat, tata tertib lingkungan Kelurahan ${profilRt.desaKelurahan}, perumusan draf pengumuman resmi, dan informasi layanan warga. Ada yang bisa saya bantu hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await askGeminiAssistant(query, messages, {
        profilRt,
        totalWarga,
        totalKk,
        saldoKas,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Maaf, terjadi kendala saat menghubungkan ke Gemini AI: ${err?.message || 'Silakan periksa koneksi internet.'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'ai',
        text: `Percakapan telah direset. Ada hal lain yang ingin Anda tanyakan seputar RT ${profilRt.nomorRt} Gasem Raya?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#2c1408] via-[#3d1c0b] to-[#250d03] text-amber-100 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-white tracking-wide">
                  Asisten Cerdas RT Gasem Raya
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini AI Aktif
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Konsultasi administrasi, syarat surat, AD/ART & tata tertib RT 02 / RW 04
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Mulai percakapan baru"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Tutup jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                  msg.sender === 'user'
                    ? 'bg-amber-800 text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                
                <div className="mt-2 pt-1 flex items-center justify-between border-t border-black/5 text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:opacity-100 flex items-center gap-1 text-[10px] text-amber-900 font-semibold cursor-pointer"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-stone-700 text-stone-200 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-none p-3.5 shadow-xs flex items-center gap-2 text-xs text-stone-600">
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                <span>Asisten sedang merumuskan jawaban...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-stone-200 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
          <span className="text-[11px] font-semibold text-stone-400 shrink-0">Contoh:</span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Tanyakan syarat surat, aturan RT, atau minta buatkan draf pengumuman..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow cursor-pointer active:scale-95 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
