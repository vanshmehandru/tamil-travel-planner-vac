import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { useSearchStore } from '../store/searchStore';
import { useAuthStore } from '../store/authStore';
import { nlpAPI } from '../services/api';
import { ArrowRightLeft, Train, Bus, Plane, Calendar, Users, Loader2 } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { source, destination, travelDate, passengers, travelType, setSearchParams } = useSearchStore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [nlpChip, setNlpChip] = useState('');

  const applyParsedResult = (parsed) => {
    if (!parsed) return;
    
    setSearchParams({
      source: parsed.source || source,
      destination: parsed.destination || destination,
      travelType: parsed.travelType || travelType,
      travelDate: parsed.date || travelDate,
      passengers: parsed.passengers || passengers,
    });

    const s = parsed.source || source;
    const d = parsed.destination || destination;
    
    if (s && d) {
       setNlpChip(`${s} ➔ ${d}${parsed.travelType ? `, ${parsed.travelType}` : ''}`);
    } else if (d) {
       setNlpChip(`சேருமிடம்: ${d}${parsed.travelType ? `, ${parsed.travelType}` : ''} (புறப்படும் ஊரை தேர்வு செய்யவும்)`);
    } else if (s) {
       setNlpChip(`புறப்படுமிடம்: ${s} (சேரும் ஊரை தேர்வு செய்யவும்)`);
    }
  };

  const handleTextSearch = async (text) => {
    if (!text.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await nlpAPI.parseText({ text });
      if (res.data.success) {
        applyParsedResult(res.data.parsed);
      }
    } catch (err) {
      console.error("AI Search Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (!source || !destination) {
      alert('தயவுசெய்து புறப்படும் மற்றும் சேரும் ஊரை குறிப்பிடவும்'); // Please specify source and destination
      return;
    }
    navigate('/search');
  };

  const travelTypes = [
    { id: 'train', icon: Train, label: 'ரயில்' },
    { id: 'bus', icon: Bus, label: 'பஸ்' },
    { id: 'flight', icon: Plane, label: 'விமானம்' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-brandLightBlue">
      <NavBar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-blue-800 pt-16 pb-32 px-6 text-center text-white relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 slide-in">எங்கு பயணிக்கிறீர்கள்?</h1>
        <p className="text-xl md:text-2xl opacity-90 slide-in delay-100">ரயில், பஸ் அல்லது விமானம் — நாங்கள் உதவுவோம்</p>
        
        {/* Voice Input Overlap */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-full max-w-2xl px-6">
          <div className="bg-white rounded-[24px] shadow-2xl p-4 flex flex-col items-center border-[6px] border-blue-900/10 transition-transform hover:scale-[1.02]">
            <div className="w-full flex justify-between items-center bg-white rounded-[16px] pl-6 pr-2 py-2 border-2 border-gray-100 focus-within:border-primary transition-colors">
              <input 
                type="text"
                placeholder="தேட கூறவும் அல்லது தட்டச்சு செய்யவும்..." 
                className="w-full bg-transparent border-none outline-none text-xl text-brand-dark-text placeholder:text-brand-muted-text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSearch(e.target.value);
                  }
                }}
              />
              {isAiLoading ? (
                <div className="w-14 h-14 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : (
                <VoiceInputButton onResult={(res) => applyParsedResult(res.parsed)} />
              )}
            </div>
            {nlpChip && (
              <div className="mt-4 flex flex-col items-center">
                <div className="bg-green-100 text-brandGreen px-4 py-2 rounded-full font-bold shadow-sm">
                  ✓ {nlpChip}
                </div>
                <button onClick={handleSearchSubmit} className="btn-primary mt-4 rounded-full px-8 shadow-lg">தேட தொடரவும்</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Travel Search Card */}
      <section className="px-6 mt-32 md:mt-24 max-w-4xl mx-auto">
        <div className="glassmorphism p-6 md:p-8 relative">
          
          {/* Quick Selector */}
          <div className="flex justify-center space-x-4 mb-8">
            {travelTypes.map(t => (
              <button
                key={t.id}
                onClick={() => setSearchParams({ travelType: t.id })}
                className={`flex-1 max-w-[120px] flex flex-col items-center p-4 rounded-xl border-2 transition-all ${travelType === t.id ? 'border-primary bg-blue-50 shadow-md transform -translate-y-1' : 'border-gray-200 bg-white hover:border-blue-300'}`}
              >
                <t.icon size={36} className={travelType === t.id ? 'text-primary' : 'text-gray-400'} />
                <span className={`mt-2 font-bold ${travelType === t.id ? 'text-primary' : 'text-brandMutedText'}`}>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
            <CityAutocomplete
              label="எங்கிருந்து"
              placeholder="புறப்படும் ஊர்"
              value={source}
              onChange={(val) => setSearchParams({ source: val })}
            />
            
            <button 
              className="bg-gray-100 p-4 rounded-full hover:bg-brandLightBlue text-primary transition-colors mx-auto rotate-90 md:rotate-0"
              onClick={() => setSearchParams({ source: destination, destination: source })}
            >
              <ArrowRightLeft size={24} />
            </button>
            
            <CityAutocomplete
              label="எங்கே"
              placeholder="சேரும் ஊர்"
              value={destination}
              onChange={(val) => setSearchParams({ destination: val })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
               <label className="block text-brandMutedText text-sm font-semibold mb-1">தேதி</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-4 text-gray-400" size={20} />
                 <input 
                   type="date" 
                   value={travelDate} 
                   onChange={(e) => setSearchParams({ travelDate: e.target.value })}
                   className="input-field pl-10" 
                 />
               </div>
            </div>
            <div>
               <label className="block text-brandMutedText text-sm font-semibold mb-1">பயணிகள்</label>
               <div className="flex items-center space-x-4 bg-white border border-gray-300 rounded-input h-[52px] px-4">
                 <Users className="text-gray-400" size={20} />
                 <button onClick={() => setSearchParams({ passengers: Math.max(1, passengers - 1)})} className="text-2xl text-primary font-bold px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">−</button>
                 <span className="text-xl font-bold w-8 text-center">{passengers}</span>
                 <button onClick={() => setSearchParams({ passengers: Math.min(6, passengers + 1)})} className="text-2xl text-primary font-bold px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">+</button>
               </div>
            </div>
          </div>

          <button onClick={handleSearchSubmit} className="btn-primary w-full text-xl py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform">
            சிறந்த வழிகளை காண்க
          </button>
        </div>
      </section>

      {isAuthenticated && (
        <section className="px-6 py-12 max-w-4xl mx-auto">
           <h2 className="text-brandDarkText text-2xl font-bold mb-6">சமீபத்திய தேடல்கள்</h2>
           <div className="flex overflow-x-auto space-x-4 pb-4 snap-x">
              {["சென்னை ➔ கோவை", "மதுரை ➔ திருச்சி", "திருநெல்வேலி ➔ பெங்களூர்"].map((search, i) => (
                 <button key={i} className="snap-start min-w-fit px-6 py-4 bg-white border border-blue-100 rounded-full shadow-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
                    {search}
                 </button>
              ))}
           </div>
        </section>
      )}

      <section className="px-6 pb-24 max-w-4xl mx-auto">
         <h2 className="text-brandDarkText text-2xl font-bold mb-6">இன்றைய சிறப்பு சலுகைகள்</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-card p-6 text-white shadow-lg relative overflow-hidden">
               <h3 className="text-2xl font-bold mb-2">pongal2026</h3>
               <p className="text-lg opacity-90">ரயில் டிக்கெட்டுகளில் 10% தள்ளுபடி</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-card p-6 text-white shadow-lg relative overflow-hidden">
               <h3 className="text-2xl font-bold mb-2">புதிய பயனர்</h3>
               <p className="text-lg opacity-90">முதல் பயணத்திற்கு ₹200 தள்ளுபடி</p>
            </div>
         </div>
      </section>
    </div>
  );
}
