import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useBookingStore } from '../store/bookingStore';
import { useSearchStore } from '../store/searchStore';
import { bookingAPI } from '../services/api';
import { ArrowLeft, UserPlus, CheckCircle2, ShieldCheck, Wallet, Loader2, Trash2 } from 'lucide-react';

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

  const calculateTotal = () => {
    const base = travelClass.price * passengers.length;
    const tax = Math.round(base * 0.05);
    const luggageKg = parseInt(luggageAllowance) || 0;
    const includedLuggage = selectedOption.luggageAllowance || 15;
    const extraLuggageCharge = luggageKg > includedLuggage ? (luggageKg - includedLuggage) * 50 : 0;
    
    return base + tax + (30 * passengers.length) + extraLuggageCharge;
  };

  const handleSubmit = async () => {
    // Frontend Validation
    if (!travelDate) {
      alert('தயவுசெய்து பயணத் தேதியைத் தேர்ந்தெடுக்கவும்.');
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name || !passengers[i].age) {
        alert(`பயணி ${i + 1}-ன் பெயர் மற்றும் வயதை நிரப்பவும்.`);
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
          gender: p.gender === 'ஆண்' ? 'male' : p.gender === 'பெண்' ? 'female' : 'other',
          idType: p.idType === 'ஆதார்' ? 'aadhaar' : p.idType === 'PAN' ? 'pan' : 'voter_id',
          idNumber: p.idNumber
        })),
        foodPreference: foodPreference === 'சைவம்' ? 'veg' : foodPreference === 'அசைவம்' ? 'non-veg' : 'no_food',
        luggageAllowance: parseInt(luggageAllowance) || 15,
        paymentMethod: paymentMethod, // Selected from UI
      };

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
                      <input type="number" value={p.age} onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)} className="input-field" placeholder="வயது"/>
                    </div>
                    <div>
                      <label className="block text-brandMutedText text-sm mb-1 font-semibold">பாலினம்</label>
                      <select value={p.gender} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)} className="input-field">
                        <option>ஆண்</option><option>பெண்</option><option>மற்றவை</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brandMutedText text-sm mb-1 font-semibold">அடையாள அட்டை</label>
                    <select value={p.idType} onChange={(e) => handlePassengerChange(idx, 'idType', e.target.value)} className="input-field">
                      <option>ஆதார்</option><option>PAN</option><option>வாக்காளர் அட்டை</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-brandMutedText text-sm mb-1 font-semibold">அடையாள எண்</label>
                    <input type="text" value={p.idNumber} onChange={(e) => handlePassengerChange(idx, 'idNumber', e.target.value)} className="input-field" placeholder="எண்"/>
                  </div>
                </div>
              </div>
            ))}
            
            {passengers.length < 6 && (
              <button onClick={addPassenger} className="w-full border-2 border-dashed border-primary text-primary hover:bg-blue-50 py-4 rounded-card font-bold flex items-center justify-center transition">
                <UserPlus className="mr-2" /> இன்னொரு பயணி சேர்க்க
              </button>
            )}

            <button onClick={() => setStep(2)} className="btn-primary w-full text-xl py-4 mt-8 shadow-lg">தொடர்க</button>
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
              <p className="text-lg font-bold mb-1">{source} ➔ {destination}</p>
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
