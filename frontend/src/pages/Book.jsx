import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useBookingStore } from '../store/bookingStore';
import { useSearchStore } from '../store/searchStore';
import { bookingAPI } from '../services/api';
import { ArrowLeft, UserPlus, CheckCircle2, ShieldCheck, Wallet, Loader2, Trash2 } from 'lucide-react';

const TAMIL_CITY_NAMES = {
  'MAS': 'சென்னை', 'MAA': 'சென்னை',
  'DLI': 'டெல்லி', 'DEL': 'டெல்லி', 'NDLS': 'டெல்லி',
  'SBC': 'பெங்களூர்', 'BLR': 'பெங்களூர்',
  'BOM': 'மும்பை', 'CSMT': 'மும்பை',
  'MDU': 'மதுரை', 'IXM': 'மதுரை',
  'CBE': 'கோவை', 'CJB': 'கோவை',
  'TPJ': 'திருச்சி', 'TRZ': 'திருச்சி',
  'HYB': 'ஹைதராபாத்', 'HYD': 'ஹைதராபாத்',
  'HWH': 'கொல்கத்தா', 'CCU': 'கொல்கத்தா',
  'SA': 'சேலம்', 'VLR': 'வேலூர்',
  'TEN': 'திருநெல்வேலி', 'NCJ': 'நாகர்கோவில்',
  'TJ': 'தஞ்சாவூர்', 'ED': 'ஈரோடு',
  'TUT': 'தூத்துக்குடி', 'KMU': 'கும்பகோணம்',
  'PGT': 'பாளையங்கோட்டை', 'VM': 'விழுப்புரம்',
  'CDL': 'கடலூர்', 'UAM': 'ஓட்டி', 'PDY': 'புதுச்சேரி',
};

