import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { CupraVehicle, CompetitorBenchmark } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: CupraVehicle) => void;
  initialVehicle?: CupraVehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialVehicle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Crossover Coupé');
  const [engine, setEngine] = useState('');
  const [hp, setHp] = useState<number>(300);
  const [torqueNm, setTorqueNm] = useState<number>(400);
  const [zeroToHundred, setZeroToHundred] = useState('4.9 seg');
  const [topSpeed, setTopSpeed] = useState<number>(250);
  const [traction, setTraction] = useState('4Drive Integral');
  const [transmission, setTransmission] = useState('DSG 7 vel.');
  const [startingPrice, setStartingPrice] = useState<number>(899900);
  const [monthlyEstimateFrom, setMonthlyEstimateFrom] = useState<number>(13450);
  const [fuelOrRange, setFuelOrRange] = useState('Consumo combinado 12.8 km/l');
  const [imageAccentColor, setImageAccentColor] = useState('#e09062');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Custom highlights & copper details
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [copperDetails, setCopperDetails] = useState<string[]>([]);
  const [newCopperDetail, setNewCopperDetail] = useState('');

  // Primary competitor
  const [competitorModel, setCompetitorModel] = useState('');
  const [competitorBrand, setCompetitorBrand] = useState<'Audi' | 'BMW' | 'Mercedes-Benz' | 'Alfa Romeo' | 'Volvo'>('Audi');
  const [competitorHp, setCompetitorHp] = useState<number>(245);
  const [competitorZeroToHundred, setCompetitorZeroToHundred] = useState('5.8 seg');
  const [competitorPrice, setCompetitorPrice] = useState<number>(1100000);
  const [keyArgument, setKeyArgument] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'photos' | 'competitor'>('general');
  const [errorMessage, setErrorMessage] = useState('');

  // Load initial vehicle data if editing
  useEffect(() => {
    if (initialVehicle) {
      setName(initialVehicle.name);
      setTagline(initialVehicle.tagline);
      setCategory(initialVehicle.category);
      setEngine(initialVehicle.engine);
      setHp(initialVehicle.hp);
      setTorqueNm(initialVehicle.torqueNm);
      setZeroToHundred(initialVehicle.zeroToHundred);
      setTopSpeed(initialVehicle.topSpeed);
      setTraction(initialVehicle.traction);
      setTransmission(initialVehicle.transmission);
      setStartingPrice(initialVehicle.startingPrice);
      setMonthlyEstimateFrom(initialVehicle.monthlyEstimateFrom);
      setFuelOrRange(initialVehicle.fuelOrRange);
      setImageAccentColor(initialVehicle.imageAccentColor || '#e09062');
      setImageUrl(initialVehicle.imageUrl || '');
      setGalleryImages(initialVehicle.galleryImages || (initialVehicle.imageUrl ? [initialVehicle.imageUrl] : []));
      setHighlights(initialVehicle.highlights || []);
      setCopperDetails(initialVehicle.copperDetails || []);

      if (initialVehicle.competitors && initialVehicle.competitors.length > 0) {
        const comp = initialVehicle.competitors[0];
        setCompetitorModel(comp.competitorModel);
        setCompetitorBrand(comp.brand);
        setCompetitorHp(comp.hp);
        setCompetitorZeroToHundred(comp.zeroToHundred);
        setCompetitorPrice(comp.startingPrice);
        setKeyArgument(comp.keyArgumentForAdvisor);
      } else {
        setCompetitorModel('');
        setKeyArgument('');
      }
    } else {
      // Defaults for brand new model
      setName('');
      setTagline('El nuevo referente de alto rendimiento y diseño audaz');
      setCategory('Crossover Coupé');
      setEngine('2.0 TSI Turbocharged');
      setHp(300);
      setTorqueNm(400);
      setZeroToHundred('4.9 seg');
      setTopSpeed(250);
      setTraction('4Drive Integral');
      setTransmission('DSG 7 vel.');
      setStartingPrice(899900);
      setMonthlyEstimateFrom(13450);
      setFuelOrRange('Consumo combinado 13.0 km/l');
      setImageAccentColor('#e09062');
      setImageUrl('');
      setGalleryImages([]);
      setHighlights([
        'Control de Chasis Dinámico DCC con modo CUPRA',
        'Asientos deportivos tipo Bucket con sujeción lateral premium',
        'Digital Cockpit con visualización deportiva específica',
        'Faros Matrix Full LED de encendido adaptativo',
      ]);
      setCopperDetails([
        'Emblema frontal tridimensional en acabado Copper pulido',
        'Costuras deportivas en volante y habitáculo en tono cobre',
        'Rines maquinados con inserciones de aleación Copper',
      ]);
      setCompetitorModel('Audi Q3 Sportback 45 TFSI');
      setCompetitorBrand('Audi');
      setCompetitorHp(245);
      setCompetitorZeroToHundred('5.8 seg');
      setCompetitorPrice(1120000);
      setKeyArgument('CUPRA ofrece mayor potencia, tracción integral y chasis adaptativo por un precio significativamente menor.');
    }
    setErrorMessage('');
    setActiveTab('general');
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload (converts to base64 data URL)
  const handleMainImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Por favor selecciona una imagen menor a 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
      if (!galleryImages.includes(result)) {
        setGalleryImages((prev) => [result, ...prev]);
      }
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Por favor selecciona una imagen menor a 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setGalleryImages((prev) => [...prev, result]);
      if (!imageUrl) {
        setImageUrl(result);
      }
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights((prev) => [...prev, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCopperDetail = () => {
    if (!newCopperDetail.trim()) return;
    setCopperDetails((prev) => [...prev, newCopperDetail.trim()]);
    setNewCopperDetail('');
  };

  const handleRemoveCopperDetail = (idx: number) => {
    setCopperDetails((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const target = galleryImages[idx];
    const filtered = galleryImages.filter((_, i) => i !== idx);
    setGalleryImages(filtered);
    if (imageUrl === target) {
      setImageUrl(filtered[0] || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre del vehículo es obligatorio.');
      setActiveTab('general');
      return;
    }

    const vehicleId = initialVehicle
      ? initialVehicle.id
      : `cupra-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Build competitor benchmark
    const priceDelta = startingPrice > 0 
      ? Math.round(((competitorPrice - startingPrice) / startingPrice) * 100) 
      : 20;

    const competitors: CompetitorBenchmark[] = competitorModel.trim() ? [
      {
        competitorModel: competitorModel.trim(),
        brand: competitorBrand,
        hp: competitorHp,
        zeroToHundred: competitorZeroToHundred,
        startingPrice: competitorPrice,
        priceDeltaPercent: priceDelta,
        cupraAdvantages: [
          `+${Math.max(0, hp - competitorHp)} HP de ventaja técnica en potencia`,
          'Puesta a punto de chasis deportivo desarrollada en Martorell',
          'Mayor equipamiento de serie sin pagar sobreprecio por la insignia',
        ],
        keyArgumentForAdvisor: keyArgument || `Por un precio mucho más competitivo frente a ${competitorBrand}, este CUPRA entrega mayores prestaciones y diseño exclusivo.`,
      }
    ] : (initialVehicle?.competitors || []);

    const updatedVehicle: CupraVehicle = {
      id: vehicleId,
      name: name.trim(),
      tagline: tagline.trim() || 'ADN 100% CUPRA',
      category: category.trim(),
      engine: engine.trim() || 'Motorización de Alto Rendimiento',
      hp: Number(hp) || 300,
      torqueNm: Number(torqueNm) || 400,
      zeroToHundred: zeroToHundred.trim() || '5.0 seg',
      topSpeed: Number(topSpeed) || 250,
      traction: traction.trim() || '4Drive Integral',
      transmission: transmission.trim() || 'DSG 7 vel.',
      startingPrice: Number(startingPrice) || 899900,
      monthlyEstimateFrom: Number(monthlyEstimateFrom) || 13450,
      fuelOrRange: fuelOrRange.trim() || 'Consumo eficiente homologado',
      imageAccentColor: imageAccentColor || '#e09062',
      imageUrl: imageUrl.trim() || (galleryImages[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'),
      galleryImages: galleryImages.length > 0 ? galleryImages : (imageUrl ? [imageUrl] : []),
      copperDetails: copperDetails.length > 0 ? copperDetails : ['Detalles en acabado Copper de alta precisión'],
      highlights: highlights.length > 0 ? highlights : ['Chasis dinámico de alto rendimiento'],
      competitors,
      isCustom: true,
    };

    onSave(updatedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b141d] border border-[#e09062]/40 rounded-[10px] w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e09062]/20 flex items-center justify-between bg-[#060f18]/60">
          <div>
            <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.2em]">
              Gama & Catálogo CUPRA Oficial
            </span>
            <h2 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight font-['Outfit'] flex items-center gap-2">
              {initialVehicle ? (
                <>
                  <span>Modificar Datos de</span>
                  <span className="text-[#e09062]">{initialVehicle.name}</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#e09062]" />
                  <span>Agregar Nuevo Modelo a la Gama</span>
                </>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] bg-[#1a2430] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-[#0e1924] px-6 gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono'] border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-[#e09062] text-[#e09062] font-bold'
                : 'border-transparent text-[#eaddff]/60 hover:text-white'
            }`}
          >
            1. General & Precios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono'] border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-[#e09062] text-[#e09062] font-bold'
                : 'border-transparent text-[#eaddff]/60 hover:text-white'
            }`}
          >
            2. Motor & Desempeño
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono'] border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'border-[#e09062] text-[#e09062] font-bold'
                : 'border-transparent text-[#eaddff]/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Fotos ({galleryImages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('competitor')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono'] border-b-2 transition-all ${
              activeTab === 'competitor'
                ? 'border-[#e09062] text-[#e09062] font-bold'
                : 'border-transparent text-[#eaddff]/60 hover:text-white'
            }`}
          >
            4. Rival & Argumentario
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-[4px] flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: General & Precios */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                    Nombre del Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CUPRA Formentor VZ5 390 HP"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  >
                    <option value="Crossover Coupé">Crossover Coupé</option>
                    <option value="Hot Hatch">Hot Hatch</option>
                    <option value="Performance SUV">Performance SUV</option>
                    <option value="100% Eléctrico SUV">100% Eléctrico SUV</option>
                    <option value="100% Eléctrico Hatch">100% Eléctrico Hatch</option>
                    <option value="Electrificado e-HYBRID">Electrificado e-HYBRID</option>
                    <option value="Sedán Deportivo">Sedán Deportivo</option>
                    <option value="Edición Especial Limitada">Edición Especial Limitada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                  Tagline / Eslogan Comercial
                </label>
                <input
                  type="text"
                  placeholder="Ej. El Crossover de máximo desempeño con motor de 5 cilindros"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white focus:outline-none focus:border-[#e09062]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#060f18] p-4 rounded-[6px] border border-white/5">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                    Precio de Lista Oficial (MXN) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={1000}
                    value={startingPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStartingPrice(val);
                      // Auto-update monthly estimate
                      setMonthlyEstimateFrom(Math.round((val * 0.75 * 0.017) + (val * 0.005)));
                    }}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#1a2430] border border-[#e09062]/30 text-xs font-bold text-[#e09062]"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">
                    Mensualidad Estimada (MXN)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    value={monthlyEstimateFrom}
                    onChange={(e) => setMonthlyEstimateFrom(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">
                    Color de Acento Visual
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={imageAccentColor}
                      onChange={(e) => setImageAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={imageAccentColor}
                      onChange={(e) => setImageAccentColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs font-['JetBrains_Mono'] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Motor & Desempeño */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                  Motorización / Propulsión *
                </label>
                <input
                  type="text"
                  placeholder="Ej. 2.0 TSI Turbocharged 4 Cilindros / Dual Motor EV"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white focus:outline-none focus:border-[#e09062]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#060f18] p-4 rounded-[6px] border border-white/5">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Potencia (HP)</label>
                  <input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs font-bold text-[#e09062]"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">Torque (Nm)</label>
                  <input
                    type="number"
                    value={torqueNm}
                    onChange={(e) => setTorqueNm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">0-100 km/h</label>
                  <input
                    type="text"
                    placeholder="4.9 seg"
                    value={zeroToHundred}
                    onChange={(e) => setZeroToHundred(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">Velocidad Máx. (km/h)</label>
                  <input
                    type="number"
                    value={topSpeed}
                    onChange={(e) => setTopSpeed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Tracción</label>
                  <input
                    type="text"
                    placeholder="4Drive Integral / Delantera / RWD"
                    value={traction}
                    onChange={(e) => setTraction(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Transmisión</label>
                  <input
                    type="text"
                    placeholder="DSG 7 vel. / 1 vel. EV"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">Consumo / Rango EV</label>
                  <input
                    type="text"
                    placeholder="Consumo 12.8 km/l o 547 km EV"
                    value={fuelOrRange}
                    onChange={(e) => setFuelOrRange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[4px] bg-[#060f18] border border-[#e09062]/30 text-xs text-white"
                  />
                </div>
              </div>

              {/* Highlights List Builder */}
              <div className="bg-[#060f18] p-4 rounded-[6px] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-semibold">
                    Equipamiento & Performance Destacado
                  </span>
                  <span className="text-[10px] text-zinc-500 font-['JetBrains_Mono']">{highlights.length} elementos</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar viñeta de equipamiento (ej. Frenos Akebono de 6 pistones)"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                    className="flex-1 px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-1.5 rounded-[4px] bg-[#e09062] text-[#060f18] text-xs font-bold"
                  >
                    Agregar
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#1a2430]/70 px-2.5 py-1.5 rounded-[3px] text-xs text-[#eaddff]">
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Fotos & Galería */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              <div className="bg-[#060f18] p-4 rounded-[6px] border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-['Outfit'] text-sm font-bold text-white uppercase">Fotografía Principal del Vehículo</h4>
                    <p className="text-[11px] text-[#eaddff]/60">Puedes ingresar la URL de una foto o subir un archivo desde tu equipo.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleMainImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-bold font-['JetBrains_Mono'] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto Local</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto-cupra.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value && !galleryImages.includes(e.target.value)) {
                        setGalleryImages((prev) => [e.target.value, ...prev]);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-[4px] bg-[#1a2430] border border-[#e09062]/20 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  />
                </div>

                {/* Main Preview Banner */}
                {imageUrl ? (
                  <div className="relative rounded-[6px] overflow-hidden aspect-video max-h-56 border border-[#e09062]/30 bg-black flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={name || 'CUPRA Modelo'}
                      className="w-full h-full object-cover"
                      onError={() => setErrorMessage('No se pudo cargar la imagen desde la URL proporcionada. Verifica el enlace.')}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[3px] bg-black/80 backdrop-blur-md text-[#e09062] text-[10px] font-['JetBrains_Mono'] uppercase font-bold">
                      Foto Principal Activa
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[6px] border border-dashed border-white/20 p-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-[#e09062]/50" />
                    <span>Sin foto principal asignada. Ingresa una URL o haz clic en "Subir Foto Local".</span>
                  </div>
                )}
              </div>

              {/* Multiple Gallery Images */}
              <div className="bg-[#060f18] p-4 rounded-[6px] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Outfit'] text-xs font-bold text-white uppercase tracking-wider">
                      Galería Fotográfica ({galleryImages.length} Fotos)
                    </h4>
                    <span className="text-[10px] text-[#eaddff]/50">Haz clic en una miniatura para fijarla como foto principal.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleGalleryImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-[3px] bg-[#1a2430] hover:border-[#e09062] border border-white/10 text-xs text-[#eaddff] font-['JetBrains_Mono'] flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#e09062]" />
                      <span>+ Agregar a Galería</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-[4px] overflow-hidden aspect-video border transition-all cursor-pointer ${
                        imageUrl === img ? 'border-[#e09062] ring-1 ring-[#e09062]' : 'border-white/10 hover:border-white/40'
                      }`}
                      onClick={() => setImageUrl(img)}
                    >
                      <img src={img} alt={`Galería ${idx}`} className="w-full h-full object-cover" />
                      {imageUrl === img && (
                        <div className="absolute top-1 left-1 bg-[#e09062] text-[#060f18] p-0.5 rounded-[2px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGalleryImage(idx);
                        }}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white p-1 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar de galería"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-full py-4 text-center text-zinc-500 text-xs">
                      No hay fotos adicionales en la galería. Sube imágenes para enriquecer la ficha del modelo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Rival & Argumentario */}
          {activeTab === 'competitor' && (
            <div className="space-y-4">
              <div className="bg-[#060f18] p-4 rounded-[6px] border border-white/5 space-y-3">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.15em] font-semibold block">
                  Competidor / Rival de Comparativa Directa
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">
                      Modelo Rival
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Audi Q3 Sportback 45 TFSI"
                      value={competitorModel}
                      onChange={(e) => setCompetitorModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">
                      Marca del Rival
                    </label>
                    <select
                      value={competitorBrand}
                      onChange={(e) => setCompetitorBrand(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                    >
                      <option value="Audi">Audi</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Alfa Romeo">Alfa Romeo</option>
                      <option value="Volvo">Volvo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">Potencia Rival (HP)</label>
                    <input
                      type="number"
                      value={competitorHp}
                      onChange={(e) => setCompetitorHp(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">0-100 Rival</label>
                    <input
                      type="text"
                      value={competitorZeroToHundred}
                      onChange={(e) => setCompetitorZeroToHundred(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#eaddff]/60 uppercase tracking-[0.1em] mb-1">Precio Rival (MXN)</label>
                    <input
                      type="number"
                      value={competitorPrice}
                      onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-['JetBrains_Mono'] text-[0.65rem] text-[#e09062] uppercase tracking-[0.1em] mb-1">
                    Argumento de Cierre Verbal para el Asesor
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe el argumento clave con el que el asesor comercial rebatirá las objeciones del cliente frente a esta marca rival..."
                    value={keyArgument}
                    onChange={(e) => setKeyArgument(e.target.value)}
                    className="w-full p-3 rounded-[4px] bg-[#1a2430] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e09062]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[4px] bg-[#1a2430] hover:bg-zinc-800 text-xs text-[#eaddff] font-semibold font-['JetBrains_Mono'] uppercase tracking-wider"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-[4px] bg-[#e09062] hover:bg-[#f0a072] text-[#060f18] text-xs font-black font-['JetBrains_Mono'] uppercase tracking-wider shadow-lg shadow-[#e09062]/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{initialVehicle ? 'Guardar Cambios' : 'Registrar Modelo en Gama'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
