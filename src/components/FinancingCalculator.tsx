import React, { useState } from 'react';
import { 
  Calculator, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles,
  User
} from 'lucide-react';
import { CUPRA_VEHICLES } from '../data/cupraCatalog';
import { FinancingPreference, Lead } from '../types';
import { formatCurrency, createWhatsAppUrl, safeCopyToClipboard } from '../utils/formatters';

interface FinancingCalculatorProps {
  leads?: Lead[];
  onAskCopilotFinancing: (prompt: string) => void;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  leads = [],
  onAskCopilotFinancing,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const [selectedVehicleId, setSelectedVehicleId] = useState(CUPRA_VEHICLES[0].id);
  const selectedVehicle = CUPRA_VEHICLES.find((v) => v.id === selectedVehicleId) || CUPRA_VEHICLES[0];

  const [scheme, setScheme] = useState<FinancingPreference>('leasing');
  const [vehiclePrice, setVehiclePrice] = useState(selectedVehicle.startingPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [termMonths, setTermMonths] = useState(36);
  const [copiedProposal, setCopiedProposal] = useState(false);

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const v = CUPRA_VEHICLES.find((item) => item.id === id);
    if (v) {
      setVehiclePrice(v.startingPrice);
    }
  };

  const handleLeadSelect = (id: string) => {
    setSelectedLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      // Find matching vehicle if possible
      const matchingVehicle = CUPRA_VEHICLES.find((v) => 
        lead.modelOfInterest.toLowerCase().includes(v.name.toLowerCase()) ||
        v.name.toLowerCase().includes(lead.modelOfInterest.toLowerCase())
      );
      if (matchingVehicle) {
        setSelectedVehicleId(matchingVehicle.id);
        setVehiclePrice(matchingVehicle.startingPrice);
      }
      if (lead.financingPreference) {
        setScheme(lead.financingPreference);
      }
    }
  };

  const downPaymentAmount = Math.round((vehiclePrice * downPaymentPct) / 100);
  const financedAmount = vehiclePrice - downPaymentAmount;

  let annualInterestRate = 0.1399;
  let balloonPct = 0;
  let monthlyPayment = 0;
  let taxDeductibleMonthly = 0;

  if (scheme === 'credito') {
    annualInterestRate = 0.1449;
    const monthlyRate = annualInterestRate / 12;
    monthlyPayment = Math.round(
      (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  } else if (scheme === 'leasing') {
    balloonPct = termMonths === 24 ? 0.45 : termMonths === 36 ? 0.35 : 0.25;
    const residualValue = vehiclePrice * balloonPct;
    const depreciation = (financedAmount - residualValue) / termMonths;
    const financeCharge = (financedAmount + residualValue) * (0.1299 / 12);
    monthlyPayment = Math.round(depreciation + financeCharge);
    taxDeductibleMonthly = Math.min(monthlyPayment, 6000 * 1.16);
  } else if (scheme === 'unique_flex') {
    balloonPct = 0.42;
    const residualValue = vehiclePrice * balloonPct;
    const monthlyRate = 0.1349 / 12;
    monthlyPayment = Math.round(
      ((financedAmount - residualValue * Math.pow(1 + monthlyRate, -termMonths)) * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -termMonths))
    );
  }

  const clientHeader = selectedLead ? ` PARA ${selectedLead.name.toUpperCase()}` : '';

  const executiveProposalText = `*COTIZACIÓN OFICIAL CUPRA GARAGE${clientHeader}*
🚗 *Vehículo:* ${selectedVehicle.name} (${selectedVehicle.hp} HP)
💰 *Precio de Lista:* ${formatCurrency(vehiclePrice)}
📋 *Esquema Financiero:* ${
    scheme === 'leasing'
      ? 'Arrendamiento Puro (Leasing 100% Deducible)'
      : scheme === 'unique_flex'
      ? 'CUPRA Unique / Flex (Renovación Garantizada)'
      : 'Crédito Tradicional'
  }
💵 *Enganche / Pago Inicial (${downPaymentPct}%):* ${formatCurrency(downPaymentAmount)}
⏱️ *Plazo:* ${termMonths} meses
💳 *Mensualidad Estimada:* ${formatCurrency(monthlyPayment)} MXN + IVA
${
  scheme === 'leasing'
    ? `✨ *Beneficio Fiscal:* Mensualidad deducible de impuestos para Persona Física con Act. Empresarial o Persona Moral.\n`
    : ''
}${
    scheme === 'unique_flex'
      ? `🔄 *Al término de los ${termMonths} meses:* 1) Renueva por el último modelo, 2) Quédate con el auto liquidando el valor residual, o 3) Devuélvelo sin penalización.\n`
      : ''
  }
🛡️ *Incluye:* Servicios de mantenimiento en red CUPRA Care y garantía de fábrica.`;

  const handleCopyProposal = async () => {
    const success = await safeCopyToClipboard(executiveProposalText);
    if (success) {
      setCopiedProposal(true);
      setTimeout(() => setCopiedProposal(false), 2000);
    }
  };

  const targetWhatsAppPhone = selectedLead ? selectedLead.phone : '';

  return (
    <div className="space-y-6">
      {/* Title & Explanatory Banner */}
      <div className="bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em] mb-1 block">
            Ingeniería Financiera & Cierre
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight uppercase font-['Outfit']">
            Cotizador & Cierre Comercial
          </h2>
          <p className="text-xs text-[#eaddff]/60 mt-1 font-light">
            Estructuración instantánea de propuestas comerciales por Arrendamiento Puro, CUPRA Flex y Crédito tradicional.
          </p>
        </div>

        {/* Scheme Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#060f18] p-1 rounded-[4px] border border-[#e09062]/20">
          <button
            onClick={() => setScheme('leasing')}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-[0.05em] transition-all font-['JetBrains_Mono'] text-[0.7rem] ${
              scheme === 'leasing'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md'
                : 'text-[#eaddff]/60 hover:text-white'
            }`}
          >
            Leasing Deducible
          </button>
          <button
            onClick={() => setScheme('unique_flex')}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-[0.05em] transition-all font-['JetBrains_Mono'] text-[0.7rem] ${
              scheme === 'unique_flex'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md'
                : 'text-[#eaddff]/60 hover:text-white'
            }`}
          >
            CUPRA Flex
          </button>
          <button
            onClick={() => setScheme('credito')}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-[0.05em] transition-all font-['JetBrains_Mono'] text-[0.7rem] ${
              scheme === 'credito'
                ? 'bg-[#e09062] text-[#060f18] font-bold shadow-md'
                : 'text-[#eaddff]/60 hover:text-white'
            }`}
          >
            Crédito Tradicional
          </button>
        </div>
      </div>

      {/* Optional Client Association Strip */}
      {leads.length > 0 && (
        <div className="bg-[#1a2430] border border-[#e09062]/20 px-4 py-2.5 rounded-[4px] flex flex-wrap items-center justify-between gap-3 font-['JetBrains_Mono'] text-xs">
          <div className="flex items-center gap-2 text-[#eaddff]/80">
            <User className="w-3.5 h-3.5 text-[#e09062]" />
            <span>Personalizar cotización para un cliente del CRM:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadSelect(e.target.value)}
              className="px-3 py-1 rounded-[3px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white focus:outline-none focus:border-[#e09062]"
            >
              <option value="">Cotización General (Sin asignar)</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.modelOfInterest} ({l.phone})
                </option>
              ))}
            </select>

            {selectedLead && (
              <button
                onClick={() => setSelectedLeadId('')}
                className="text-[#eaddff]/40 hover:text-white text-xs px-1"
                title="Quitar asignación"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 space-y-5">
          {/* Vehicle Picker */}
          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-1.5 font-semibold">
              Seleccionar Unidad CUPRA
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20 text-xs text-white font-semibold focus:outline-none focus:border-[#e09062] font-['Outfit']"
            >
              {CUPRA_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.hp} HP) — {formatCurrency(v.startingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-['JetBrains_Mono']">
              <span className="text-[#eaddff]/60 uppercase text-[0.7rem]">Precio del Vehículo</span>
              <span className="text-[#e09062] font-bold">
                {formatCurrency(vehiclePrice)}
              </span>
            </div>
            <input
              type="range"
              min={700000}
              max={1400000}
              step={10000}
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
              className="w-full accent-[#e09062] cursor-pointer"
            />
          </div>

          {/* Down Payment % Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-['JetBrains_Mono']">
              <span className="text-[#eaddff]/60 uppercase text-[0.7rem]">Enganche / Pago Inicial ({downPaymentPct}%)</span>
              <span className="text-white font-bold">
                {formatCurrency(downPaymentAmount)}
              </span>
            </div>
            <input
              type="range"
              min={scheme === 'leasing' ? 10 : 20}
              max={70}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-[#e09062] cursor-pointer"
            />
            <div className="flex justify-between font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40 mt-1">
              <span>{scheme === 'leasing' ? '10% (Lease)' : '20% (Mín)'}</span>
              <span>35% Recomendado</span>
              <span>70% Máximo</span>
            </div>
          </div>

          {/* Term Selector */}
          <div>
            <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] mb-2 font-semibold">
              Plazo de Financiamiento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[24, 36, 48, 60].map((months) => (
                <button
                  key={months}
                  onClick={() => setTermMonths(months)}
                  className={`py-2 rounded-[4px] text-xs font-semibold transition-all border font-['JetBrains_Mono'] ${
                    termMonths === months
                      ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-sm'
                      : 'bg-[#060f18] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
                  }`}
                >
                  {months} Meses
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Specific Sales Advice */}
          <div className="p-4 rounded-[4px] bg-[#1a2430] border-l-2 border-[#e09062] space-y-1.5">
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] block font-semibold">
              {scheme === 'leasing'
                ? 'Estrategia Asesor: Venta Corporativa / Fiscal'
                : scheme === 'unique_flex'
                ? 'Estrategia Asesor: CUPRA Flex Renovación'
                : 'Estrategia Asesor: Crédito Tradicional'}
            </span>
            <p className="text-xs text-[#eaddff]/80 leading-relaxed font-light">
              {scheme === 'leasing' &&
                'Enfatiza la protección del flujo de caja: la renta mensual es deducible al 100%. El cliente renueva auto cada 2 o 3 años sin descapitalizar su negocio.'}
              {scheme === 'unique_flex' &&
                'Ideal para mensualidades hasta 30% menores. Garantizamos el valor futuro del auto para que el cliente renueve fácilmente.'}
              {scheme === 'credito' &&
                'Apropiado para clientes que buscan propiedad patrimonial a largo plazo sin restricciones de kilometraje anual.'}
            </p>
          </div>
        </div>

        {/* Right Column: Calculated Proposal & Export (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#0b141d] rounded-[8px] p-6 border border-[#e09062]/20 shadow-xl space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em]">
                Resumen de Mensualidad
              </span>
              <span className="px-2 py-0.5 rounded-[2px] font-['JetBrains_Mono'] text-[0.65rem] font-bold bg-[#e09062] text-[#060f18]">
                {termMonths} MESES
              </span>
            </div>

            {/* Big Monthly Payment Display */}
            <div className="my-5 text-center p-5 rounded-[4px] bg-[#060f18] border border-[#e09062]/20">
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 block uppercase tracking-wider">
                {selectedLead ? `Cotización para ${selectedLead.name.split(' ')[0]}` : 'Mensualidad Estimada'}
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-[#e09062] tracking-tight my-1 font-['Outfit']">
                {formatCurrency(monthlyPayment)}
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/40 block">
                {scheme === 'leasing' ? '+ IVA (100% Deducible)' : 'Intereses incluidos'}
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 text-xs font-['JetBrains_Mono']">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#eaddff]/50">Enganche / Pago Inicial:</span>
                <span className="text-white font-semibold">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#eaddff]/50">Monto Financiado:</span>
                <span className="text-white font-semibold">{formatCurrency(financedAmount)}</span>
              </div>
              {balloonPct > 0 && (
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#e09062]">Valor Residual ({Math.round(balloonPct * 100)}%):</span>
                  <span className="text-[#e09062] font-semibold">{formatCurrency(vehiclePrice * balloonPct)}</span>
                </div>
              )}
              {scheme === 'leasing' && (
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#c3f400]">Deducción Fiscal Estimada/mes:</span>
                  <span className="text-[#c3f400] font-semibold">{formatCurrency(taxDeductibleMonthly)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={handleCopyProposal}
              className="w-full py-2.5 rounded-[4px] bg-[#1a2430] hover:bg-[#223040] text-white text-xs font-semibold uppercase tracking-[0.05em] border border-[#e09062]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedProposal ? (
                <>
                  <Check className="w-4 h-4 text-[#c3f400]" />
                  <span className="text-[#c3f400]">¡Cotización Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Resumen para el Cliente</span>
                </>
              )}
            </button>

            <a
              href={createWhatsAppUrl(targetWhatsAppPhone, executiveProposalText)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-[4px] bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 text-xs font-bold uppercase tracking-[0.05em] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {selectedLead ? `Enviar a WhatsApp (${selectedLead.name.split(' ')[0]})` : 'Enviar por WhatsApp'}
              </span>
            </a>

            <button
              onClick={() => onAskCopilotFinancing(
                `¿Cómo le explico al cliente los beneficios de elegir ${scheme === 'leasing' ? 'Arrendamiento Puro frente a un crédito tradicional' : 'CUPRA Flex frente a un crédito de banco'} para un ${selectedVehicle.name}?`
              )}
              className="w-full py-2 rounded-[4px] bg-transparent text-[#eaddff]/60 hover:text-[#e09062] text-xs font-medium flex items-center justify-center gap-1.5 transition-all font-['JetBrains_Mono'] text-[0.7rem]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e09062]" />
              <span>Consultar Argumento con Copilot AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
