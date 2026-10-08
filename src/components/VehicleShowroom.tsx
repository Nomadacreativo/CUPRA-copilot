import React, { useState } from 'react';
import { 
  Gauge, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { CUPRA_VEHICLES } from '../data/cupraCatalog';
import { CupraVehicle, CompetitorBenchmark } from '../types';
import { formatCurrency, safeCopyToClipboard, createWhatsAppUrl } from '../utils/formatters';

interface VehicleShowroomProps {
  onAskCopilotComparison: (cupraModel: string, rivalModel: string) => void;
  onScheduleTestDriveWithModel: (modelName: string) => void;
}

export const VehicleShowroom: React.FC<VehicleShowroomProps> = ({
  onAskCopilotComparison,
  onScheduleTestDriveWithModel,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<CupraVehicle>(CUPRA_VEHICLES[0]);
  const [activeTab, setActiveTab] = useState<'specs' | 'comparisons'>('specs');
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState(0);
  const [copiedArgument, setCopiedArgument] = useState(false);

  const currentCompetitor: CompetitorBenchmark | undefined = 
    selectedVehicle.competitors[selectedCompetitorIndex] || selectedVehicle.competitors[0];

  const handleCopyArgument = async (text: string) => {
    const success = await safeCopyToClipboard(text);
    if (success) {
      setCopiedArgument(true);
      setTimeout(() => setCopiedArgument(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CUPRA_VEHICLES.map((vehicle) => {
          const isSelected = selectedVehicle.id === vehicle.id;
          return (
            <button
              key={vehicle.id}
              onClick={() => {
                setSelectedVehicle(vehicle);
                setSelectedCompetitorIndex(0);
              }}
              className={`px-3.5 py-2 rounded-[4px] flex items-center gap-2 text-xs uppercase tracking-[0.05em] font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#e09062] text-[#060f18] font-bold border-[#e09062] shadow-md shadow-[#e09062]/20'
                  : 'bg-[#1a2430] text-[#eaddff]/70 border-[#e09062]/20 hover:border-[#e09062] hover:text-white'
              }`}
            >
              <span>{vehicle.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-['JetBrains_Mono'] ${isSelected ? 'bg-[#060f18] text-[#e09062]' : 'bg-[#060f18] text-[#eaddff]/50'}`}>
                {vehicle.hp} HP
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Showcase Card */}
      <div className="relative rounded-[8px] bg-[#0b141d] border border-[#e09062]/20 p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] px-2 py-0.5 rounded-[2px] bg-[#1a2430] border border-[#e09062]/30">
                {selectedVehicle.category}
              </span>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 tracking-wider uppercase">
                Martorell Engineering
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight uppercase font-['Outfit']">
              {selectedVehicle.name}
            </h2>
            <p className="text-xs text-[#eaddff]/60 mt-1 italic font-light">
              "{selectedVehicle.tagline}"
            </p>

            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <div>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 block uppercase">Precio desde</span>
                <span className="text-xl lg:text-2xl font-bold text-[#e09062] font-['Outfit']">
                  {formatCurrency(selectedVehicle.startingPrice)}
                </span>
              </div>
              <div className="pl-4 border-l border-white/10">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 block uppercase">Mensualidad estimada</span>
                <span className="text-sm font-semibold text-white font-['Outfit']">
                  Desde {formatCurrency(selectedVehicle.monthlyEstimateFrom)}/mes
                </span>
              </div>
            </div>
          </div>

          {/* Key Dynamics Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-[#1a2430] border border-[#e09062]/15 p-3 rounded-[4px] text-center">
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/50 block uppercase">Potencia</span>
              <span className="text-lg font-bold text-[#e09062] font-['Outfit'] block">
                {selectedVehicle.hp} HP
              </span>
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block">{selectedVehicle.torqueNm} Nm</span>
            </div>

            <div className="bg-[#1a2430] border border-[#e09062]/15 p-3 rounded-[4px] text-center">
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/50 block uppercase">0-100 km/h</span>
              <span className="text-lg font-bold text-white font-['Outfit'] block">
                {selectedVehicle.zeroToHundred}
              </span>
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block">{selectedVehicle.topSpeed} km/h</span>
            </div>

            <div className="bg-[#1a2430] border border-[#e09062]/15 p-3 rounded-[4px] text-center">
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/50 block uppercase">Tracción</span>
              <span className="text-xs font-semibold text-white block mt-1 font-['Outfit']">
                {selectedVehicle.traction}
              </span>
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block">{selectedVehicle.transmission}</span>
            </div>

            <div className="bg-[#1a2430] border border-[#e09062]/15 p-3 rounded-[4px] text-center">
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/50 block uppercase">Eficiencia</span>
              <span className="text-xs font-semibold text-[#c3f400] block mt-1 line-clamp-1 font-['Outfit']">
                {selectedVehicle.fuelOrRange.split(' ')[0]} {selectedVehicle.fuelOrRange.split(' ')[1]}
              </span>
              <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block">Homologado</span>
            </div>
          </div>
        </div>

        {/* Action strip inside Hero */}
        <div className="mt-6 pt-4 border-t border-[#e09062]/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all ${
                activeTab === 'specs'
                  ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md'
                  : 'bg-[#1a2430] text-[#eaddff]/70 hover:text-white'
              }`}
            >
              Ficha & Detalles Copper
            </button>
            <button
              onClick={() => setActiveTab('comparisons')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 ${
                activeTab === 'comparisons'
                  ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md'
                  : 'bg-[#1a2430] text-[#eaddff]/70 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CUPRA vs. Competencia ({selectedVehicle.competitors.length})</span>
            </button>
          </div>

          <button
            onClick={() => onScheduleTestDriveWithModel(selectedVehicle.name)}
            className="px-4 py-1.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Configurar Test Drive</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Specs & Copper Highlights */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0b141d] rounded-[6px] p-5 border border-[#e09062]/20 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sliders className="w-4 h-4 text-[#e09062]" />
              <h3 className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] font-semibold">
                EQUIPAMIENTO DE SERIE & PERFORMANCE
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#eaddff]/80 font-light">
              {selectedVehicle.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e09062] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0b141d] rounded-[6px] p-5 border border-[#e09062]/20 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-[#e09062]" />
              <h3 className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] font-semibold">
                IDENTIDAD & DETALLES COPPER (COBRE)
              </h3>
            </div>
            <p className="text-xs text-[#eaddff]/50 font-light">
              El cobre simboliza la energía, la precisión y la deportividad sofisticada de CUPRA.
            </p>
            <ul className="space-y-2 text-xs text-[#eaddff]/80 font-light">
              {selectedVehicle.copperDetails.map((copper, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e09062] shrink-0 mt-1.5" />
                  <span>{copper}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Comparativa Directa con Competidores */}
      {activeTab === 'comparisons' && currentCompetitor && (
        <div className="bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <h3 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <span>{selectedVehicle.name}</span>
                <span className="text-[#e09062] text-xs">VS.</span>
                <span className="text-[#eaddff]/70">{currentCompetitor.competitorModel}</span>
              </h3>
              <p className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50">
                Argumentario técnico y comercial para rebatir objeciones de marcas alemanas tradicionales
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {selectedVehicle.competitors.map((comp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCompetitorIndex(idx)}
                  className={`px-3 py-1 rounded-[3px] text-xs font-semibold whitespace-nowrap transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.7rem] ${
                    selectedCompetitorIndex === idx
                      ? 'bg-[#e09062] text-[#060f18] font-bold'
                      : 'bg-[#1a2430] text-[#eaddff]/70 hover:text-white'
                  }`}
                >
                  {comp.brand} ({comp.hp} HP)
                </button>
              ))}
            </div>
          </div>

          {/* Benchmark Spec Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#060f18] p-4 rounded-[6px] border border-white/5 font-['JetBrains_Mono']">
            <div className="p-3 bg-[#1a2430] rounded-[4px] text-center border border-white/5">
              <span className="text-[0.65rem] text-[#eaddff]/50 block uppercase">Diferencia de Potencia</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="text-base font-bold text-[#e09062]">{selectedVehicle.hp} HP</span>
                <span className="text-xs text-[#eaddff]/40">vs</span>
                <span className="text-xs font-semibold text-zinc-300">{currentCompetitor.hp} HP</span>
              </div>
              <span className="text-[0.65rem] text-[#c3f400] font-semibold block mt-1">
                {selectedVehicle.hp > currentCompetitor.hp ? `+${selectedVehicle.hp - currentCompetitor.hp} HP a favor de CUPRA` : 'Rendimiento optimizado'}
              </span>
            </div>

            <div className="p-3 bg-[#1a2430] rounded-[4px] text-center border border-white/5">
              <span className="text-[0.65rem] text-[#eaddff]/50 block uppercase">Aceleración 0-100 km/h</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="text-base font-bold text-[#e09062]">{selectedVehicle.zeroToHundred}</span>
                <span className="text-xs text-[#eaddff]/40">vs</span>
                <span className="text-xs font-semibold text-zinc-300">{currentCompetitor.zeroToHundred}</span>
              </div>
              <span className="text-[0.65rem] text-[#eaddff]/60 block mt-1">
                Respuesta inmediata y dinamismo puro
              </span>
            </div>

            <div className="p-3 bg-[#1a2430] rounded-[4px] text-center border border-white/5">
              <span className="text-[0.65rem] text-[#eaddff]/50 block uppercase">Diferencia de Precio</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="text-xs font-bold text-[#e09062]">{formatCurrency(selectedVehicle.startingPrice)}</span>
                <span className="text-xs text-[#eaddff]/40">vs</span>
                <span className="text-xs text-zinc-300">{formatCurrency(currentCompetitor.startingPrice)}</span>
              </div>
              <span className="text-[0.65rem] text-[#e09062] font-semibold block mt-1">
                Rival cuesta +{currentCompetitor.priceDeltaPercent}% más caro
              </span>
            </div>
          </div>

          {/* 3 Key Advantages of CUPRA */}
          <div className="space-y-2">
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] block font-semibold">
              3 PUNTOS CLAVE DE SUPERIORIDAD CUPRA:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentCompetitor.cupraAdvantages.map((adv, idx) => (
                <div key={idx} className="bg-[#060f18] border border-white/5 p-3 rounded-[4px] flex items-start gap-2.5">
                  <span className="font-['JetBrains_Mono'] w-5 h-5 rounded-[2px] bg-[#1a2430] text-[#e09062] font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#eaddff]/90 leading-relaxed font-light">
                    {adv}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verbal Closing Pitch for Advisor */}
          <div className="bg-[#1a2430] border-l-2 border-[#e09062] p-4 rounded-r-[4px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Argumento de Cierre Verbal para el Asesor:
              </span>
              <button
                onClick={() => handleCopyArgument(currentCompetitor.keyArgumentForAdvisor)}
                className="px-2.5 py-1 rounded-[3px] bg-[#060f18] hover:bg-black text-xs text-[#e09062] flex items-center gap-1 transition-all font-['JetBrains_Mono'] text-[0.65rem]"
              >
                {copiedArgument ? <Check className="w-3 h-3 text-[#c3f400]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedArgument ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-xs text-white leading-relaxed font-['Outfit'] italic bg-[#060f18] p-3 rounded-[3px] border border-white/5">
              "{currentCompetitor.keyArgumentForAdvisor}"
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <a
                href={createWhatsAppUrl(
                  '',
                  `*COMPARATIVO: ${selectedVehicle.name} vs. ${currentCompetitor.competitorModel}*\n` +
                  `🏁 Potencia: ${selectedVehicle.hp} HP (vs ${currentCompetitor.hp} HP)\n` +
                  `⚡ Aceleración: ${selectedVehicle.zeroToHundred} de 0 a 100 km/h\n` +
                  `💰 Precio CUPRA: ${formatCurrency(selectedVehicle.startingPrice)} (Rival cuesta +${currentCompetitor.priceDeltaPercent}% más)\n\n` +
                  `"${currentCompetitor.keyArgumentForAdvisor}"`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-[4px] bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Compartir en WhatsApp</span>
              </a>

              <button
                onClick={() => onAskCopilotComparison(selectedVehicle.name, currentCompetitor.competitorModel)}
                className="px-3.5 py-1.5 rounded-[4px] bg-[#e09062] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] hover:bg-[#f0a072] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span>Desarrollar objeción en Copilot AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
