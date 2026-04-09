import { useState, useEffect } from 'react';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../store/authStore';
import { authAPI, bookingAPI, ticketAPI } from '../services/api';
import { User, Package, Bookmark, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [savedTickets, setSavedTickets] = useState([]);

  const location = window.location; // Fallback if useLocation not imported yet, but I'll add the import

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tab = query.get('tab');
    if (tab && ['profile', 'bookings', 'tickets', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [window.location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'bookings') {
          const res = await bookingAPI.getMyBookings();
          setBookings(res.data.data || res.data || []);
        } else if (activeTab === 'tickets') {
           const res = await ticketAPI.getMyTickets();
           setSavedTickets(res.data.data || res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('இந்த பயணத்தை ரத்து செய்ய விரும்புகிறீர்களா? (Are you sure you want to cancel?)')) return;
    
    try {
      await bookingAPI.cancelBooking(bookingId);
      alert('பயணம் ரத்து செய்யப்பட்டது! (Journey cancelled!)');
      // Refresh current tab data
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      alert('ரத்து செய்வதில் பிழை: ' + (err.response?.data?.message || err.message));
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'சுயவிவரம்' },
    { id: 'bookings', icon: Package, label: 'என் பயணங்கள்' },
    { id: 'tickets', icon: Bookmark, label: 'சேமித்த டிக்கெட்கள்' },
    { id: 'settings', icon: Settings, label: 'அமைப்புகள்' },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0">
      <NavBar />
      
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <aside className="w-full md:w-72 glassmorphism rounded-card shadow-sm border-white/40 overflow-hidden shrink-0 h-fit">
          <div className="p-6 bg-brandLightBlue flex items-center space-x-4">
             <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
               {user?.username?.charAt(0) || 'ந'}
             </div>
             <div>
               <h2 className="font-bold text-lg text-brandDarkText">{user?.username || 'பயனர்'}</h2>
               <p className="text-sm text-brandMutedText">{user?.email}</p>
             </div>
          </div>
          <div className="flex flex-col py-2">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 font-semibold transition ${activeTab === tab.id ? 'bg-blue-50 text-primary border-r-4 border-primary' : 'text-brandMutedText hover:bg-gray-50'}`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="flex items-center space-x-3 px-6 py-4 font-semibold text-brandRed hover:bg-red-50 transition border-t mt-2">
               <LogOut size={20} />
               <span>வெளியேறு</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glassmorphism p-6 rounded-card shadow-sm border border-white/40 slide-in">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-brandDarkText">சுயவிவரம்</h2>
                <button className="text-primary font-bold hover:underline">திருத்து</button>
              </div>
              <div className="space-y-4 max-w-md">
                <div><label className="text-sm text-brandMutedText font-semibold">பெயர்</label><p className="font-bold text-lg">{user?.username || '-'}</p></div>
                <div><label className="text-sm text-brandMutedText font-semibold">மின்னஞ்சல்</label><p className="font-bold text-lg">{user?.email || '-'}</p></div>
                <div><label className="text-sm text-brandMutedText font-semibold">வயது</label><p className="font-bold text-lg">{user?.age || '-'}</p></div>
                <div><label className="text-sm text-brandMutedText font-semibold">பாலினம்</label><p className="font-bold text-lg">{user?.gender || '-'}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="slide-in">
               <h2 className="text-2xl font-bold text-brandDarkText mb-6">என் பயணங்கள்</h2>
               <div className="space-y-4">
                 {bookings.length > 0 ? bookings.map((b) => (
                   <div key={b._id} className="glassmorphism p-6 rounded-card shadow-sm border border-white/40 flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                         <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold leading-none ${b.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                               {b.bookingStatus === 'cancelled' ? 'ரத்து செய்யப்பட்டது' : 'உறுதி செய்யப்பட்டது'}
                            </span>
                            <span className="text-brandMutedText text-sm font-semibold">
                              {new Date(b.travelDate).toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                         </div>
                         <h3 className="font-bold text-lg">{b.sourceName} ➔ {b.destinationName}</h3>
                         <p className="text-brandMutedText font-semibold mt-1">₹{b.totalAmount} | {b.travelType === 'train' ? 'ரயில்' : b.travelType === 'bus' ? 'பஸ்' : 'விமானம்'}</p>
                      </div>
                      <div className="mt-4 md:mt-0 flex space-x-3">
                          <button onClick={() => navigate(`/ticket/${b.ticketId?.ticketId || b.ticketId || b._id}`)} className="text-primary font-bold bg-blue-50 px-4 py-2 rounded-btn">டிக்கெட் பார்</button>
                          {b.bookingStatus !== 'cancelled' && <button onClick={() => handleCancel(b.bookingId)} className="text-brandRed font-bold bg-red-50 px-4 py-2 rounded-btn">ரத்து செய்</button>}
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-12 glassmorphism rounded-card border border-white/40 text-brandMutedText">
                      <p className="text-lg font-bold">பயணங்கள் ஏதுமில்லை</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="slide-in">
               <h2 className="text-2xl font-bold text-brandDarkText mb-6">சேமித்த டிக்கெட்கள்</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {savedTickets.length > 0 ? savedTickets.map((t) => (
                   <div key={t._id} className="glassmorphism p-6 rounded-card shadow-sm border border-white/40">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-xs text-brandMutedText font-bold uppercase">PNR: {t.pnrNumber}</p>
                            <h3 className="font-bold text-lg">{t.journeyDetails?.sourceName} ➔ {t.journeyDetails?.destinationName}</h3>
                         </div>
                         <div className={`px-2 py-1 rounded text-[10px] font-bold ${t.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {t.isValid ? 'உறுதி' : 'செல்லாது'}
                         </div>
                      </div>
                      <p className="text-sm text-brandMutedText font-semibold mb-4">
                        {new Date(t.journeyDetails?.travelDate).toLocaleDateString('ta-IN')} | {t.journeyDetails?.travelClass}
                      </p>
                      <div className="flex space-x-2">
                         <button onClick={() => navigate(`/ticket/${t.ticketId}`)} className="flex-1 text-primary font-bold bg-blue-50 py-2 rounded-btn text-sm">பார்</button>
                         <button onClick={() => navigate(`/ticket/${t.ticketId}`)} className="flex-1 text-brandDarkText font-bold bg-gray-100 py-2 rounded-btn text-sm">பதிவிறக்கு</button>
                      </div>
                   </div>
                 )) : (
                   <div className="col-span-full text-center py-12 glassmorphism rounded-card border border-white/40 text-brandMutedText">
                      <p className="text-lg font-bold">டிக்கெட்கள் ஏதுமில்லை</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glassmorphism p-6 rounded-card shadow-sm border border-white/40 slide-in">
              <h2 className="text-2xl font-bold text-brandDarkText mb-6 border-b pb-4">அமைப்புகள்</h2>
              <div className="space-y-6 max-w-md">
                 <div>
                    <label className="font-bold block mb-2">மொழி</label>
                    <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-input font-semibold w-full cursor-not-allowed">தமிழ் (கட்டாயம்)</div>
                 </div>
                 <div>
                    <label className="font-bold block mb-2">எழுத்து அளவு</label>
                    <div className="flex space-x-4">
                       <button onClick={() => document.documentElement.style.setProperty('--base-font-size', '16px')} className="flex-1 py-2 border rounded font-bold hover:bg-gray-50">A</button>
                       <button onClick={() => document.documentElement.style.setProperty('--base-font-size', '18px')} className="flex-1 py-2 border rounded font-bold text-lg hover:bg-gray-50">A+</button>
                       <button onClick={() => document.documentElement.style.setProperty('--base-font-size', '20px')} className="flex-1 py-2 border rounded font-bold text-xl hover:bg-gray-50">A++</button>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
