import React from 'react';
import { X, Check, AlertTriangle, ExternalLink, Mail, Send } from 'lucide-react';
import { ImBoredResponse } from '../types';

interface ImBoredModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImBoredResponse | null;
}

export const ImBoredModal: React.FC<ImBoredModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen || !result) return null;

  const isSuccess = result.status === 'sent';
  const isNoSmtp = result.status === 'no_smtp';

  const handleOpenMailto = () => {
    if (result.mailto_url) {
      window.location.href = result.mailto_url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e5e0d4] p-6 md:p-8 max-w-md w-full shadow-2xl relative font-mono-tech text-xs select-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-red-600 block mb-1 font-semibold">
            [ SIGNAL // IM BORED ]
          </span>
          <h3 className="text-2xl font-normal text-[#181c24] tracking-tight font-serif-editorial">
            {isSuccess ? 'Notification Sent' : 'I\'m Bored Signal'}
          </h3>
        </div>

        {isSuccess ? (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs mb-1">Email został pomyślnie wysłany!</p>
                <p className="text-[11px] text-emerald-800 font-sans leading-relaxed">
                  Powiadomienie dotarło do skrzynki partnera:
                </p>
                <p className="font-mono-tech font-bold text-xs mt-1 text-emerald-950">
                  {result.recipient_name} ({result.recipient_email})
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Twój partner otrzymał informację, że się nudzisz i myślisz o nim!
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#181c24] hover:bg-[#2c323f] text-white font-mono-tech text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <Mail className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs mb-1">
                  {isNoSmtp ? 'Wiadomość przygotowana do wysłania' : 'Błąd połączenia SMTP'}
                </p>
                <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                  Odbiorca: <strong className="text-stone-900">{result.recipient_name}</strong> ({result.recipient_email})
                </p>
              </div>
            </div>

            {isNoSmtp ? (
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Serwer pocztowy SMTP nie został jeszcze skonfigurowany w pliku <code className="bg-stone-100 px-1 py-0.5 border border-stone-200">.env</code>. Możesz wysłać przygotowanego maila jednym kliknięciem przez swój program pocztowy:
              </p>
            ) : (
              <p className="text-xs text-rose-700 font-sans leading-relaxed">
                {result.message}
              </p>
            )}

            <div className="p-3 bg-[#fcfbf8] border border-[#e5e0d4] text-[11px] text-stone-600 font-mono-tech space-y-1">
              <div><strong className="text-stone-800">Temat:</strong> {result.subject}</div>
              <div className="text-[10px] text-stone-500 truncate"><strong className="text-stone-800">Do:</strong> {result.recipient_email}</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-stone-500 hover:text-stone-800 text-[11px] uppercase tracking-wider transition-colors"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleOpenMailto}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono-tech text-xs uppercase tracking-wider font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Wyślij przez pocztę</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
