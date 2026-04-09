import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { useSearchStore } from '../store/searchStore';
import { useAuthStore } from '../store/authStore';
import { nlpAPI } from '../services/api';
import { ArrowRightLeft, Train, Bus, Plane, Calendar, Users, MapPin, Compass, Palmtree, Coffee, Star, Loader2 } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { source, destination, travelDate, passengers, travelType, setSearchParams } = useSearchStore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [nlpChip, setNlpChip] = useState('');
  const applyParsedResult = (parsed) => {
    if (!parsed) return;
    
    // Debug log to help identify why Coimbatore vs Madurai or Dates might fail
    console.log('Applying parsed result to UI:', parsed);

    const s = parsed.source || source;
    const d = parsed.destination || destination;
    
    // Ensure numeric passengers
    const pCount = parsed.passengers ? parseInt(parsed.passengers) : passengers;
    const validPCount = Math.min(6, Math.max(1, pCount));

    // Prepare update object
    const updates = {
      source: s,
      destination: d,
      travelType: parsed.travelType || travelType,
      passengers: validPCount,
    };

    // ONLY update date if AI actually found one
    if (parsed.date && parsed.date.length >= 10) {
      updates.travelDate = parsed.date;
    }

    setSearchParams(updates);

    let chipText = '';
    if (s && d) chipText = `${s} ➔ ${d}`;
    else if (d) chipText = `சேருமிடம்: ${d}`;
    else if (s) chipText = `புறப்படுமிடம்: ${s}`;

    if (chipText) {
      if (parsed.date) chipText += ` | ${new Date(parsed.date).toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' })}`;
      if (parsed.passengers) chipText += ` | ${parsed.passengers} பயணிகள்`;
      setNlpChip(chipText);
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
      alert('தயவுசெய்து புறப்படும் மற்றும் சேரும் ஊரை குறிப்பிடவும்'); 
      return;
    }
    navigate('/search');
  };

  const travelTypes = [
    { id: 'train', icon: Train, label: 'ரயில்' },
    { id: 'bus', icon: Bus, label: 'பஸ்' },
    { id: 'flight', icon: Plane, label: 'விமானம்' },
  ];

  const destinations = [
    { name: 'சென்னை', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'தமிழ்நாட்டின் தலைநகரம்' },
    { name: 'மதுரை', image: 'https://plus.unsplash.com/premium_photo-1689838027426-bf5cc3a0131f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', description: 'தூங்கா நகரம்' },
    { name: 'ஊட்டி', image: 'https://plus.unsplash.com/premium_photo-1710631508459-301f144061c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', description: 'மலைகளின் ராணி' },
    { name: 'கன்னியாகுமரி', image: 'https://plus.unsplash.com/premium_photo-1769871817044-a95266c650ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', description: 'முக்கடல் சங்கமம்' },
  ];

  const categories = [
    { name: 'ஆன்மீகம்', icon: Star, color: 'bg-orange-100 text-orange-600' },
    { name: 'இயற்கை', icon: Palmtree, color: 'bg-green-100 text-green-600' },
    { name: 'உணவு', icon: Coffee, color: 'bg-red-100 text-red-600' },
    { name: 'பயணம்', icon: Compass, color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-transparent font-sans">
      <NavBar />

      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex flex-col items-center justify-center pt-16 pb-32 px-6 text-center text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590050752117-238cb12be0fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Tamil Nadu Travel" 
            className="w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-3xl flex flex-col items-center mt-[-60px]">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in drop-shadow-lg tracking-tight">எங்கு பயணிக்கிறீர்கள்?</h1>
          <p className="text-xl md:text-2xl opacity-95 animate-slide-up delay-100 drop-shadow-md font-medium">பிரம்மாண்டமான உலகத்தை ஆராயுங்கள். நாங்கள் வழிகாட்டுகிறோம்.</p>
          
          {/* Voice Input Card */}
          <div className="w-full max-w-2xl px-6 mt-12 animate-slide-up delay-200">
            <div className="glassmorphism-dark rounded-full p-2 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transition-transform hover:scale-[1.01]">
              <div className="w-full flex justify-between items-center bg-white/10 rounded-full pl-6 pr-2 py-2 focus-within:bg-white/20 transition-all border border-transparent focus-within:border-blue-400/50">
                <input 
                  type="text"
                  placeholder="தேட கூறவும் அல்லது தட்டச்சு செய்யவும்..." 
                  className="w-full bg-transparent border-none outline-none text-xl text-white placeholder:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTextSearch(e.target.value);
                    }
                  }}
                />
                {isAiLoading ? (
                  <div className="w-14 h-14 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={28} />
                  </div>
                ) : (
                  <VoiceInputButton onResult={(res) => applyParsedResult(res.parsed || res)} />
                )}
              </div>
              {nlpChip && (
                <div className="mt-4 flex flex-col items-center pb-3">
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-5 py-2 rounded-full font-bold shadow-sm backdrop-blur-md">
                    ✓ {nlpChip}
                  </div>
                  <button onClick={handleSearchSubmit} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-8 rounded-full mt-4 hover:shadow-lg transition-transform hover:-translate-y-[1px]">தேட தொடரவும்</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Search Card */}
      <section className="px-4 md:px-6 relative z-20 max-w-5xl mx-auto -mt-24 md:-mt-32">
        <div className="glassmorphism rounded-card p-6 md:p-8 animate-slide-up delay-300">
          {/* Quick Selector */}
          <div className="flex justify-center space-x-3 mb-8">
            {travelTypes.map(t => (
              <button
                key={t.id}
                onClick={() => setSearchParams({ travelType: t.id })}
                className={`flex-1 max-w-[140px] flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${travelType === t.id ? 'border-2 border-blue-600 bg-white/80 shadow-md transform -translate-y-1' : 'border border-white/40 glassmorphism hover:border-blue-300 hover:bg-white/80'}`}
              >
                <div className={`p-3 rounded-full mb-3 ${travelType === t.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                   <t.icon size={24} />
                </div>
                <span className={`font-bold text-sm ${travelType === t.id ? 'text-blue-800' : 'text-slate-600'}`}>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6 relative">
            <CityAutocomplete
              label="எங்கிருந்து"
              placeholder="புறப்படும் ஊர்"
              value={source}
              onChange={(val) => setSearchParams({ source: val })}
              travelType={travelType}
            />
            
            <button 
              className="bg-slate-100 p-4 rounded-full hover:bg-blue-100 hover:text-blue-700 text-slate-500 transition-all mx-auto rotate-90 md:rotate-0 shadow-sm border border-slate-200 hover:shadow-md z-10 md:my-0 my-[-10px]"
              onClick={() => setSearchParams({ source: destination, destination: source })}
            >
              <ArrowRightLeft size={20} />
            </button>
            
            <CityAutocomplete
              label="எங்கே"
              placeholder="சேரும் ஊர்"
              value={destination}
              onChange={(val) => setSearchParams({ destination: val })}
              travelType={travelType}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
               <label className="block text-slate-600 text-sm font-bold mb-2">பயண தேதி</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                 <input 
                   type="date" 
                   value={travelDate} 
                   onChange={(e) => setSearchParams({ travelDate: e.target.value })}
                   className="input-field pl-12 bg-white/40 focus:bg-white/70 text-lg font-medium" 
                 />
               </div>
            </div>
            <div>
               <label className="block text-slate-600 text-sm font-bold mb-2">பயணிகள்</label>
               <div className="flex items-center justify-between space-x-4 glassmorphism border border-white/60 rounded-input h-[52px] px-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white/70 transition-all">
                 <div className="flex items-center">
                    <Users className="text-slate-400 mr-2" size={20} />
                    <span className="text-slate-700 font-medium">பயணிகள் எண்ணிக்கை</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <button onClick={() => setSearchParams({ passengers: Math.max(1, passengers - 1)})} className="w-8 h-8 flex items-center justify-center text-xl text-blue-700 font-bold bg-white shadow-sm border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">−</button>
                   <span className="text-xl font-bold w-6 text-center text-slate-800">{passengers}</span>
                   <button onClick={() => setSearchParams({ passengers: Math.min(6, passengers + 1)})} className="w-8 h-8 flex items-center justify-center text-xl text-blue-700 font-bold bg-white shadow-sm border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">+</button>
                 </div>
               </div>
            </div>
          </div>

          <button onClick={handleSearchSubmit} className="btn-primary w-full text-xl py-4 shadow-[0_8px_20px_rgba(29,78,216,0.3)] hover:shadow-[0_12px_25px_rgba(29,78,216,0.4)]">
            சிறந்த வழிகளை காண்க
          </button>
        </div>
      </section>

      {/* Travel Categories */}
      <section className="px-6 mt-16 mb-8 max-w-6xl mx-auto">
         <h2 className="text-3xl font-extrabold mb-8 text-slate-800 text-center">பயண வகைகள்</h2>
         <div className="flex flex-wrapjustify-center gap-6 md:gap-10">
            <div className="flex overflow-x-auto md:justify-center space-x-6 pb-4 w-full px-2">
                {categories.map((cat, i) => (
                <div key={i} className="flex flex-col items-center cursor-pointer group min-w-[90px]">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${cat.color} mb-3 group-hover:scale-110 shadow-sm group-hover:shadow-lg transition-all duration-300 border-2 border-transparent group-hover:border-current`}>
                        <cat.icon size={36} />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{cat.name}</span>
                </div>
                ))}
            </div>
         </div>
      </section>

      {/* Popular Destinations Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
         <div className="flex justify-between items-end mb-8">
             <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">பிரபலமான இடங்கள்</h2>
             <button className="text-blue-600 font-bold hover:text-blue-800 hidden md:block">அனைத்தையும் காண்க →</button>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, i) => (
                <div key={i} className="card p-0 overflow-hidden group cursor-pointer border-none shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-hover">
                   <div className="relative h-64 overflow-hidden">
                       <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                       <div className="absolute bottom-0 left-0 p-6 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                           <h3 className="text-2xl font-bold text-white mb-1 flex items-center shadow-sm">
                              <MapPin size={20} className="mr-2 text-blue-400" />
                              {dest.name}
                           </h3>
                           <p className="text-slate-300 font-medium text-sm drop-shadow-md">{dest.description}</p>
                       </div>
                   </div>
                </div>
            ))}
         </div>
      </section>

      {/* Special Offers Section */}
      <section className="px-6 pb-24 max-w-6xl mx-auto mt-12">
         <h2 className="text-3xl font-extrabold text-slate-800 mb-8">இன்றைய சிறப்பு சலுகைகள்</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[24px] overflow-hidden text-white shadow-lg relative h-56 group cursor-pointer">
               <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Discount" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/80"></div>
               <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                   <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider">Festival Offer</span>
                   <h3 className="text-4xl font-extrabold mb-2 tracking-wide font-sans">pongal2026</h3>
                   <p className="text-lg opacity-95 font-medium">ரயில் டிக்கெட்டுகளில் 10% தள்ளுபடி</p>
               </div>
            </div>
            
            <div className="rounded-[24px] overflow-hidden text-white shadow-lg relative h-56 group cursor-pointer">
               <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Flight" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-green-800/80"></div>
               <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                   <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider">New User</span>
                   <h3 className="text-4xl font-extrabold mb-2 font-sans">முதல் பயணம்</h3>
                   <p className="text-lg opacity-95 font-medium">பயண முன்பதிவில் ₹200 தள்ளுபடி</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