export function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { source, destination, travelDate } = useSearchStore();
  const { selectedOption, travelClass, passengers, foodPreference, luggageAllowance, currentStep, setStep, setBookingData, resetBooking } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setLocalPaymentMethod] = useState('upi');

  useEffect(() => {
    if (!selectedOption) {
      navigate('/search');
    }
  }, [selectedOption, navigate]);

  if (!selectedOption) return null;

  const handlePassengerChange = (index, field, value) => {
    const newPass = [...passengers];
    
    // Clear ID number if type changes
    if (field === 'idType' && newPass[index][field] !== value) {
      newPass[index]['idNumber'] = '';
    }
    
    newPass[index][field] = value;
    setBookingData({ passengers: newPass });
  };

  const addPassenger = () => {
    if (passengers.length < 6) {
      setBookingData({ passengers: [...passengers, { id: passengers.length + 1, name: '', age: '', gender: 'ஆண்', idType: 'ஆதார்', idNumber: '', seat: '' }] });
    }
  };

  const removePassenger = (index) => {
    const newPass = passengers.filter((_, i) => i !== index);
    setBookingData({ passengers: newPass });
  };

  const getIDConfig = (type) => {
    switch (type) {
      case 'ஆதார்': return { maxLength: 14, placeholder: '1234 5678 9012', label: '12-இலக்க ஆதார் எண்' };
      case 'நிரந்தரக் கணக்கு எண்': return { maxLength: 10, placeholder: 'ABCDE1234F', label: '10-இலக்க PAN எண்' };
      case 'கடவுச்சீட்டு': return { maxLength: 8, placeholder: 'A1234567', label: '8-இலக்க Passport எண்' };
      case 'வாக்காளர் அட்டை': return { maxLength: 10, placeholder: 'ABC1234567', label: '10-இலக்க Voter ID' };
      default: return { maxLength: 20, placeholder: 'எண்', label: 'அடையாள எண்' };
    }
  };

  const formatIDNumber = (type, val) => {
    let cleanVal = val.replace(/\s/g, '');
    if (type === 'ஆதார்') {
      cleanVal = cleanVal.replace(/\D/g, '').substring(0, 12);
      const parts = cleanVal.match(/.{1,4}/g) || [];
      return parts.join(' ');
    }
    if (type === 'நிரந்தரக் கணக்கு எண்') {
      return cleanVal.substring(0, 10).toUpperCase();
    }
    if (type === 'கடவுச்சீட்டு') {
      return cleanVal.substring(0, 8).toUpperCase();
    }
    if (type === 'வாக்காளர் அட்டை') {
      return cleanVal.substring(0, 10).toUpperCase();
    }
    return val;
  };

  const validateStep1 = () => {
    if (!travelDate) {
      alert('தயவுசெய்து பயணத் தேதியைத் தேர்ந்தெடுக்கவும்.');
      return false;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.age) {
        alert(`பயணி ${i + 1}-ன் பெயர் மற்றும் வயதை நிரப்பவும்.`);
        return false;
      }
      if (p.age && parseInt(p.age) > 122) {
        alert(`பயணி ${i + 1}-ன் வயது 122-க்கு மேல் இருக்கக்கூடாது.`);
        return false;
      }
      
      const cleanId = p.idNumber.replace(/\s/g, '');
      if (p.idType === 'ஆதார்' && cleanId.length !== 12) {
        alert(`பயணி ${i + 1}-க்கு சரியான 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்.`);
        return false;
      }
      if (p.idType === 'நிரந்தரக் கணக்கு எண்' && cleanId.length !== 10) {
        alert(`பயணி ${i + 1}-க்கு சரியான 10 இலக்க PAN எண்ணை உள்ளிடவும்.`);
        return false;
      }
      if (p.idType === 'கடவுச்சீட்டு' && cleanId.length !== 8) {
        alert(`பயணி ${i + 1}-க்கு சரியான 8 இலக்க Passport எண்ணை உள்ளிடவும்.`);
        return false;
      }
      if (p.idType === 'வாக்காளர் அட்டை' && cleanId.length !== 10) {
        alert(`பயணி ${i + 1}-க்கு சரியான 10 இலக்க Voter ID-ஐ உள்ளிடவும்.`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const calculateTotal = () => {
    const base = travelClass.price * passengers.length;
    const tax = Math.round(base * 0.05);
    const luggageKg = parseInt(luggageAllowance) || 0;
    const includedLuggage = selectedOption.luggageAllowance || 15;
    const extraLuggageCharge = luggageKg > includedLuggage ? (luggageKg - includedLuggage) * 50 : 0;
    
    return base + tax + (30 * passengers.length) + extraLuggageCharge;
  };

  const handleSubmit = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(travelDate);
    if (selectedDate < today) {
      alert('கடந்த தேதிகளுக்கு முன்பதிவு செய்ய முடியாது (Cannot book for past dates).');
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.age) {
        alert(`பயணி ${i + 1}-ன் பெயர் மற்றும் வயதை நிரப்பவும்.`);
        return;
      }
      if (parseInt(p.age) > 122) {
        alert(`பயணி ${i + 1}-ன் வயது 122-க்கு மேல் இருக்கக்கூடாது.`);
        return;
      }
      
      // ID Validation
      const cleanId = p.idNumber.replace(/\s/g, '');
      if (p.idType === 'ஆதார்' && !/^\d{12}$/.test(cleanId)) {
        alert(`பயணி ${i + 1}-க்கு சரியான 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்.`);
        return;
      }
      if (p.idType === 'நிரந்தரக் கணக்கு எண்' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(p.idNumber.toUpperCase())) {
        alert(`பயணி ${i + 1}-க்கு சரியான 10 இலக்க நிரந்தரக் கணக்கு எண் (PAN) உள்ளிடவும்.`);
        return;
      }
      if (p.idType === 'கடவுச்சீட்டு' && !/^[A-Z0-9]{8}$/.test(p.idNumber.toUpperCase())) {
        alert(`பயணி ${i + 1}-க்கு சரியான 8 இலக்க கடவுச்சீட்டு (Passport) எண்ணை உள்ளிடவும்.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        travelOptionId: selectedOption._id,
        travelClass: travelClass.class,
        travelDate: travelDate,
        passengers: passengers.map(p => ({
          name: p.name.trim(),
          age: parseInt(p.age),
          gender: (p.gender || '').trim() === 'ஆண்' ? 'male' : (p.gender || '').trim() === 'பெண்' ? 'female' : 'transgender',
          idType: p.idType === 'ஆதார்' ? 'aadhaar' : p.idType === 'நிரந்தரக் கணக்கு எண்' ? 'pan' : p.idType === 'கடவுச்சீட்டு' ? 'passport' : 'voter_id',
          idNumber: p.idNumber.replace(/\s/g, '')
        })),
        foodPreference: foodPreference === 'சைவம்' ? 'veg' : foodPreference === 'அசைவம்' ? 'non-veg' : 'no_food',
        luggageAllowance: parseInt(luggageAllowance) || 15,
        paymentMethod: paymentMethod, // Selected from UI
        // Include full travel info for AI-generated options
        source: selectedOption.source,
        sourceName: selectedOption.sourceName || selectedOption.source,
        destination: selectedOption.destination,
        destinationName: selectedOption.destinationName || selectedOption.destination,
        travelType: selectedOption.type,
        departureTime: selectedOption.departureTime,
        arrivalTime: selectedOption.arrivalTime,
        duration: selectedOption.duration,
        travelClassPrice: travelClass.price,
      };

      console.log("Submitting Booking Payload:", payload);
      const res = await bookingAPI.createBooking(payload);
      resetBooking();
      const ticketId = res.data?.booking?.ticketId || res.data?.ticketId;
      navigate(`/ticket/${ticketId}`);
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      
      if (err.response?.data?.errors) {
        const errorMsgs = err.response.data.errors.map(e => e.message).join('\n');
        alert(`பதிவில் பிழை:\n${errorMsgs}`);
      } else {
        alert(err.response?.data?.message || 'பதிவில் பிழை ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <NavBar />
      
      <div className="glassmorphism sticky top-[64px] z-30 shadow-sm border-b-0 rounded-none rounded-b-xl border-x-0 border-t-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center mb-2">
          <button onClick={() => currentStep > 1 ? setStep(currentStep - 1) : navigate(-1)} className="p-2 mr-4 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-bold text-brandDarkText">பயணப் பதிவு</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto px-8 pb-4">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{width: `${(currentStep-1)*50}%`}}></div>
            
            {[1, 2, 3].map((stepText, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {currentStep > index + 1 ? <CheckCircle2 size={18} /> : index + 1}
                </div>
                <span className={`text-[12px] font-bold mt-2 ${currentStep >= index + 1 ? 'text-primary' : 'text-gray-400'}`}>
                  {index === 0 ? 'பயணிகள்' : index === 1 ? 'தேர்வுகள்' : 'உறுதி செய்'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <div className="space-y-6 slide-in">
            {passengers.map((p, idx) => (
              <div key={idx} className="glassmorphism rounded-card shadow-sm p-6 relative border border-white/40">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <h3 className="font-bold text-lg text-primary">பயணி {idx + 1}</h3>
                  {idx > 0 && (
                    <button 
                      onClick={() => removePassenger(idx)} 
                      className="flex items-center text-brandRed hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors duration-200"
                      title="பயணியை நீக்கு"
                    >
                      <Trash2 size={16} className="mr-1.5" />
                      <span className="text-sm font-bold">நீக்கு</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-brandMutedText text-sm mb-1 font-semibold">பெயர்</label>
                    <input type="text" value={p.name} onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)} className="input-field" placeholder="பயணியின் பெயர்"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brandMutedText text-sm mb-1 font-semibold">வயது</label>
                      <input 
                        type="number" 
                        value={p.age} 
                        onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)} 
                        min="1" 
                        max="122" 
                        className={`input-field ${p.age && parseInt(p.age) > 122 ? 'border-brandRed bg-red-50' : ''}`} 
                        placeholder="வயது"
                      />
                      {p.age && parseInt(p.age) > 122 && (
                        <p className="text-[10px] text-brandRed font-bold mt-1">வயது 122-க்கு மேல் இருக்கக்கூடாது</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-brandMutedText text-sm mb-1 font-semibold">பாலினம்</label>
                      <select value={p.gender} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)} className="input-field">
                        <option>ஆண்</option>
                        <option>பெண்</option>
                        <option>திருநங்கை / திருநம்பி</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brandMutedText text-sm mb-1 font-semibold">அடையாள அட்டை</label>
                    <select value={p.idType} onChange={(e) => handlePassengerChange(idx, 'idType', e.target.value)} className="input-field">
                      <option>ஆதார்</option>
                      <option>நிரந்தரக் கணக்கு எண்</option>
                      <option>கடவுச்சீட்டு</option>
                      <option>வாக்காளர் அட்டை</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-brandMutedText text-sm mb-1 font-semibold">அடையாள எண்</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={p.idNumber} 
                        maxLength={getIDConfig(p.idType).maxLength}
                        onChange={(e) => handlePassengerChange(idx, 'idNumber', formatIDNumber(p.idType, e.target.value))} 
                        className="input-field" 
                        placeholder={getIDConfig(p.idType).placeholder}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white/80 px-1 rounded">
                        {p.idNumber.replace(/\s/g, '').length} / {p.idType === 'ஆதார்' ? 12 : p.idType === 'நிரந்தரக் கணக்கு எண்' ? 10 : p.idType === 'கடவுச்சீட்டு' ? 8 : 10}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 ml-1">{getIDConfig(p.idType).label}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {passengers.length < 6 && (
              <button onClick={addPassenger} className="w-full border-2 border-dashed border-primary text-primary hover:bg-blue-50 py-4 rounded-card font-bold flex items-center justify-center transition">
                <UserPlus className="mr-2" /> இன்னொரு பயணி சேர்க்க
              </button>
            )}

            <button onClick={handleNextStep} className="btn-primary w-full text-xl py-4 mt-8 shadow-lg transition-all hover:scale-[1.01]">தொடர்க</button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 slide-in">
             <div className="glassmorphism p-6 rounded-card shadow-sm border border-white/40">
               <h3 className="text-xl font-bold text-brandDarkText mb-6">உணவு விருப்பம்</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {['சைவம்', 'அசைவம்', 'உணவு வேண்டாம்'].map(opt => (
                   <button key={opt} onClick={() => setBookingData({foodPreference: opt})} className={`p-4 rounded-xl border-2 transition font-bold text-lg flex items-center justify-center ${foodPreference === opt ? 'border-primary bg-blue-50 text-primary shrink-0' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                     {opt}
                   </button>
                 ))}
               </div>
             </div>

             <div className="glassmorphism p-6 rounded-card shadow-sm border border-white/40">
               <h3 className="text-xl font-bold text-brandDarkText mb-6">சாமான்கள் அளவு</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {['7 கிலோ', '15 கிலோ', '25 கிலோ'].map(opt => (
                   <button key={opt} onClick={() => setBookingData({luggageAllowance: opt})} className={`p-4 rounded-xl border-2 transition flex flex-col items-center justify-center ${luggageAllowance === opt ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500'}`}>
                     <span className="font-bold text-xl">{opt}</span>
                     <span className="text-sm mt-1">{opt === '25 கிலோ' ? '₹500 கட்டணம்' : 'இலவசம்'}</span>
                   </button>
                 ))}
               </div>
             </div>

             <div className="flex space-x-4 mt-8">
               <button onClick={() => setStep(3)} className="btn-primary w-full text-xl py-4 shadow-lg shrink-0">கட்டணம் அமைப்புகளுக்குச் செல்</button>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 slide-in">
            <div className="glassmorphism rounded-card shadow-sm p-6 border border-white/40">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center"><ShieldCheck className="mr-2"/> பயண சுருக்கம்</h3>
              <p className="text-lg font-bold mb-1">{TAMIL_CITY_NAMES[source] || source} ➔ {TAMIL_CITY_NAMES[destination] || destination}</p>
              <p className="text-brandMutedText font-semibold mb-4">{travelDate} | {selectedOption.name} ({selectedOption.type})</p>
              
              <div className="border-t pt-4 mt-4">
                <p className="font-semibold text-brandDarkText mb-2">பயணிகள் ({passengers.length}):</p>
                {passengers.map((p, i) => <p key={i} className="text-brandMutedText mb-1">• {p.name || `பயணி ${i+1}`} ({p.age})</p>)}
              </div>
            </div>

            <div className="glassmorphism rounded-card shadow-sm p-6 border border-white/40">
              <h3 className="text-xl font-bold mb-4">கட்டண விவரம்</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between font-medium"><span className="text-brandMutedText">அடிப்படை கட்டணம் ({passengers.length} x ₹{travelClass.price})</span><span>₹{travelClass.price * passengers.length}</span></div>
                <div className="flex justify-between font-medium"><span className="text-brandMutedText">வரி (5%)</span><span>₹{Math.round(travelClass.price * passengers.length * 0.05)}</span></div>
                <div className="flex justify-between font-medium"><span className="text-brandMutedText">சேவை கட்டணம்</span><span>₹30</span></div>
                {luggageAllowance === '25 கிலோ' && <div className="flex justify-between font-medium"><span className="text-brandMutedText">கூடுதல் சாமான் (25கி)</span><span>₹500</span></div>}
              </div>
              <div className="border-t pt-4 flex justify-between items-center text-xl font-bold text-primary">
                <span>மொத்தம்</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>

            <div className="glassmorphism rounded-card shadow-sm p-6 border border-white/40">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center"><Wallet className="mr-2"/> கட்டண முறை</h3>
                <span className="text-[12px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">மாதிரி முறை (இலவசம்)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'upi', label: 'UPI' },
                  { id: 'card', label: 'கார்டு' },
                  { id: 'netbanking', label: 'நெட் பேங்கிங்' },
                  { id: 'wallet', label: 'வாலட்' }
                ].map(opt => (
                   <button 
                     key={opt.id} 
                     onClick={() => setLocalPaymentMethod(opt.id)}
                     className={`p-4 rounded-xl border-2 font-bold text-center transition ${paymentMethod === opt.id ? 'border-primary bg-blue-50 text-primary scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                   >
                     {opt.label}
                   </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full text-xl py-5 shadow-lg mt-8 flex items-center justify-center">
              {isSubmitting ? <><Loader2 className="animate-spin mr-2"/> உங்கள் பயணம் பதிவாகிறது...</> : 'பயணம் உறுதி செய்க'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
