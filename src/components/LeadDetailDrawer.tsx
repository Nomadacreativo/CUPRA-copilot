import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MessageCircle
} from 'lucide-react';
import { Lead, LeadStage } from '../types';
import { createWhatsAppUrl } from '../utils/formatters';
import { CupraLogo } from './CupraLogo';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onConsultCopilot: (lead: Lead) => void;
  onAddLeadNote: (leadId: string, note: string) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateStage,
  onConsultCopilot,
  onAddLeadNote,
}) => {
  if (!lead) return null;

  const [newNoteInput, setNewNoteInput] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    onAddLeadNote(lead.id, newNoteInput.trim());
    setNewNoteInput('');
  };

  const defaultMsg = `Hola ${lead.name.split(' ')[0]}, un saludo desde CUPRA Garage. Quería dar seguimiento a tu consulta sobre el ${lead.modelOfInterest}. ¿Tienes unos minutos hoy para platicar?`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0b141d] border-l border-[#e09062]/20 h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#1a2430] to-[#060f18] border border-[#e09062]/30 rounded-[4px] flex items-center justify-center p-1.5 shadow-md">
                <CupraLogo className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-bold text-base text-white uppercase tracking-wide">{lead.name}</h3>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-wider">{lead.origin}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] bg-[#1a2430] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Stage Indicator & Selector */}
          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-2 font-semibold">
              Etapa en el Embudo Comercial
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cold', 'warm', 'hot'] as LeadStage[]).map((stg) => (
                <button
                  key={stg}
                  onClick={() => onUpdateStage(lead.id, stg)}
                  className={`py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all border font-['JetBrains_Mono'] ${
                    lead.stage === stg
                      ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                      : 'bg-[#1a2430] text-[#eaddff]/60 border-white/5 hover:border-[#e09062]'
                  }`}
                >
                  {stg === 'cold' ? '1. Cold' : stg === 'warm' ? '2. Warm' : '3. Hot'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Contact & Info Grid */}
          <div className="bg-[#1a2430] rounded-[6px] p-4 border border-[#e09062]/15 space-y-3 font-['JetBrains_Mono'] text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[#eaddff]/50 uppercase text-[0.65rem]">Vehículo:</span>
              <span className="font-semibold text-[#e09062]">{lead.modelOfInterest}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[#eaddff]/50 uppercase text-[0.65rem]">WhatsApp:</span>
              <span className="text-white">{lead.phone}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[#eaddff]/50 uppercase text-[0.65rem]">Correo:</span>
              <span className="text-white truncate max-w-[200px]">{lead.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[#eaddff]/50 uppercase text-[0.65rem]">Inactividad:</span>
              <span className={`font-semibold ${lead.daysInactive >= 4 ? 'text-[#ef4444]' : 'text-[#c3f400]'}`}>
                {lead.daysInactive} días
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#eaddff]/50 uppercase text-[0.65rem]">Esquema:</span>
              <span className="text-[#e09062] font-semibold uppercase">{lead.financingPreference}</span>
            </div>
          </div>

          {/* Next Task Recommendation */}
          <div className="p-4 rounded-[4px] bg-[#060f18] border-l-2 border-[#e09062]">
            <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Siguiente Acción Recomendada</span>
            </div>
            <p className="text-xs text-white leading-relaxed font-light">
              {lead.nextTask}
            </p>
          </div>

          {/* Lead Notes History */}
          <div className="space-y-2">
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-semibold">
              Bitácora de Seguimiento
            </label>
            <div className="p-3 rounded-[4px] bg-[#060f18] border border-white/5 text-xs text-[#eaddff]/80 font-light">
              {lead.notes}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar nota rápida..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-[4px] bg-[#1a2430] hover:bg-white/10 text-xs font-semibold text-[#e09062] uppercase font-['JetBrains_Mono']"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <a
            href={createWhatsAppUrl(lead.phone, defaultMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-[4px] bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 text-xs font-bold uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir Conversación en WhatsApp</span>
          </a>

          <button
            onClick={() => onConsultCopilot(lead)}
            className="w-full py-2.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consultar Estrategia con Copilot AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
