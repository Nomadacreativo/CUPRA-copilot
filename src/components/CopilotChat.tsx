import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Copy, 
  Check, 
  MessageCircle, 
  User, 
  Calendar,
  Zap
} from 'lucide-react';
import { Lead, ChatMessage } from '../types';
import { parseCopilotResponse, createWhatsAppUrl, safeCopyToClipboard } from '../utils/formatters';

interface CopilotChatProps {
  activeLeadContext: Lead | null;
  onClearLeadContext: () => void;
  onSelectLead: (lead: Lead) => void;
  leads: Lead[];
  presetPrompt?: string;
  onClearPresetPrompt?: () => void;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  activeLeadContext,
  onClearLeadContext,
  onSelectLead,
  leads,
  presetPrompt,
  onClearPresetPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'copilot',
      timestamp: 'Ahora',
      text: `**[Acción Inmediata / Resumen]**
CUPRA Copilot en línea y listo para maximizar tus cierres comerciales. Elige un comando rápido o un prospecto para comenzar.

**[Detalle / Plantilla / Contenido]**
Comandos de acción rápida disponibles:
- \`/nuevo-lead [Nombre] [Auto] [Origen]\` -> Genera bienvenida y ficha.
- \`/comparar [Modelo CUPRA] vs [Competencia]\` -> Tabla de 3 puntos clave de superioridad.
- \`/script-testdrive [Modelo]\` -> Ruta sensorial e hitos kilométricos con Modo CUPRA.
- \`/followup [Cliente] [Días sin contacto]\` -> Mensaje de rescate de alta conversión.
- \`/objecion [Precio / Tasa / Marca / Entrega]\` -> 2 argumentos de refutación contundente.

**[Próximo Paso Sugerido]**
Revisa los leads con alerta de enfriamiento en el CRM o haz clic en uno de los botones de comando inferior.`,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (presetPrompt) {
      setInputValue(presetPrompt);
      if (onClearPresetPrompt) {
        onClearPresetPrompt();
      }
    }
  }, [presetPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          clientContext: activeLeadContext
            ? {
                name: activeLeadContext.name,
                stage: activeLeadContext.stage,
                model: activeLeadContext.modelOfInterest,
                daysInactive: activeLeadContext.daysInactive,
                profile: activeLeadContext.clientProfile,
              }
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con CUPRA Copilot');
      }

      const data = await response.json();
      const rawReply = data.reply || '';

      const copilotMessage: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: rawReply,
      };

      setMessages((prev) => [...prev, copilotMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**[Acción Inmediata / Resumen]**
Error temporal de red con el servicio. Se ha activado el motor local de contingencia.

**[Detalle / Plantilla / Contenido]**
Para continuar sin demoras, utiliza los comandos directos de la barra inferior o consulta el catálogo de vehículos y comparativas en la pestaña de Gama.

**[Próximo Paso Sugerido]**
Reintenta la consulta o selecciona un prospecto de la lista.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async (id: string, textToCopy: string) => {
    const success = await safeCopyToClipboard(textToCopy);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleQuickCommandClick = (commandTemplate: string) => {
    setInputValue(commandTemplate);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-[#0b141d] rounded-[8px] border border-[#e09062]/20 overflow-hidden shadow-2xl">
      {/* Top Header & Client Context Bar */}
      <div className="bg-[#1a2430] border-b border-[#e09062]/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e09062] clip-hexagon flex items-center justify-center text-[#060f18] font-black text-sm">
            ▲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Outfit'] text-base font-bold text-white uppercase tracking-wider">
                CUPRA COPILOT AI
              </h2>
              <span className="font-['JetBrains_Mono'] text-[0.6rem] px-2 py-0.5 rounded-[2px] bg-[#c3f400]/15 text-[#c3f400] border border-[#c3f400]/30 uppercase">
                Online
              </span>
            </div>
            <p className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50">
              Automatización de embudo, refutación de objeciones y guiones de Test Drive
            </p>
          </div>
        </div>

        {/* Lead Context Selector / Badge */}
        <div className="flex items-center gap-2">
          {activeLeadContext ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#060f18] border border-[#e09062]/40 text-xs text-white">
              <User className="w-3.5 h-3.5 text-[#e09062]" />
              <span className="font-['Outfit']">
                Cliente: <strong className="text-[#e09062]">{activeLeadContext.name}</strong> ({activeLeadContext.modelOfInterest})
              </span>
              <button
                onClick={onClearLeadContext}
                className="ml-1 text-zinc-400 hover:text-white"
                title="Quitar contexto"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 hidden sm:inline">Vincular lead:</span>
              <select
                onChange={(e) => {
                  const lead = leads.find((l) => l.id === e.target.value);
                  if (lead) onSelectLead(lead);
                }}
                defaultValue=""
                className="px-3 py-1 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
              >
                <option value="" disabled>Seleccionar prospecto...</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.modelOfInterest} ({l.stage.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Quick Trigger Chips */}
      <div className="bg-[#0b141d] px-4 py-2 border-b border-[#e09062]/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] shrink-0 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-[#e09062]" /> Triggers:
        </span>

        <button
          onClick={() => handleQuickCommandClick('/comparar CUPRA Formentor VZ vs Audi Q3 Sportback')}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /comparar vs Audi Q3
        </button>

        <button
          onClick={() => handleQuickCommandClick('/script-testdrive CUPRA Formentor VZ')}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /script-testdrive Formentor
        </button>

        <button
          onClick={() => handleQuickCommandClick('/objecion Tasa de interés bancaria vs Arrendamiento Puro')}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /objecion Tasa
        </button>

        <button
          onClick={() => handleQuickCommandClick('/objecion Marca poco conocida frente a los alemanes')}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /objecion Marca
        </button>

        <button
          onClick={() => handleQuickCommandClick(
            activeLeadContext 
              ? `/followup ${activeLeadContext.name} ${activeLeadContext.daysInactive} días sin contacto`
              : '/followup Prospecto 3 días sin contacto'
          )}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /followup Lead
        </button>

        <button
          onClick={() => handleQuickCommandClick('/nuevo-lead [Nombre] [Modelo CUPRA] [Origen]')}
          className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] text-xs text-[#eaddff] border border-white/5 whitespace-nowrap active:scale-95 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
        >
          /nuevo-lead [Nombre]
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const parsed = !isUser ? parseCopilotResponse(msg.text) : null;

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-[6px] p-4 lg:p-5 transition-all ${
                  isUser
                    ? 'bg-[#1a2430] text-white border border-[#e09062]/30'
                    : 'bg-[#060f18] text-[#eaddff] border border-[#e09062]/20 shadow-xl'
                }`}
              >
                {/* Header message meta */}
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    {!isUser ? (
                      <span className="font-['Outfit'] text-xs font-bold text-[#e09062] uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#e09062]" />
                        CUPRA COPILOT
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#eaddff]/80 flex items-center gap-1 font-['Outfit']">
                        <User className="w-3 h-3 text-[#e09062]" />
                        Tú (Asesor)
                      </span>
                    )}
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40">{msg.timestamp}</span>
                </div>

                {/* Structured Display if formatted properly */}
                {parsed && parsed.isStructured ? (
                  <div className="space-y-3.5">
                    {/* 1. Acción Inmediata / Resumen */}
                    <div className="bg-[#0b141d] border-l-2 border-[#e09062] p-3 rounded-r-[4px]">
                      <div className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-1 font-semibold">
                        1. Acción Inmediata / Resumen
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed font-['Outfit']">
                        {parsed.immediateAction}
                      </p>
                    </div>

                    {/* 2. Detalle / Plantilla / Contenido */}
                    <div className="bg-[#0b141d] border border-white/5 p-3.5 rounded-[4px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-semibold">
                          2. Detalle / Plantilla / Contenido
                        </span>
                        <button
                          onClick={() => handleCopyText(msg.id, parsed.detailContent)}
                          className="px-2 py-0.5 rounded-[3px] bg-[#1a2430] hover:bg-white/10 text-zinc-300 text-[10px] font-normal flex items-center gap-1 transition-colors font-['JetBrains_Mono']"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#c3f400]" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-[#eaddff] leading-relaxed whitespace-pre-line font-['JetBrains_Mono'] bg-[#060f18] p-3 rounded-[3px] border border-white/5">
                        {parsed.detailContent}
                      </div>

                      {/* WhatsApp direct trigger button if text detected */}
                      {parsed.whatsappMessage && (
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#25d366]">
                            Mensaje listo para WhatsApp
                          </span>
                          <a
                            href={createWhatsAppUrl(
                              activeLeadContext?.phone || '',
                              parsed.whatsappMessage
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-[3px] bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Abrir en WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* 3. Próximo Paso Sugerido */}
                    <div className="bg-[#0b141d] border-l-2 border-[#c3f400] p-3 rounded-r-[4px]">
                      <div className="font-['JetBrains_Mono'] text-[0.65rem] text-[#c3f400] uppercase tracking-[0.15em] mb-1 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#c3f400]" />
                        <span>3. Próximo Paso Sugerido</span>
                      </div>
                      <p className="text-xs text-[#eaddff]/80 leading-relaxed font-['Outfit']">
                        {parsed.suggestedNextStep}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#eaddff] whitespace-pre-line leading-relaxed font-light">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#060f18] border border-[#e09062]/20 rounded-[6px] p-4 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[#e09062] border-t-transparent animate-spin" />
              <span className="font-['JetBrains_Mono'] text-xs text-[#eaddff]/60 animate-pulse">
                CUPRA Copilot estructurando respuesta...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-[#1a2430] border-t border-[#e09062]/20 p-3 md:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta o trigger (ej. /comparar Formentor vs Audi Q3)..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e09062] transition-all font-['Outfit']"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] disabled:opacity-40 text-[#060f18] font-bold flex items-center justify-center shrink-0 shadow-md transition-all"
          >
            <Send className="w-4 h-4 text-[#060f18]" />
          </button>
        </form>
        <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40 mt-2 px-1">
          <span>Tip: Escribe <code className="text-[#e09062]">/objecion</code> o <code className="text-[#e09062]">/comparar</code> para análisis instantáneo.</span>
          <span>Modelo: Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
