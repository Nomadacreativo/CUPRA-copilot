import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FunnelCRM } from './components/FunnelCRM';
import { CopilotChat } from './components/CopilotChat';
import { VehicleShowroom } from './components/VehicleShowroom';
import { FinancingCalculator } from './components/FinancingCalculator';
import { TestDriveStudio } from './components/TestDriveStudio';
import { WhatsAppCopywriter } from './components/WhatsAppCopywriter';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { QuickCommandsModal } from './components/QuickCommandsModal';
import { INITIAL_LEADS } from './data/initialLeads';
import { Lead, LeadStage } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  subscribeToLeads, 
  createOrUpdateLead, 
  updateLeadPartial, 
  seedInitialLeadsIfEmpty 
} from './firebase/leadsService';
import { AlertCircle, X } from 'lucide-react';

function AppContent() {
  const { user, loading, authError, clearAuthError } = useAuth();
  
  // Initialize with localStorage persistence for seamless offline / demo mode
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('cupra_copilot_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached leads from localStorage:', e);
    }
    return INITIAL_LEADS;
  });

  const [activeTab, setActiveTab] = useState<
    'crm' | 'copilot' | 'showroom' | 'financing' | 'testdrive' | 'whatsapp'
  >('crm');

  const [activeLeadContext, setActiveLeadContext] = useState<Lead | null>(null);
  const [presetPrompt, setPresetPrompt] = useState<string | undefined>(undefined);
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<Lead | null>(null);
  const [isQuickCommandsOpen, setIsQuickCommandsOpen] = useState(false);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);

  // Sync leads to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('cupra_copilot_leads', JSON.stringify(leads));
    } catch (e) {
      console.warn('Could not cache leads in localStorage:', e);
    }
  }, [leads]);

  // Initialize and subscribe to Firestore only when auth is ready and user is authenticated (SKILL.md)
  useEffect(() => {
    if (loading || !user) {
      setIsFirestoreSynced(false);
      return;
    }

    let isMounted = true;

    seedInitialLeadsIfEmpty().catch((err) => {
      console.warn('Initial seeding notice:', err);
    });

    const unsubscribe = subscribeToLeads(
      (updatedLeads) => {
        if (!isMounted) return;
        setLeads(updatedLeads);
        setIsFirestoreSynced(true);
      },
      (error) => {
        console.warn('Real-time sync notice:', error);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user, loading]);

  // Update lead stage with Firestore persistence & optimistic local update
  const handleUpdateLeadStage = async (leadId: string, newStage: LeadStage) => {
    const updatedLead = leads.find((l) => l.id === leadId);
    if (!updatedLead) return;

    const newHistory = [
      {
        date: new Date().toLocaleString(),
        action: `Etapa cambiada a ${newStage.toUpperCase()}`,
        type: 'status_change' as const,
      },
      ...(updatedLead.historyTimeline || []),
    ];

    const updates: Partial<Lead> = {
      stage: newStage,
      lastContactDate: new Date().toISOString().split('T')[0],
      daysInactive: 0,
      riskOfFreezing: newStage === 'hot' ? false : updatedLead.riskOfFreezing,
      historyTimeline: newHistory,
    };

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
    );

    if (selectedLeadForDrawer?.id === leadId) {
      setSelectedLeadForDrawer((prev) => (prev ? { ...prev, ...updates } : null));
    }

    // Persist to Firestore if authenticated
    try {
      await updateLeadPartial(leadId, updates);
    } catch (err) {
      console.warn('Could not persist stage update to Firestore:', err);
    }
  };

  // Add new lead with Firestore persistence & optimistic local update
  const handleAddNewLead = async (
    newLeadData: Omit<Lead, 'id' | 'daysInactive' | 'riskOfFreezing' | 'historyTimeline'>
  ) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      daysInactive: 0,
      riskOfFreezing: false,
      historyTimeline: [
        {
          date: new Date().toLocaleString(),
          action: 'Prospecto creado en pipeline comercial',
          type: 'status_change',
        },
      ],
    };

    // Optimistic UI update
    setLeads((prev) => [newLead, ...prev]);

    // Persist to Firestore if authenticated
    try {
      await createOrUpdateLead(newLead);
    } catch (err) {
      console.warn('Could not persist new lead to Firestore:', err);
    }
  };

  // Add note with Firestore persistence
  const handleAddLeadNote = async (leadId: string, noteText: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const updatedNotes = `${targetLead.notes}\n• [${new Date().toLocaleDateString()}] ${noteText}`;
    const updates: Partial<Lead> = {
      notes: updatedNotes,
      daysInactive: 0,
      riskOfFreezing: false,
    };

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
    );

    if (selectedLeadForDrawer?.id === leadId) {
      setSelectedLeadForDrawer((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      await updateLeadPartial(leadId, updates);
    } catch (err) {
      console.warn('Could not persist note to Firestore:', err);
    }
  };

  const handleSelectLeadForCopilot = (lead: Lead, suggestedPrompt?: string) => {
    setActiveLeadContext(lead);
    if (suggestedPrompt) {
      setPresetPrompt(suggestedPrompt);
    }
    setActiveTab('copilot');
  };

  const handleExecuteQuickCommand = (commandString: string) => {
    setPresetPrompt(commandString);
    setActiveTab('copilot');
  };

  return (
    <div className="min-h-screen bg-[#060f18] text-[#eaddff] font-['Outfit'] selection:bg-[#e09062] selection:text-black flex flex-col">
      {/* Global Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leads={leads}
        onOpenQuickCommands={() => setIsQuickCommandsOpen(true)}
      />

      {/* Auth Error Banner if popup blocked or network notice */}
      {authError && (
        <div className="bg-[#1f1015] border-b border-[#ef4444]/40 px-4 py-2 flex items-center justify-between text-xs text-[#ffdad6] font-['JetBrains_Mono']">
          <div className="flex items-center gap-2 max-w-4xl">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span>{authError}</span>
          </div>
          <button 
            onClick={clearAuthError}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'crm' && (
          <FunnelCRM
            leads={leads}
            onUpdateLeadStage={handleUpdateLeadStage}
            onSelectLeadForCopilot={handleSelectLeadForCopilot}
            onAddNewLead={handleAddNewLead}
            onOpenLeadDetails={(lead) => setSelectedLeadForDrawer(lead)}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotChat
            activeLeadContext={activeLeadContext}
            onClearLeadContext={() => setActiveLeadContext(null)}
            onSelectLead={(lead) => setActiveLeadContext(lead)}
            leads={leads}
            presetPrompt={presetPrompt}
            onClearPresetPrompt={() => setPresetPrompt(undefined)}
          />
        )}

        {activeTab === 'showroom' && (
          <VehicleShowroom
            onAskCopilotComparison={(cupra, rival) => {
              handleExecuteQuickCommand(`/comparar ${cupra} vs ${rival}`);
            }}
            onScheduleTestDriveWithModel={(model) => {
              handleExecuteQuickCommand(`/script-testdrive ${model}`);
            }}
          />
        )}

        {activeTab === 'financing' && (
          <FinancingCalculator
            leads={leads}
            onAskCopilotFinancing={(prompt) => {
              setPresetPrompt(prompt);
              setActiveTab('copilot');
            }}
          />
        )}

        {activeTab === 'testdrive' && (
          <TestDriveStudio
            onAskCopilotTestDrive={(model) => {
              handleExecuteQuickCommand(`/script-testdrive ${model}`);
            }}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppCopywriter
            leads={leads}
            onAskCopilotCustomCopy={(prompt) => {
              setPresetPrompt(prompt);
              setActiveTab('copilot');
            }}
          />
        )}
      </main>

      {/* Footer matching Variation 5 */}
      <footer className="bg-[#0b141d] border-t border-[#e09062]/20 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/50 tracking-[0.1em]">
        <div className="flex items-center gap-2">
          <span>CUPRA COPILOT v3.8</span>
          <span>•</span>
          <span className={isFirestoreSynced ? 'text-[#c3f400]' : 'text-[#e09062]'}>
            {isFirestoreSynced ? 'CLOUD FIRESTORE CONECTADO' : 'MODO LOCAL PROTEGIDO'}
          </span>
        </div>
        <div>ADN MARTORELL | TECNOLOGÍA DE ALTO RENDIMIENTO</div>
        <div>2026 © PERFORMANCE ENGINE</div>
      </footer>

      {/* Modals & Drawers */}
      <LeadDetailDrawer
        lead={selectedLeadForDrawer}
        onClose={() => setSelectedLeadForDrawer(null)}
        onUpdateStage={handleUpdateLeadStage}
        onConsultCopilot={(lead) => {
          setSelectedLeadForDrawer(null);
          handleSelectLeadForCopilot(lead);
        }}
        onAddLeadNote={handleAddLeadNote}
      />

      <QuickCommandsModal
        isOpen={isQuickCommandsOpen}
        onClose={() => setIsQuickCommandsOpen(false)}
        onExecuteCommand={handleExecuteQuickCommand}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
