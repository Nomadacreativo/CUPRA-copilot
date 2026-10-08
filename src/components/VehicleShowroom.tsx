import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Plus,
  Edit3,
  Camera,
  Trash2,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { CupraVehicle, CompetitorBenchmark } from '../types';
import { formatCurrency, safeCopyToClipboard, createWhatsAppUrl } from '../utils/formatters';
import { VehicleModal } from './VehicleModal';
import { CupraLogo } from './CupraLogo';

interface VehicleShowroomProps {
  vehicles: CupraVehicle[];
  onAddVehicle: (newVehicle: CupraVehicle) => void;
  onUpdateVehicle: (updatedVehicle: CupraVehicle) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
  onResetVehicles?: () => void;
  onAskCopilotComparison: (cupraModel: string, rivalModel: string) => void;
  onScheduleTestDriveWithModel: (modelName: string) => void;
}

export const VehicleShowroom: React.FC<VehicleShowroomProps> = ({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onResetVehicles,
  onAskCopilotComparison,
  onScheduleTestDriveWithModel,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  // Keep selected vehicle synced if list updates
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    if (!vehicles.some((v) => v.id === selectedVehicleId) && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const [activeTab, setActiveTab] = useState<'specs' | 'comparisons' | 'gallery'>('specs');
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState(0);
  const [copiedArgument, setCopiedArgument] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<CupraVehicle | null>(null);

  if (!selectedVehicle) {
    return (
      <div className="p-12 text-center text-zinc-400 bg-[#0b141d] rounded-[8px] border border-white/5">
        <p>No hay vehículos en la gama activa.</p>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setIsModalOpen(true);
          }}
          className="mt-4 px-4 py-2 bg-[#e09062] text-[#060f18] text-xs font-bold rounded font-['JetBrains_Mono']"
        >
          + Agregar Nuevo Modelo
        </button>
      </div>
    );
  }

  const currentCompetitor: CompetitorBenchmark | undefined = 
    selectedVehicle.competitors?.[selectedCompetitorIndex] || selectedVehicle.competitors?.[0];

  const handleCopyArgument = async (text: string) => {
    const success = await safeCopyToClipboard(text);
    if (success) {
      setCopiedArgument(true);
      setTimeout(() => setCopiedArgument(false), 2000);
    }
  };

  const allPhotos: string[] = [
    ...(selectedVehicle.imageUrl ? [selectedVehicle.imageUrl] : []),
    ...(selectedVehicle.galleryImages || []),
  ].filter((url, index, self) => url && self.indexOf(url) === index);

  const activePhoto = allPhotos[activePhotoIndex] || allPhotos[0] || selectedVehicle.imageUrl;

  return (
    <div className="space-y-6">
      {/* Top Controls & Vehicle Selector Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicle.id === vehicle.id;
            return (
              <button
                key={vehicle.id}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  setSelectedCompetitorIndex(0);
                  setActivePhotoIndex(0);
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

        {/* Action button to Add New Vehicle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEditingVehicle(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-black uppercase tracking-[0.05em] font-['JetBrains_Mono'] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Agregar un nuevo modelo a la gama CUPRA"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Modelo</span>
          </button>

          {onResetVehicles && (
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la gama oficial con los modelos y precios reales de CUPRA?')) {
                  onResetVehicles();
                }
              }}
              className="p-2 rounded-[4px] bg-[#1a2430] hover:bg-zinc-800 text-[#eaddff]/50 hover:text-white border border-white/5 transition-colors"
              title="Restaurar catálogo oficial predeterminado"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative rounded-[8px] bg-[#0b141d] border border-[#e09062]/20 overflow-hidden shadow-2xl">
        {/* Upper Visual Banner & Photo Gallery */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] max-h-80 bg-gradient-to-b from-[#060f18] to-[#0b141d] overflow-hidden border-b border-[#e09062]/20 group">
          {activePhoto ? (
            <img
              src={activePhoto}
              alt={selectedVehicle.name}
              className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#060f18]/80 text-zinc-500">
              <CupraLogo className="w-16 h-16 opacity-30 mb-2" />
              <span className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#eaddff]/40">
                Fotografía del modelo pendiente de asignación
              </span>
            </div>
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b141d] via-[#0b141d]/40 to-transparent" />

          {/* Top Floating Controls on Image */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => {
                setEditingVehicle(selectedVehicle);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-[4px] bg-black/75 hover:bg-[#e09062] hover:text-[#060f18] text-white border border-white/20 hover:border-[#e09062] text-xs font-semibold font-['JetBrains_Mono'] uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg"
              title="Modificar especificaciones, precios o fotos de este modelo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modificar Datos & Fotos</span>
            </button>

            {selectedVehicle.isCustom && onDeleteVehicle && (
              <button
                onClick={() => {
                  if (window.confirm(`¿Seguro que deseas eliminar ${selectedVehicle.name} de la gama?`)) {
                    onDeleteVehicle(selectedVehicle.id);
                  }
                }}
                className="p-1.5 rounded-[4px] bg-black/75 hover:bg-red-600 text-zinc-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
                title="Eliminar este modelo personalizado"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Photo Thumbnail Bar (if multiple photos available) */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20 bg-black/60 p-1.5 rounded-[4px] backdrop-blur-md border border-white/10">
              {allPhotos.map((photo, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setActivePhotoIndex(pIdx)}
                  className={`w-10 h-6 rounded-[2px] overflow-hidden border transition-all ${
                    activePhotoIndex === pIdx
                      ? 'border-[#e09062] scale-105 ring-1 ring-[#e09062]'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Spec Presentation */}
        <div className="p-6 lg:p-8">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] px-2 py-0.5 rounded-[2px] bg-[#1a2430] border border-[#e09062]/30">
                  {selectedVehicle.category}
                </span>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 tracking-wider uppercase">
                  Martorell Engineering & Performance
                </span>
                {selectedVehicle.isCustom && (
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#c3f400] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#c3f400]/10 border border-[#c3f400]/30">
                    Gama Modificada / Nuevo Modelo
                  </span>
                )}
              </div>

              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight uppercase font-['Outfit']">
                {selectedVehicle.name}
              </h2>
              <p className="text-xs text-[#eaddff]/60 mt-1 italic font-light">
                "{selectedVehicle.tagline}"
              </p>

              <div className="mt-4 flex flex-wrap items-baseline gap-4">
                <div>
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 block uppercase">Precio Oficial desde</span>
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
                <span className="text-xs font-semibold text-white block mt-1 font-['Outfit'] line-clamp-1">
                  {selectedVehicle.traction}
                </span>
                <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block line-clamp-1">{selectedVehicle.transmission}</span>
              </div>

              <div className="bg-[#1a2430] border border-[#e09062]/15 p-3 rounded-[4px] text-center">
                <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/50 block uppercase">Eficiencia</span>
                <span className="text-xs font-semibold text-[#c3f400] block mt-1 line-clamp-1 font-['Outfit']">
                  {selectedVehicle.fuelOrRange.split(' ')[0]} {selectedVehicle.fuelOrRange.split(' ')[1] || ''}
                </span>
                <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#eaddff]/40 block">Homologado</span>
              </div>
            </div>
          </div>

          {/* Action strip inside Hero */}
          <div className="mt-6 pt-4 border-t border-[#e09062]/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
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
                <span>CUPRA vs. Competencia ({selectedVehicle.competitors?.length || 0})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingVehicle(selectedVehicle);
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-[4px] bg-[#1a2430] hover:bg-[#253242] border border-[#e09062]/30 text-white text-xs font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-[#e09062]" />
                <span>Modificar / Fotos</span>
              </button>

              <button
                onClick={() => onScheduleTestDriveWithModel(selectedVehicle.name)}
                className="px-4 py-1.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Configurar Test Drive</span>
              </button>
            </div>
          </div>
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
              {(selectedVehicle.highlights || []).map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e09062] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
              {(!selectedVehicle.highlights || selectedVehicle.highlights.length === 0) && (
                <li className="text-zinc-500 italic">Sin equipamiento registrado. Haz clic en "Modificar Datos" para agregarlo.</li>
              )}
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
              {(selectedVehicle.copperDetails || []).map((copper, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e09062] shrink-0 mt-1.5" />
                  <span>{copper}</span>
                </li>
              ))}
              {(!selectedVehicle.copperDetails || selectedVehicle.copperDetails.length === 0) && (
                <li className="text-zinc-500 italic">Sin detalles Copper registrados.</li>
              )}
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
              {(selectedVehicle.competitors || []).map((comp, idx) => (
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

          {/* Key Advantages of CUPRA */}
          <div className="space-y-2">
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] block font-semibold">
              PUNTOS CLAVE DE SUPERIORIDAD CUPRA:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(currentCompetitor.cupraAdvantages || []).map((adv, idx) => (
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

      {/* Modal for Adding or Modifying Vehicle */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        initialVehicle={editingVehicle}
        onSave={(vehicle) => {
          if (editingVehicle) {
            onUpdateVehicle(vehicle);
          } else {
            onAddVehicle(vehicle);
            setSelectedVehicleId(vehicle.id);
          }
        }}
      />
    </div>
  );
};
