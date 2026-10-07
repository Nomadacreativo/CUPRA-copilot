import React, { useState } from 'react';
import { 
  Users, 
  Flame, 
  AlertTriangle, 
  Plus, 
  Search, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  Car, 
  Sparkles, 
  Clock
} from 'lucide-react';
import { Lead, LeadStage, ClientProfile, FinancingPreference } from '../types';
import { formatCurrency, createWhatsAppUrl } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface FunnelCRMProps {
  leads: Lead[];
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  onSelectLeadForCopilot: (lead: Lead, suggestedPrompt?: string) => void;
  onAddNewLead: (newLead: Omit<Lead, 'id' | 'daysInactive' | 'riskOfFreezing' | 'historyTimeline'>) => void;
  onOpenLeadDetails: (lead: Lead) => void;
}

export const FunnelCRM: React.FC<FunnelCRMProps> = ({
  leads,
  onUpdateLeadStage,
  onSelectLeadForCopilot,
  onAddNewLead,
  onOpenLeadDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterModel, setSelectedFilterModel] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new lead
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newModel, setNewModel] = useState('CUPRA Formentor VZ');
  const [newOrigin, setNewOrigin] = useState<Lead['origin']>('Web Oficial');
  const [newProfile, setNewProfile] = useState<ClientProfile>('corporativo');
  const [newFinancing, setNewFinancing] = useState<FinancingPreference>('leasing');
  const [newNotes, setNewNotes] = useState('');

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.modelOfInterest.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = 
      selectedFilterModel === 'all' || lead.modelOfInterest.includes(selectedFilterModel);

    return matchesSearch && matchesModel;
  });

  const coldLeads = filteredLeads.filter((l) => l.stage === 'cold');
  const warmLeads = filteredLeads.filter((l) => l.stage === 'warm');
  const hotLeads = filteredLeads.filter((l) => l.stage === 'hot');

  const freezingLeads = leads.filter((l) => l.riskOfFreezing);
  const { user, signInWithGoogle } = useAuth();

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    onAddNewLead({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      origin: newOrigin,
      stage: 'cold',
      modelOfInterest: newModel,
      dateCreated: new Date().toISOString().split('T')[0],
      lastContactDate: new Date().toISOString().split('T')[0],
      budgetEstimated: newModel.includes('Tavascan') ? 1190000 : 914900,
      financingPreference: newFinancing,
      clientProfile: newProfile,
      notes: newNotes || 'Lead recién ingresado al funnel comercial.',
      nextTask: 'Enviar mensaje de bienvenida y verificar perfil fiscal/financiero.',
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
  };

  const getProfileBadge = (profile: ClientProfile) => {
    switch (profile) {
      case 'corporativo':
        return <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider bg-[#1a2430] text-[#eaddff] border border-[#e09062]/20">Corporativo</span>;
      case 'performance':
        return <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider bg-[#e09062]/20 text-[#e09062] border border-[#e09062]/40">Performance</span>;
      case 'tech':
        return <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider bg-[#c3f400]/15 text-[#c3f400] border border-[#c3f400]/30">Tech</span>;
      case 'familiar':
        return <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider bg-[#1a2430] text-[#eaddff]/80 border border-white/10">Familiar</span>;
    }
  };

  const getFinancingLabel = (f: FinancingPreference) => {
    switch (f) {
      case 'leasing': return 'Leasing Deducible';
      case 'unique_flex': return 'CUPRA Flex';
      case 'credito': return 'Crédito Tradicional';
      case 'contado': return 'Contado';
    }
  };

  const renderLeadCard = (lead: Lead) => {
    const isFreezing = lead.riskOfFreezing;
    
    const defaultWhatsAppMsg = isFreezing
      ? `Hola ${lead.name.split(' ')[0]}, un saludo cordial desde CUPRA Garage. Noté tu interés en el ${lead.modelOfInterest}. Acaba de liberarse una asignación prioritaria en inventario con condiciones especiales para este mes. ¿Te gustaría que te comparta la corrida actualizada o agendamos una breve prueba de manejo para sentir su respuesta dinámica?`
      : `Hola ${lead.name.split(' ')[0]}, te saluda tu Asesor CUPRA. Sobre tu consulta del ${lead.modelOfInterest}, tengo preparada la ficha técnica y la propuesta de ${getFinancingLabel(lead.financingPreference)}. ¿Te gustaría que te envíe los detalles por aquí?`;

    return (
      <div
        key={lead.id}
        className={`rounded-[6px] p-4 transition-all duration-200 border ${
          isFreezing
            ? 'bg-[#150a12] border-[#ef4444]/60 shadow-lg shadow-red-950/20'
            : 'bg-[#1a2430] hover:bg-[#202c3a] border-[#e09062]/20 hover:border-[#e09062]/50'
        }`}
      >
        {/* Header card info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 
              onClick={() => onOpenLeadDetails(lead)}
              className="text-white font-semibold text-sm hover:text-[#e09062] cursor-pointer flex items-center gap-1.5 transition-colors font-['Outfit']"
            >
              {lead.name}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </h4>
            <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 mt-0.5">
              <span className="text-[#e09062] font-semibold">{lead.origin}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#eaddff]/40" />
                {lead.daysInactive === 0 ? 'Hoy' : `Hace ${lead.daysInactive}d`}
              </span>
            </div>
          </div>

          {/* Risk Alert Badge */}
          {isFreezing && (
            <span className="px-2 py-0.5 rounded-[3px] text-[0.6rem] font-['JetBrains_Mono'] font-bold bg-[#ef4444] text-white flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-white" />
              RIESGO
            </span>
          )}
        </div>

        {/* Model and Profile tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="px-2 py-0.5 rounded-[3px] text-[0.7rem] font-semibold bg-[#060f18] text-[#e09062] border border-[#e09062]/30 flex items-center gap-1">
            <Car className="w-3 h-3" />
            {lead.modelOfInterest}
          </span>
          {getProfileBadge(lead.clientProfile)}
          <span className="px-2 py-0.5 rounded-[3px] text-[0.65rem] font-['JetBrains_Mono'] bg-black/40 text-[#eaddff]/60 border border-white/5">
            {getFinancingLabel(lead.financingPreference)}
          </span>
        </div>

        {/* Notes preview */}
        <p className="text-xs text-[#eaddff]/80 line-clamp-2 mb-3 bg-[#060f18] p-2.5 rounded-[4px] border border-white/5 font-light">
          {lead.notes}
        </p>

        {/* Suggested Next Action */}
        <div className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 mb-3 flex items-start gap-1.5 leading-snug">
          <Sparkles className="w-3.5 h-3.5 text-[#e09062] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#e09062]">Próximo paso:</strong> {lead.nextTask}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between gap-1 pt-2.5 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <a
              href={createWhatsAppUrl(lead.phone, defaultWhatsAppMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-[3px] bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Abrir WhatsApp con mensaje personalizado"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => onSelectLeadForCopilot(
                lead, 
                isFreezing 
                  ? `/followup ${lead.name} ${lead.daysInactive} días sin contacto`
                  : `Ayúdame con el siguiente paso para ${lead.name} interesado en ${lead.modelOfInterest}`
              )}
              className="px-2.5 py-1 rounded-[3px] bg-[#060f18] hover:bg-black text-[#e09062] border border-[#e09062]/30 text-xs font-medium flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Copilot</span>
            </button>
          </div>

          {/* Move stage controls */}
          <div className="flex items-center gap-1">
            {lead.stage !== 'cold' && (
              <button
                onClick={() => onUpdateLeadStage(lead.id, lead.stage === 'hot' ? 'warm' : 'cold')}
                className="p-1 rounded-[3px] bg-[#060f18] hover:bg-black text-zinc-400 border border-white/10"
                title="Retroceder etapa"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {lead.stage !== 'hot' && (
              <button
                onClick={() => onUpdateLeadStage(lead.id, lead.stage === 'cold' ? 'warm' : 'hot')}
                className="px-2.5 py-1 rounded-[3px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold flex items-center gap-0.5 shadow-sm active:scale-95 transition-all"
              >
                <span>Avanzar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Freezing Leads Alert */}
      {freezingLeads.length > 0 && (
        <div className="rounded-[6px] bg-[#1a1215] border border-[#ef4444]/40 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <span>{freezingLeads.length} Leads en Riesgo de Enfriarse</span>
                <span className="font-['JetBrains_Mono'] text-[0.6rem] bg-[#ef4444] text-white px-2 py-0.5 rounded-[2px] font-bold uppercase">
                  Acción Inmediata
                </span>
              </h3>
              <p className="text-xs text-[#eaddff]/60 mt-0.5">
                Prospectos sin contacto durante más de 3 días. Reactívalos antes de que busquen opciones en marcas alemanas.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const firstFreezing = freezingLeads[0];
              onSelectLeadForCopilot(
                firstFreezing,
                `/followup ${firstFreezing.name} ${firstFreezing.daysInactive} días sin contacto`
              );
            }}
            className="w-full md:w-auto px-4 py-2 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar Rescate con Copilot</span>
          </button>
        </div>
      )}

      {/* Cloud Sync Status Indicator */}
      {!user ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 font-['JetBrains_Mono'] text-xs">
          <div className="flex items-center gap-2 text-[#eaddff]/70">
            <span className="w-2 h-2 rounded-full bg-[#e09062]" />
            <span>Modo Local Activo — Inicia sesión para sincronizar y respaldar con Cloud Firestore.</span>
          </div>
          <button
            onClick={signInWithGoogle}
            className="px-3 py-1 rounded-[3px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-[0.7rem] font-bold uppercase tracking-wider transition-all whitespace-nowrap"
          >
            Conectar Google
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-[4px] bg-[#0b141d] border border-[#c3f400]/20 font-['JetBrains_Mono'] text-[0.7rem] text-[#eaddff]/70">
          <div className="flex items-center gap-2 text-[#c3f400]">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse" />
            <span>Sincronización en tiempo real activa con Cloud Firestore</span>
          </div>
          <span className="text-[#eaddff]/40">Asesor: {user.displayName || user.email}</span>
        </div>
      )}

      {/* Control Bar: Search, Filters & Add Lead */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b141d] p-3 rounded-[6px] border border-[#e09062]/20">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e09062]"
            />
          </div>

          {/* Model Filter */}
          <select
            value={selectedFilterModel}
            onChange={(e) => setSelectedFilterModel(e.target.value)}
            className="px-3 py-1.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-[#eaddff] focus:outline-none focus:border-[#e09062]"
          >
            <option value="all">Todos los Modelos</option>
            <option value="Formentor">Formentor VZ</option>
            <option value="Leon">Leon VZ</option>
            <option value="Ateca">Ateca</option>
            <option value="Tavascan">Tavascan</option>
            <option value="Born">Born</option>
            <option value="Terramar">Terramar</option>
          </select>
        </div>

        {/* Add Lead Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-1.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Lead (/nuevo-lead)</span>
        </button>
      </div>

      {/* 3-Column Interactive Kanban Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COLUMNA 1: COLD LEADS */}
        <div className="flex flex-col bg-[#0b141d] rounded-[8px] p-4 border border-[#e09062]/20 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#eaddff]">1. COLD LEADS</span>
            </div>
            <span className="px-2 py-0.5 rounded-[3px] font-['JetBrains_Mono'] text-xs font-bold bg-[#1a2430] text-[#eaddff]">
              {coldLeads.length}
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 mb-3 block">
            Interés inicial, formulario o primer contacto.
          </span>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {coldLeads.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs">
                No hay prospectos fríos pendientes.
              </div>
            ) : (
              coldLeads.map(renderLeadCard)
            )}
          </div>
        </div>

        {/* COLUMNA 2: WARM LEADS */}
        <div className="flex flex-col bg-[#0b141d] rounded-[8px] p-4 border border-[#e09062]/20 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#eaddff]">2. WARM LEADS</span>
            </div>
            <span className="px-2 py-0.5 rounded-[3px] font-['JetBrains_Mono'] text-xs font-bold bg-[#1a2430] text-[#e09062]">
              {warmLeads.length}
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 mb-3 block">
            Test Drive completado o cotización enviada.
          </span>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {warmLeads.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs">
                No hay prospectos en etapa tibia.
              </div>
            ) : (
              warmLeads.map(renderLeadCard)
            )}
          </div>
        </div>

        {/* COLUMNA 3: HOT LEADS */}
        <div className="flex flex-col bg-[#0b141d] rounded-[8px] p-4 border border-[#e09062]/40 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e09062]/20">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#e09062]">3. HOT (CIERRE)</span>
            </div>
            <span className="px-2 py-0.5 rounded-[3px] font-['JetBrains_Mono'] text-xs font-bold bg-[#e09062] text-[#060f18]">
              {hotLeads.length}
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] mb-3 block">
            Negociación final, crédito aprobado o apartado.
          </span>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {hotLeads.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs">
                No hay prospectos calientes activos.
              </div>
            ) : (
              hotLeads.map(renderLeadCard)
            )}
          </div>
        </div>
      </div>

      {/* Modal: Agregar Nuevo Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b141d] border border-[#e09062]/40 rounded-[8px] p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="font-['Outfit'] font-bold text-base text-white flex items-center gap-2 uppercase tracking-wide">
                <Plus className="w-5 h-5 text-[#e09062]" />
                Registrar Nuevo Prospecto
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Santiago Del Valle"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+52 55 1234 5678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  />
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Modelo de Interés</label>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  >
                    <option value="CUPRA Formentor VZ">CUPRA Formentor VZ (310 HP)</option>
                    <option value="CUPRA Leon VZ">CUPRA Leon VZ (300 HP)</option>
                    <option value="CUPRA Ateca">CUPRA Ateca (300 HP)</option>
                    <option value="CUPRA Tavascan">CUPRA Tavascan (100% Eléctrico 340 HP)</option>
                    <option value="CUPRA Born">CUPRA Born (100% Eléctrico 231 HP)</option>
                    <option value="CUPRA Terramar e-HYBRID">CUPRA Terramar (e-HYBRID 272 HP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Origen del Lead</label>
                  <select
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  >
                    <option value="Web Oficial">Web Oficial</option>
                    <option value="Instagram Ads">Instagram Ads</option>
                    <option value="Showroom Walk-in">Showroom Walk-in</option>
                    <option value="Recomendación VIP">Recomendación VIP</option>
                    <option value="Evento CUPRA Garage">Evento CUPRA Garage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Perfil del Comprador</label>
                  <select
                    value={newProfile}
                    onChange={(e) => setNewProfile(e.target.value as ClientProfile)}
                    className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  >
                    <option value="corporativo">Corporativo / Deducibilidad</option>
                    <option value="performance">Entusiasta del Performance</option>
                    <option value="tech">Joven Tecnológico</option>
                    <option value="familiar">Familiar / Práctico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Esquema Financiero</label>
                  <select
                    value={newFinancing}
                    onChange={(e) => setNewFinancing(e.target.value as FinancingPreference)}
                    className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  >
                    <option value="leasing">Arrendamiento Puro (Leasing)</option>
                    <option value="unique_flex">CUPRA Unique / Flex</option>
                    <option value="credito">Crédito Tradicional</option>
                    <option value="contado">Contado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Notas iniciales</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre autos anteriores, preferencias..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-[4px] text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-[#e09062] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] hover:bg-[#f0a072] transition-all"
                >
                  Guardar en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
