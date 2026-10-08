import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles
} from 'lucide-react';

interface QuickCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (commandString: string) => void;
}

export const QuickCommandsModal: React.FC<QuickCommandsModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  if (!isOpen) return null;

  const [activeCommand, setActiveCommand] = useState<string>('comparar');

  const [leadName, setLeadName] = useState('');
  const [leadCar, setLeadCar] = useState('CUPRA Formentor VZ');
  const [leadOrigin, setLeadOrigin] = useState('Instagram');

  const [compareCupra, setCompareCupra] = useState('CUPRA Formentor VZ');
  const [compareRival, setCompareRival] = useState('Audi Q3 Sportback');

  const [testDriveModel, setTestDriveModel] = useState('CUPRA Formentor VZ');

  const [followupClient, setFollowupClient] = useState('');
  const [followupDays, setFollowupDays] = useState('3');

  const [objectionType, setObjectionType] = useState('Tasa de interés bancaria vs Arrendamiento');

  const getCommandString = () => {
    switch (activeCommand) {
      case 'nuevo-lead':
        return `/nuevo-lead ${leadName || 'Prospecto'} ${leadCar} ${leadOrigin}`;
      case 'comparar':
        return `/comparar ${compareCupra} vs ${compareRival}`;
      case 'script-testdrive':
        return `/script-testdrive ${testDriveModel}`;
      case 'followup':
        return `/followup ${followupClient || 'Prospecto'} ${followupDays} días sin contacto`;
      case 'objecion':
        return `/objecion ${objectionType}`;
      default:
        return '';
    }
  };

  const handleRun = () => {
    const cmd = getCommandString();
    onExecuteCommand(cmd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b141d] border border-[#e09062]/40 rounded-[8px] w-full max-w-xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#e09062]" />
            <h3 className="font-['Outfit'] font-bold text-base text-white uppercase tracking-wide">
              Comandos de Acción Rápida (Triggers)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-base"
          >
            ✕
          </button>
        </div>

        {/* Command Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setActiveCommand('comparar')}
            className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
              activeCommand === 'comparar'
                ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
            }`}
          >
            /comparar
          </button>

          <button
            onClick={() => setActiveCommand('script-testdrive')}
            className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
              activeCommand === 'script-testdrive'
                ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
            }`}
          >
            /script-testdrive
          </button>

          <button
            onClick={() => setActiveCommand('objecion')}
            className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
              activeCommand === 'objecion'
                ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
            }`}
          >
            /objecion
          </button>

          <button
            onClick={() => setActiveCommand('followup')}
            className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] ${
              activeCommand === 'followup'
                ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
            }`}
          >
            /followup
          </button>

          <button
            onClick={() => setActiveCommand('nuevo-lead')}
            className={`p-2 rounded-[4px] text-xs font-semibold text-left border transition-all uppercase tracking-wider font-['JetBrains_Mono'] text-[0.65rem] sm:col-span-2 ${
              activeCommand === 'nuevo-lead'
                ? 'bg-[#e09062] text-[#060f18] border-[#e09062] font-bold shadow-md'
                : 'bg-[#1a2430] text-[#eaddff]/70 border-white/5 hover:border-[#e09062]'
            }`}
          >
            /nuevo-lead
          </button>
        </div>

        {/* Dynamic Parameter Form */}
        <div className="bg-[#060f18] p-4 rounded-[6px] border border-white/5 space-y-3 mb-4">
          {activeCommand === 'comparar' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Modelo CUPRA</label>
                <select
                  value={compareCupra}
                  onChange={(e) => setCompareCupra(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                >
                  <option value="CUPRA Formentor VZ">CUPRA Formentor VZ</option>
                  <option value="CUPRA Leon VZ">CUPRA Leon VZ</option>
                  <option value="CUPRA Ateca">CUPRA Ateca</option>
                  <option value="CUPRA Tavascan">CUPRA Tavascan</option>
                  <option value="CUPRA Born">CUPRA Born</option>
                  <option value="CUPRA Terramar">CUPRA Terramar</option>
                </select>
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Modelo Rival</label>
                <input
                  type="text"
                  value={compareRival}
                  onChange={(e) => setCompareRival(e.target.value)}
                  placeholder="Ej. BMW X2 M35i"
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeCommand === 'script-testdrive' && (
            <div>
              <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Modelo para la Prueba de Manejo</label>
              <select
                value={testDriveModel}
                onChange={(e) => setTestDriveModel(e.target.value)}
                className="w-full px-3 py-2 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
              >
                <option value="CUPRA Formentor VZ">CUPRA Formentor VZ (310 HP)</option>
                <option value="CUPRA Leon VZ">CUPRA Leon VZ (300 HP)</option>
                <option value="CUPRA Ateca">CUPRA Ateca (300 HP)</option>
                <option value="CUPRA Tavascan">CUPRA Tavascan (100% Eléctrico 340 HP)</option>
                <option value="CUPRA Born">CUPRA Born (100% Eléctrico 231 HP)</option>
                <option value="CUPRA Terramar">CUPRA Terramar (e-HYBRID 272 HP)</option>
              </select>
            </div>
          )}

          {activeCommand === 'objecion' && (
            <div>
              <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Tipo de Objeción</label>
              <select
                value={objectionType}
                onChange={(e) => setObjectionType(e.target.value)}
                className="w-full px-3 py-2 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
              >
                <option value="Precio / Descuento del competidor">Precio / Rival ofrece mayor descuento</option>
                <option value="Tasa de interés bancaria vs Arrendamiento">Tasa de interés alta vs Arrendamiento Deducible</option>
                <option value="Marca poco conocida frente a los alemanes tradicionales">Marca poco conocida frente a Audi/BMW/Mercedes</option>
                <option value="Tiempo de entrega y disponibilidad de unidad">Tiempo de entrega / Disponibilidad de inventario</option>
              </select>
            </div>
          )}

          {activeCommand === 'followup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  value={followupClient}
                  onChange={(e) => setFollowupClient(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Días sin Contacto</label>
                <input
                  type="number"
                  value={followupDays}
                  onChange={(e) => setFollowupDays(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeCommand === 'nuevo-lead' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Nombre</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Auto</label>
                <input
                  type="text"
                  value={leadCar}
                  onChange={(e) => setLeadCar(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Origen</label>
                <input
                  type="text"
                  value={leadOrigin}
                  onChange={(e) => setLeadOrigin(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-[4px] bg-[#1a2430] border border-white/5 font-['JetBrains_Mono'] text-[0.7rem] text-[#e09062]">
            Comando listo: <code>{getCommandString()}</code>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[4px] text-xs text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleRun}
            className="px-5 py-2 rounded-[4px] bg-[#e09062] text-[#060f18] text-xs font-bold uppercase tracking-[0.05em] hover:bg-[#f0a072] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#060f18]" />
            <span>Ejecutar en Copilot AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
