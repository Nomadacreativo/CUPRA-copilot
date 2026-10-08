export type LeadStage = 'cold' | 'warm' | 'hot';

export type FinancingPreference = 'leasing' | 'credito' | 'unique_flex' | 'contado';

export type ClientProfile = 'performance' | 'corporativo' | 'tech' | 'familiar';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  origin: 'Web Oficial' | 'Instagram Ads' | 'Showroom Walk-in' | 'Recomendación VIP' | 'Evento CUPRA Garage';
  stage: LeadStage;
  modelOfInterest: string;
  dateCreated: string;
  lastContactDate: string;
  daysInactive: number;
  budgetEstimated: number;
  financingPreference: FinancingPreference;
  clientProfile: ClientProfile;
  notes: string;
  nextTask: string;
  riskOfFreezing: boolean; // Flag if lead is at risk of getting cold
  suggestedAction?: string;
  historyTimeline: {
    date: string;
    action: string;
    type: 'whatsapp' | 'call' | 'testdrive' | 'quote' | 'status_change';
  }[];
}

export interface CompetitorBenchmark {
  competitorModel: string;
  brand: 'Audi' | 'BMW' | 'Mercedes-Benz' | 'Alfa Romeo' | 'Volvo';
  hp: number;
  zeroToHundred: string;
  startingPrice: number;
  priceDeltaPercent: number; // e.g. +18% higher
  cupraAdvantages: string[];
  keyArgumentForAdvisor: string;
}

export interface CupraVehicle {
  id: string;
  name: string;
  tagline: string;
  category: 'Crossover Coupé' | 'Hot Hatch' | 'Performance SUV' | '100% Eléctrico SUV' | '100% Eléctrico Hatch' | 'Electrificado e-HYBRID';
  engine: string;
  hp: number;
  torqueNm: number;
  zeroToHundred: string;
  topSpeed: number;
  traction: '4Drive Integral' | 'Delantera' | 'Trasera (RWD)' | 'Dual Motor e-4Drive';
  transmission: 'DSG 7 vel.' | 'Transmisión 1 vel.' | 'e-DSG 6 vel.';
  startingPrice: number;
  monthlyEstimateFrom: number;
  fuelOrRange: string;
  copperDetails: string[];
  highlights: string[];
  competitors: CompetitorBenchmark[];
  soundTrackUrl?: string;
  imageAccentColor: string;
}

export interface StructuredCopilotResponse {
  immediateAction: string;
  detailContent: string;
  suggestedNextStep: string;
  whatsappMessage?: string;
  rawText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  structured?: StructuredCopilotResponse;
  commandUsed?: string;
}

export interface TestDriveScriptStep {
  km: string;
  location: string;
  advisorAction: string;
  sensoryCue: string;
  keyFeatureToDemo: string;
  dialogueScript: string;
}

export interface TestDrivePlan {
  vehicleId: string;
  clientProfile: ClientProfile;
  preDriveChecklist: {
    unitClean: boolean;
    fuelBatteryCharged: boolean;
    tiresChecked: boolean;
    climateAt21: boolean;
    beatsAudioDemoReady: boolean;
    smartPhonePaired: boolean;
  };
  steps: TestDriveScriptStep[];
}
