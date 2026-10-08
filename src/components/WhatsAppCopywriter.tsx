import React, { useState } from 'react';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Share2
} from 'lucide-react';
import { Lead, ClientProfile } from '../types';
import { CUPRA_VEHICLES } from '../data/cupraCatalog';
import { createWhatsAppUrl, safeCopyToClipboard } from '../utils/formatters';

interface WhatsAppCopywriterProps {
  leads: Lead[];
  onAskCopilotCustomCopy: (prompt: string) => void;
}

export const WhatsAppCopywriter: React.FC<WhatsAppCopywriterProps> = ({
  leads,
  onAskCopilotCustomCopy,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const [clientName, setClientName] = useState(selectedLead?.name || 'Carlos Villarreal');
  const [clientPhone, setClientPhone] = useState(selectedLead?.phone || '+525541928371');
  const [vehicleModel, setVehicleModel] = useState(selectedLead?.modelOfInterest || 'CUPRA Formentor VZ');
  const [profile, setProfile] = useState<ClientProfile>(selectedLead?.clientProfile || 'corporativo');
  
  const [stageType, setStageType] = useState<
    'bienvenida' | 'testdrive' | 'cotizacion' | 'rescate_frio' | 'aprobacion_cierre'
  >('bienvenida');

  const [customizedMessage, setCustomizedMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      setClientName(lead.name);
      setClientPhone(lead.phone);
      setVehicleModel(lead.modelOfInterest);
      setProfile(lead.clientProfile);
      generateCopy(stageType, lead.name, lead.modelOfInterest, lead.clientProfile);
    }
  };

  const generateCopy = (
    stage: typeof stageType,
    name: string,
    model: string,
    prof: ClientProfile
  ) => {
    const firstName = name.split(' ')[0] || 'Cliente';
    let message = '';

    if (stage === 'bienvenida') {
      if (prof === 'corporativo') {
        message = `Estimado ${firstName}, gusto en saludarte. Soy tu Asesor Especializado en CUPRA Garage. He recibido tu solicitud de información sobre el ${model}. Contamos con alternativas de Arrendamiento Puro 100% deducible diseñadas para optimizar tus deducciones fiscales de este ejercicio. ¿Te gustaría que te prepare una corrida preliminar o prefieres agendar una breve experiencia de manejo?`;
      } else if (prof === 'performance') {
        message = `¡Hola ${firstName}! Te saluda tu Asesor CUPRA. Veo que tienes la mira puesta en el ${model}. Es un vehículo con ADN de carreras puro y una puesta a punto que rompe con lo convencional. ¿Te gustaría pasar a la agencia para encender el motor y sentir la respuesta del Modo CUPRA en persona?`;
      } else if (prof === 'tech') {
        message = `Hola ${firstName}, te escribe tu Asesor CUPRA. Recibí tu interés en el ${model}. La tecnología de conectividad, el Digital Cockpit y la iluminación Matrix LED son espectaculares. Te tengo lista la ficha técnica digital interactiva. ¿Te la comparto por aquí?`;
      } else {
        message = `Hola ${firstName}, un gusto saludarte. Soy tu Asesor en CUPRA. Noté tu interés en el ${model}. Es un auto increíble por su balance entre deportividad, amplitud y seguridad para tu día a día. ¿Te gustaría que revisemos disponibilidad de colores y planes de financiamiento?`;
      }
    } else if (stage === 'testdrive') {
      message = `Hola ${firstName}, ¿cómo va tu semana? Tenemos listo en patio de agencia un ${model} para ti. Preparé una ruta dinámica exclusiva donde podremos probar el confort en ciudad y la aceleración en tramo despejado con el chasis DCC. ¿Qué horario te queda mejor: jueves a las 4:00 PM o sábado por la mañana?`;
    } else if (stage === 'cotizacion') {
      message = `Hola ${firstName}, un saludo. Ya tengo lista tu cotización personalizada para el ${model}. Estructuré una alternativa con un pago inicial muy competitivo y mensualidades optimizadas. Te comparto el resumen detallado para que lo evalúes. ¿Tienes unos minutos hoy para resolver cualquier duda sobre los términos?`;
    } else if (stage === 'rescate_frio') {
      message = `Hola ${firstName}, espero te encuentres muy bien. Te escribo porque acaba de liberarse una asignación prioritaria de ${model} en uno de los colores más cotizados con condiciones comerciales especiales que vencen este viernes. Recordé que era justo la versión que buscabas. ¿Sigue en tus planes estrenar este mes o prefieres que revisemos opciones?`;
    } else if (stage === 'aprobacion_cierre') {
      message = `¡Excelentes noticias ${firstName}! Tu expediente para el ${model} ha sido APROBADO por la financiera de marca. Tengo la unidad asignada y lista para etiquetar con tu nombre. Únicamente requerimos formalizar el apartado de garantía para bloquear el número de serie (VIN). ¿Te comparto la cuenta concentradora oficial de la agencia?`;
    }

    setCustomizedMessage(message);
  };

  React.useEffect(() => {
    generateCopy(stageType, clientName, vehicleModel, profile);
  }, [stageType, vehicleModel, profile]);

  const handleCopy = async () => {
    const success = await safeCopyToClipboard(customizedMessage);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] mb-1 block">
            Generador Comercial
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight uppercase font-['Outfit']">
            WhatsApp Express Copywriter
          </h2>
          <p className="text-xs text-[#eaddff]/60 mt-1 font-light">
            Generador instantáneo de copy comercial adaptado a la psicología del comprador y la etapa del funnel.
          </p>
        </div>

        {/* Sync Lead Dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 hidden sm:inline">Cargar prospecto:</span>
          <select
            value={selectedLeadId}
            onChange={(e) => handleSelectLead(e.target.value)}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062] font-['Outfit']"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.modelOfInterest})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 space-y-4">
          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-2 font-semibold">
              1. Etapa Comercial del Mensaje
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setStageType('bienvenida')}
                className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
                  stageType === 'bienvenida'
                    ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-sm'
                    : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
                }`}
              >
                Bienvenida (15 min)
              </button>

              <button
                onClick={() => setStageType('testdrive')}
                className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
                  stageType === 'testdrive'
                    ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-sm'
                    : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
                }`}
              >
                Invitar a Test Drive
              </button>

              <button
                onClick={() => setStageType('cotizacion')}
                className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
                  stageType === 'cotizacion'
                    ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-sm'
                    : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
                }`}
              >
                Envío de Cotización
              </button>

              <button
                onClick={() => setStageType('rescate_frio')}
                className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
                  stageType === 'rescate_frio'
                    ? 'bg-[#ef4444] text-white border-[#ef4444] font-bold shadow-sm'
                    : 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30 hover:border-[#ef4444]'
                }`}
              >
                Rescate Lead Frío ❄️
              </button>

              <button
                onClick={() => setStageType('aprobacion_cierre')}
                className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] sm:col-span-2 ${
                  stageType === 'aprobacion_cierre'
                    ? 'bg-[#c3f400] text-[#060f18] border-[#c3f400] font-bold shadow-sm'
                    : 'bg-[#c3f400]/15 text-[#c3f400] border-[#c3f400]/30 hover:border-[#c3f400]'
                }`}
              >
                Crédito Aprobado & Apartado 🎯
              </button>
            </div>
          </div>

          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-2 font-semibold">
              2. Perfil Psicológico del Cliente
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'corporativo', label: 'Corporativo / Fiscal', desc: 'Enfoque en distinción y deducción' },
                { id: 'performance', label: 'Entusiasta Sport', desc: 'Enfoque en aceleración y dinamismo' },
                { id: 'tech', label: 'Tecnológico & Futuro', desc: 'Enfoque en conectividad y diseño' },
                { id: 'familiar', label: 'Familiar & Versátil', desc: 'Enfoque en seguridad y amplitud' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfile(p.id as ClientProfile)}
                  className={`p-2.5 rounded-[4px] text-left border transition-all ${
                    profile === p.id
                      ? 'bg-[#1a2430] border-[#e09062] text-white shadow-md'
                      : 'bg-[#060f18] border-white/5 text-[#eaddff]/60 hover:border-[#e09062]/30'
                  }`}
                >
                  <span className="font-semibold text-xs block text-white font-['Outfit']">{p.label}</span>
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40 block">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  generateCopy(stageType, e.target.value, vehicleModel, profile);
                }}
                className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
              />
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Número de WhatsApp</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
              />
            </div>
          </div>

          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Modelo de Interés</label>
            <select
              value={vehicleModel}
              onChange={(e) => {
                setVehicleModel(e.target.value);
                generateCopy(stageType, clientName, e.target.value, profile);
              }}
              className="w-full px-3 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
            >
              {CUPRA_VEHICLES.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-[24px] bg-[#060f18] border-2 border-[#e09062]/30 shadow-2xl p-3 space-y-3 relative">
            <div className="w-20 h-3 bg-zinc-800 rounded-full mx-auto" />

            {/* WhatsApp Header bar */}
            <div className="bg-[#1f2c34] p-3 rounded-[6px] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center font-bold text-white text-xs">
                  {clientName.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{clientName}</h4>
                  <span className="text-[10px] text-emerald-400 block font-['JetBrains_Mono']">En línea</span>
                </div>
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-zinc-400">CUPRA Asesor</span>
            </div>

            {/* Chat Bubble Area */}
            <div className="p-3 bg-[#0b141a] rounded-[6px] min-h-[220px] flex flex-col justify-end">
              <div className="bg-[#005c4b] text-white p-3.5 rounded-[6px] text-xs leading-relaxed space-y-1 shadow-md">
                <p className="whitespace-pre-line font-['Outfit'] font-light">{customizedMessage}</p>
                <div className="font-['JetBrains_Mono'] text-[9px] text-zinc-300 text-right flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={createWhatsAppUrl(clientPhone, customizedMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-[4px] bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 text-black" />
                <span>Enviar Directo a WhatsApp</span>
              </a>

              <button
                onClick={handleCopy}
                className="w-full py-2 rounded-[4px] bg-[#1a2430] hover:bg-white/10 text-white text-xs font-medium uppercase tracking-[0.05em] flex items-center justify-center gap-2 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#c3f400]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? '¡Texto Copiado!' : 'Copiar al Portapapeles'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
