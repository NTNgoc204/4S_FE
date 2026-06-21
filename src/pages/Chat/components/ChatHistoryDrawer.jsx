import React from 'react';
import { useTranslation } from 'react-i18next';

function ChatHistoryDrawer({
  isOpen,
  onClose,
  sessionsLoading,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}) {
  const { t, i18n } = useTranslation('chat');
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';

  return (
    <>
      {/* Backdrop overlay when history is open */}
      {isOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar for Chat History - Premium floating overlay drawer */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-20 w-[280px] bg-[#071322]/98 backdrop-blur-lg flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 bg-[#0e213a]/50">
          <span className="font-['Sora'] font-bold text-slate-200 text-sm tracking-wide flex items-center gap-2">
            <svg className="h-4 w-4 text-[#ecc741]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('historyTitle')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[#ecc741] transition p-1 rounded-lg hover:bg-white/5 cursor-pointer active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.3)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-track]:bg-transparent">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#ecc741] border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-400">
                {t('noHistory')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {t('noHistoryDesc')}
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative flex items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                  currentSessionId === session.id
                    ? 'border-[#ecc741]/40 bg-[#ecc741]/8 text-slate-100 shadow-[0_0_12px_rgba(236,199,65,0.04)]'
                    : 'border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                    currentSessionId === session.id
                      ? 'border-[#ecc741]/30 bg-[#ecc741]/10 text-[#ecc741]'
                      : 'border-white/5 bg-white/[0.03] text-slate-400 group-hover:text-slate-300'
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${currentSessionId === session.id ? 'text-[#ecc741]' : 'text-slate-300'}`}>
                      {session.name || (locale === 'vi' ? `Phiên chat ${session.id.substring(0, 4)}` : `Chat Session ${session.id.substring(0, 4)}`)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(session.updatedAt || session.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session);
                  }}
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer focus:opacity-100"
                  title={t('deleteSession')}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ChatHistoryDrawer;
