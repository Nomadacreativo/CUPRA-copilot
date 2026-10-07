import React, { useState } from 'react';
import { 
  Users, 
  Terminal, 
  AlertTriangle, 
  Flame,
  LogIn,
  LogOut,
  UserCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { Lead } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'crm' | 'copilot' | 'showroom' | 'financing' | 'testdrive' | 'whatsapp';
  setActiveTab: (tab: 'crm' | 'copilot' | 'showroom' | 'financing' | 'testdrive' | 'whatsapp') => void;
  leads: Lead[];
  onOpenQuickCommands: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  leads,
  onOpenQuickCommands,
}) => {
  const { user, signInWithGoogle, signInAsGuest, logOut, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const hotLeadsCount = leads.filter((l) => l.stage === 'hot').length;
  const freezingLeadsCount = leads.filter((l) => l.riskOfFreezing).length;

  return (
    <header className="sticky top-0 z-50 bg-[#0b141d] border-b border-[#e09062]/20 px-4 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md">
      {/* Brand Cluster */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3.5">
          {/* Hexagonal Logo Mark */}
          <div className="w-10 h-10 bg-[#e09062] clip-hexagon flex items-center justify-center text-[#060f18] font-black text-lg select-none shadow-md shadow-[#e09062]/20">
            ▲
          </div>

          <div className="brand-text">
            <h1 className="text-lg lg:text-xl font-extrabold tracking-[0.1em] uppercase text-white leading-none">
              CUPRA <span className="text-[#e09062]">COPILOT</span>
            </h1>
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 tracking-[0.15em] uppercase block mt-1">
              v3.8 • Firebase Firestore & AI Engine
            </span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          {!user ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-2.5 py-1 rounded bg-[#e09062] text-[#060f18] text-xs font-bold font-['JetBrains_Mono']"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logOut}
              className="text-xs text-[#eaddff]/60 font-['JetBrains_Mono']"
            >
              Salir
            </button>
          )}

          <button
            onClick={onOpenQuickCommands}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a2430] text-[#e09062] border border-[#e09062]/30 text-xs font-semibold"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>/CMD</span>
          </button>
        </div>
      </div>

      {/* Center/Desktop KPI Stats in JetBrains Mono */}
      <div className="hidden xl:flex items-center gap-3 font-['JetBrains_Mono'] text-[0.7rem]">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#1a2430] border border-[#e09062]/20 text-[#eaddff]/70">
          <Users className="w-3.5 h-3.5 text-[#e09062]" />
          <span>LEADS: <strong className="text-white font-bold">{leads.length}</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#1a2430] border border-[#e09062]/20 text-[#eaddff]/70">
          <Flame className="w-3.5 h-3.5 text-[#e09062]" />
          <span>HOT: <strong className="text-white font-bold">{hotLeadsCount}</strong></span>
        </div>

        {freezingLeadsCount > 0 && (
          <div 
            onClick={() => setActiveTab('crm')}
            className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/25 transition-colors"
            title="Ver prospectos en riesgo de enfriarse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>RIESGO: <strong className="text-white font-bold">{freezingLeadsCount}</strong></span>
          </div>
        )}

        <button
          onClick={onOpenQuickCommands}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-transparent border border-[#e09062]/40 text-[#e09062] hover:bg-[#e09062] hover:text-[#060f18] transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TRIGGERS (/)</span>
        </button>
      </div>

      {/* Nav Chips matching Variation 5 + Auth Indicator */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'crm'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>CRM Funnel</span>
            {freezingLeadsCount > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'crm' ? 'bg-[#060f18]' : 'bg-[#ef4444]'}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'copilot'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>Copilot AI</span>
          </button>

          <button
            onClick={() => setActiveTab('showroom')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'showroom'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>Gama</span>
          </button>

          <button
            onClick={() => setActiveTab('financing')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'financing'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>Cotizador</span>
          </button>

          <button
            onClick={() => setActiveTab('testdrive')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'testdrive'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>Test Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md shadow-[#e09062]/20'
                : 'bg-transparent text-[#eaddff]/60 border border-transparent hover:border-[#e09062] hover:text-white'
            }`}
          >
            <span>WhatsApp</span>
          </button>
        </nav>

        {/* User Auth Profile Button in Desktop Header */}
        <div className="hidden md:flex items-center pl-2 border-l border-white/10">
          {!user ? (
            <button
              onClick={() => setShowLoginModal(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] transition-all font-['JetBrains_Mono'] whitespace-nowrap shadow-sm active:scale-95"
              title="Acceder con Google o Modo Asesor"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#1a2430] border border-[#e09062]/30 text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#c3f400]" />
                )}
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-white max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400]" title="Conectado a Firestore" />
              </div>

              <button
                onClick={logOut}
                className="p-1.5 rounded-[4px] bg-[#1a2430] hover:bg-white/10 text-[#eaddff]/60 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Options Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b141d] border border-[#e09062]/40 rounded-[8px] p-6 w-full max-w-sm shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#e09062] clip-hexagon flex items-center justify-center text-[#060f18] font-black text-xs">
                  ▲
                </div>
                <h3 className="font-['Outfit'] font-bold text-sm text-white uppercase tracking-wider">
                  Acceso Asesor CUPRA
                </h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-zinc-500 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <p className="font-['JetBrains_Mono'] text-xs text-[#eaddff]/70 mb-5 leading-relaxed">
              Conecta tu cuenta para sincronizar el pipeline de prospectos en tiempo real con Cloud Firestore o ingresa en modo asesor local.
            </p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  setShowLoginModal(false);
                  await signInWithGoogle();
                }}
                className="w-full py-2.5 px-4 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] font-bold text-xs uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 font-['JetBrains_Mono']"
              >
                <LogIn className="w-4 h-4" />
                <span>Continuar con Google</span>
              </button>

              <button
                onClick={async () => {
                  setShowLoginModal(false);
                  await signInAsGuest();
                }}
                className="w-full py-2.5 px-4 rounded-[4px] bg-[#1a2430] hover:bg-[#202c3a] text-white border border-[#e09062]/30 font-semibold text-xs uppercase tracking-[0.05em] flex items-center justify-center gap-2 transition-all active:scale-95 font-['JetBrains_Mono']"
              >
                <Sparkles className="w-4 h-4 text-[#e09062]" />
                <span>Entrar como Asesor Demo</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-center font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40">
              Datos protegidos por Firebase Security Rules en cupra-copilot
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
