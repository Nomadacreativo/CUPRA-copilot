import React, { useState } from 'react';
import { 
  Route, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Copy, 
  Check, 
  Car, 
  Zap, 
  ShieldCheck, 
  Sliders
} from 'lucide-react';
import { CUPRA_VEHICLES } from '../data/cupraCatalog';
import { ClientProfile, TestDriveScriptStep } from '../types';
import { safeCopyToClipboard } from '../utils/formatters';

interface TestDriveStudioProps {
  onAskCopilotTestDrive: (model: string) => void;
}

export const TestDriveStudio: React.FC<TestDriveStudioProps> = ({
  onAskCopilotTestDrive,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(CUPRA_VEHICLES[0].id);
  const selectedVehicle = CUPRA_VEHICLES.find((v) => v.id === selectedVehicleId) || CUPRA_VEHICLES[0];

  const [copiedScript, setCopiedScript] = useState(false);

  // Pre-Drive checklist state
  const [checklist, setChecklist] = useState({
    unitClean: true,
    fuelBatteryCharged: true,
    climateAt21: true,
    beatsAudioReady: true,
    wirelessPhonePaired: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const steps = [
    {
      km: 'KM 0.0',
      tag: 'GARAGE',
      actionLabel: 'Acción: Postura & Volante',
      keyFeature: 'Asientos Bucket & Botones satélite en volante',
      tactility: 'Piel perforada / Asiento Bucket',
      visual: 'Costuras Copper & Botón Satélite',
      quote: `"Antes de encender el motor, nota cómo el asiento tipo Bucket te envuelve exactamente como en un auto de carreras. Los botones satélite están ahí para que tus manos nunca se despeguen: encendido y modo CUPRA directo."`,
    },
    {
      km: 'KM 2.5',
      tag: 'URBANO',
      actionLabel: 'Acción: Modo Comfort',
      keyFeature: 'Modo Comfort, ADAS (Travel Assist) y Dirección Progresiva',
      tactility: 'Filtrado de baches DCC',
      visual: 'Digital Cockpit 10.25"',
      quote: `"Aunque tenemos ${selectedVehicle.hp} caballos, en ciudad se comporta con una suavidad refinada. Fíjate en la dirección progresiva y cómo el habitáculo aísla el ruido; es un deportivo para el día a día."`,
    },
    {
      km: 'KM 5.0',
      tag: 'EMOCIÓN',
      actionLabel: 'Acción: Modo CUPRA',
      keyFeature: 'MODO CUPRA & Aceleración Inmediata',
      tactility: 'Aceleración lateral / Firmeza',
      visual: 'Válvulas abiertas / Escape deportivo',
      quote: `"Presiona ahora el logo CUPRA. Escucha el escape... sujeta firme el volante y acelera a fondo. Siente la contundencia del 0-100 en ${selectedVehicle.zeroToHundred}. Eso es pura emoción de Martorell."`,
    },
    {
      km: 'KM 8.5',
      tag: 'CHASIS',
      actionLabel: 'Acción: Dinámica en Curva',
      keyFeature: `${selectedVehicle.traction} & Chasis DCC 15 niveles`,
      tactility: 'Adherencia vectorial',
      visual: 'Aplomo sin inclinación',
      quote: `"En esta curva, nota que el auto no se inclina ni un centímetro. La tracción lee el asfalto 1,000 veces por segundo para meter la trompa exactamente donde apuntas."`,
    },
    {
      km: 'KM 11.0',
      tag: 'CIERRE',
      actionLabel: 'Acción: Pregunta Final',
      keyFeature: 'Conexión Emocional & Cierre de Venta',
      tactility: 'Silencio post-adrenalina',
      visual: 'Iluminación ambiental envolvente',
      quote: `"¿Qué sensación te dejó la aceleración en Modo CUPRA frente a lo que conduces actualmente? ¿Te imaginas este volante esperándote cada mañana en tu garaje?"`,
      highlight: true,
    },
  ];

  const handleCopyCompleteScript = async () => {
    const fullText = steps
      .map(
        (s) =>
          `📍 [${s.km} ${s.tag}] ${s.actionLabel}\n🗣️ "${s.quote}"\n• Tactilidad: ${s.tactility} | Visual: ${s.visual}\n`
      )
      .join('\n');
    const success = await safeCopyToClipboard(fullText);
    if (success) {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      {/* Sidebar: Stats & Pre-Drive Checklist */}
      <aside className="flex flex-col gap-4">
        {/* Card Panel */}
        <div className="bg-[#1a2430] border border-[#e09062]/20 p-5 rounded-[4px] shadow-xl">
          {/* Stats Bar */}
          <div className="flex gap-8 mb-6 pb-4 border-b border-white/5">
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-white font-['Outfit']">08</div>
              <div className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.1em] text-[#eaddff]/50">
                Leads Activos
              </div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-[#ef4444] font-['Outfit']">03</div>
              <div className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.1em] text-[#eaddff]/50">
                En Riesgo
              </div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-[#c3f400] font-['Outfit']">02</div>
              <div className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.1em] text-[#eaddff]/50">
                Drives Hoy
              </div>
            </div>
          </div>

          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] mb-3 block">
            Checklist Pre-Drive
          </span>

          <div className="space-y-1 divide-y divide-white/5">
            <div 
              onClick={() => toggleCheck('unitClean')}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs text-[#eaddff]"
            >
              <span>Impecable (Lavado & Aroma)</span>
              <span className={`text-sm ${checklist.unitClean ? 'text-[#c3f400]' : 'text-zinc-600'}`}>
                {checklist.unitClean ? '●' : '○'}
              </span>
            </div>

            <div 
              onClick={() => toggleCheck('fuelBatteryCharged')}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs text-[#eaddff]"
            >
              <span>Energía / Tanque &gt; 60%</span>
              <span className={`text-sm ${checklist.fuelBatteryCharged ? 'text-[#c3f400]' : 'text-zinc-600'}`}>
                {checklist.fuelBatteryCharged ? '●' : '○'}
              </span>
            </div>

            <div 
              onClick={() => toggleCheck('climateAt21')}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs text-[#eaddff]"
            >
              <span>Clima Pre-ajustado a 21°C</span>
              <span className={`text-sm ${checklist.climateAt21 ? 'text-[#c3f400]' : 'text-zinc-600'}`}>
                {checklist.climateAt21 ? '●' : '○'}
              </span>
            </div>

            <div 
              onClick={() => toggleCheck('beatsAudioReady')}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs text-[#eaddff]"
            >
              <span>BeatsAudio Demo Listo</span>
              <span className={`text-sm ${checklist.beatsAudioReady ? 'text-[#c3f400]' : 'text-zinc-600'}`}>
                {checklist.beatsAudioReady ? '●' : '○'}
              </span>
            </div>

            <div 
              onClick={() => toggleCheck('wirelessPhonePaired')}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs text-[#eaddff]"
            >
              <span className={checklist.wirelessPhonePaired ? '' : 'opacity-50'}>Full Link Inalámbrico Ready</span>
              <span className={`text-sm ${checklist.wirelessPhonePaired ? 'text-[#c3f400]' : 'text-zinc-600'}`}>
                {checklist.wirelessPhonePaired ? '●' : '○'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onAskCopilotTestDrive(selectedVehicle.name)}
            className="w-full mt-4 py-2.5 px-4 rounded-[4px] bg-transparent border border-[#e09062]/40 text-[#e09062] hover:bg-[#e09062] hover:text-[#060f18] text-xs font-semibold uppercase tracking-[0.05em] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalizar Guion con IA</span>
          </button>
        </div>

        {/* Quick Advisor Performance Tip Card */}
        <div className="bg-[#0b141d] border border-[#e09062]/15 p-4 rounded-[4px] text-xs text-[#eaddff]/70 space-y-1.5">
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] block">
            Regla de Cierre Sensorial
          </span>
          <p className="leading-relaxed">
            Permite que el cliente active él mismo el botón con el logotipo CUPRA en el volante. El vínculo háptico y acústico aumenta la tasa de apartado un 42%.
          </p>
        </div>
      </aside>

      {/* Main Content Area: Test Drive Studio */}
      <section className="bg-[#0b141d] border border-[#e09062]/20 rounded-[8px] overflow-hidden flex flex-col shadow-2xl">
        {/* Section Header matching Variation 5 */}
        <div className="p-5 lg:p-6 border-b border-[#e09062]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b141d]">
          <div>
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] mb-1 block">
              Experiencia Sensorial
            </span>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white font-['Outfit']">
              Test Drive Studio
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-[#060f18] border border-[#e09062]/40 text-[#e09062] px-3.5 py-2 rounded-[4px] font-['Outfit'] font-semibold text-xs focus:outline-none focus:border-[#e09062]"
            >
              {CUPRA_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.hp} HP)
                </option>
              ))}
            </select>

            <button
              onClick={handleCopyCompleteScript}
              className="px-3 py-2 rounded-[4px] bg-[#1a2430] hover:bg-white/10 text-xs text-[#eaddff] border border-[#e09062]/20 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-[#c3f400]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedScript ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Script Container matching Variation 5 */}
        <div className="p-5 lg:p-6 space-y-6 overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-[90px_1fr] gap-4 sm:gap-6 items-start">
              {/* Step Meta in JetBrains Mono on Left */}
              <div className="font-['JetBrains_Mono'] text-[0.7rem] text-[#e09062] sm:text-right pt-1 leading-tight tracking-wider uppercase font-semibold">
                <div>{step.km}</div>
                <div className="text-[#eaddff]/50 font-normal">{step.tag}</div>
              </div>

              {/* Step Body with left copper accent border */}
              <div 
                className={`p-4 lg:p-5 rounded-r-[4px] border-l-2 transition-all ${
                  step.highlight
                    ? 'bg-[#e09062]/5 border-[#e09062]'
                    : 'bg-[#060f18] border-[#e09062] hover:bg-[#0a1622]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-medium">
                    {step.actionLabel}
                  </span>
                  <span className="text-[11px] text-[#eaddff]/50 font-mono">
                    {step.keyFeature}
                  </span>
                </div>

                <p className="text-white font-light text-base lg:text-[1.05rem] leading-relaxed my-2 italic font-['Outfit']">
                  {step.quote}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 font-['JetBrains_Mono'] text-[0.7rem] text-[#eaddff]/60">
                  <div>Tactilidad: <span className="text-white">{step.tactility}</span></div>
                  <div>Visual: <span className="text-white">{step.visual}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
