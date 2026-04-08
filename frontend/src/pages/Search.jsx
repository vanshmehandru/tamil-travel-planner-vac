import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useSearchStore } from '../store/searchStore';
import { useBookingStore } from '../store/bookingStore';
import { travelAPI } from '../services/api';
import { ArrowLeft, Edit3, Train, Bus, Plane, Clock, Coffee, Wifi, MapPin } from 'lucide-react';

export function Search() {
  const navigate = useNavigate();
  const { source, destination, travelDate, passengers, travelType, setSearchParams, results, setResults, isLoading, setIsLoading } = useSearchStore();
  const { setBookingData } = useBookingStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Only fetch if we have both source and destination
    if (!source || !destination) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const queryParams = { source, destination, date: travelDate, type: travelType, passengers };
        const res = await travelAPI.searchTravel(queryParams);
        setResults(res.data.data || []);
      } catch (err) {
        console.error(err);
        // Fallback removed - no more phantom results
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [source, destination, travelDate, travelType, passengers, setResults, setIsLoading]);

  const handleBook = (option, cls) => {
    setBookingData({ selectedOption: option, travelClass: cls, currentStep: 1 });
    navigate(`/book/${option._id}`);
  };

  const travelModeTabs = [
    { id: 'all', label: 'அனைத்தும்', icon: MapPin },
    { id: 'train', label: 'ரயில்', icon: Train },
    { id: 'bus', label: 'பஸ்', icon: Bus },
    { id: 'flight', label: 'விமானம்', icon: Plane },
  ];

  const getIcon = (type) => {
    if (type === 'bus') return <Bus size={24} />;
    if (type === 'flight') return <Plane size={24} />;
    return <Train size={24} />;
  };

  const getBadgeColor = (avail) => {
    if (avail > 10) return 'bg-brand-green text-white';
    if (avail > 0) return 'bg-brand-amber text-white';
    return 'bg-brand-red text-white';
  };
  const getBadgeText = (avail) => {
    if (avail > 10) return 'இருக்கை உள்ளது';
    if (avail > 0) return `${avail} இருக்கைகள் மட்டுமே`;
    return 'நிரம்பியுள்ளது';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar />
      
      {/* Sticky Header with Mode Switcher */}
      <div className="sticky top-[64px] z-40 bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="font-bold text-lg text-brand-dark-text">
                {source || 'பயணத் திட்டம்'} 
                {source && destination && <span className="text-brand-muted-text mx-1">➔</span>} 
                {destination}
              </h1>
              <p className="text-sm text-brand-muted-text">
                {travelDate ? new Date(travelDate).toLocaleDateString('ta-IN') : 'தேதி இல்லை'} | {passengers} பயணி
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/home')} className="p-2 text-primary hover:bg-blue-50 rounded-full" title="மாற்றவும்">
            <Edit3 size={24} />
          </button>
        </div>

        {/* Horizontal Mode Tabs */}
        <div className="flex overflow-x-auto border-t bg-white scrollbar-hide px-4">
          <div className="flex space-x-2 mx-auto py-1">
            {travelModeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ travelType: tab.id })}
                className={`flex items-center space-x-2 px-6 py-3 border-b-4 transition-all whitespace-nowrap font-bold ${
                  travelType === tab.id 
                    ? 'border-primary text-primary bg-blue-50/50' 
                    : 'border-transparent text-brand-muted-text hover:text-primary hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 max-w-7xl">
        {/* Filter Sidebar Desktop */}
        <aside className="hidden md:block w-72 bg-white rounded-card shadow-card p-6 h-fit sticky top-[180px]">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">வடிகட்டிகள்</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3">பிற வசதிகள்</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                <span className="group-hover:text-primary transition-colors">AC மட்டும்</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                <span className="group-hover:text-primary transition-colors">உணவு வசதி</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                <span className="group-hover:text-primary transition-colors">WiFi Content</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
             <p className="text-xs text-brand-muted-text font-medium uppercase tracking-wider">வகைப்படுத்து</p>
             <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-brand-dark-text outline-none focus:border-primary">
                <option>விலை: குறைவானது முதல்</option>
                <option>நேரம்: அதிகாலை முதலில்</option>
             </select>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1 space-y-6">
          {!source || !destination ? (
            <div className="bg-white rounded-card p-12 text-center shadow-lg border-2 border-dashed border-gray-200">
               <MapPin size={64} className="mx-auto text-primary opacity-20 mb-6" />
               <h2 className="text-2xl font-bold text-brand-dark-text mb-2">எங்கிருந்து செல்ல வேண்டும்?</h2>
               <p className="text-brand-muted-text text-lg mb-8">தயவுசெய்து முகப்பு பக்கத்தில் இடங்களை தேர்வு செய்யவும்.</p>
               <button onClick={() => navigate('/home')} className="btn-primary rounded-full px-8 py-3">தேடத் தொடங்கவும்</button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid mb-4"></div>
              <p className="text-xl font-bold text-brand-muted-text">தேடுகிறோம்...</p>
            </div>
          ) : (results || []).length === 0 ? (
            <div className="bg-white rounded-card p-12 text-center shadow-sm">
              <MapPin size={64} className="mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-brand-dark-text mb-2">இந்த பாதையில் பயண வழிகள் இல்லை</h2>
              <p className="text-brand-muted-text text-lg">தயவுசெய்து தேதியை அல்லது ஊரை மாற்றி மீண்டும் தேடவும்.</p>
            </div>
          ) : (
            results.map((opt) => (
              <div key={opt._id} className="bg-white rounded-card shadow-card p-6 border border-transparent hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary">{getIcon(opt.type)}</div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-dark-text">
                        {opt.trainName || opt.busOperator || opt.airline || 'பயண வழி'}
                      </h2>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded font-medium text-brand-muted-text">
                        #{opt.trainNumber || opt.busNumber || opt.flightNumber}
                      </span>
                    </div>
                  </div>
                  {opt.foodService?.available && (
                    <div className="text-brand-orange flex items-center bg-orange-50 px-3 py-1 rounded-full">
                      <Coffee size={18} className="mr-2"/> 
                      <span className="text-sm font-bold">உணவு</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-brand-dark-text">{opt.departureTime}</p>
                    <p className="text-brand-muted-text font-medium mt-1">{opt.sourceName || source}</p>
                  </div>
                  <div className="flex-1 px-8 flex flex-col items-center">
                    <span className="text-sm font-semibold text-brand-muted-text mb-1 flex items-center"><Clock size={16} className="mr-1"/> {opt.duration}</span>
                    <div className="w-full relative flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                      <div className="absolute w-3 h-3 rounded-full bg-primary right-0"></div>
                      <div className="absolute w-3 h-3 rounded-full border-2 border-primary bg-white left-0"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-brand-dark-text">{opt.arrivalTime}</p>
                    <p className="text-brand-muted-text font-medium mt-1">{opt.destinationName || destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {opt.pricing?.map((cls, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-md transition bg-gray-50/50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xl font-bold text-primary">{cls.class}</span>
                        <span className="text-xl font-bold text-brand-dark-text">₹{cls.price}</span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full text-center font-bold mb-4 ${getBadgeColor(cls.availableSeats)}`}>
                        {getBadgeText(cls.availableSeats)}
                      </div>
                      <button 
                        disabled={cls.availableSeats === 0}
                        onClick={() => handleBook(opt, cls)}
                        className={`w-full py-2 rounded-btn font-bold text-lg transition ${cls.availableSeats === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700 shadow-md'}`}
                      >
                        {cls.availableSeats === 0 ? 'நிரம்பியது' : 'பதிவு செய்க'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
