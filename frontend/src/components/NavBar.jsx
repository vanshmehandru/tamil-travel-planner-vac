import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Search, Map, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function NavBar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'முகப்பு', icon: Home, path: '/home' },
    { label: 'தேடல்', icon: Search, path: '/search' },
    { label: 'என் பயணங்கள்', icon: Map, path: '/account?tab=bookings' },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex sticky top-0 z-50 w-full bg-primary text-white shadow-md h-16 items-center px-8">
        {/* Left Section: Logo */}
        <div className="flex-1">
          <Link to="/home" className="text-2xl font-bold font-sans">நம்ம யாத்திரை</Link>
        </div>

        {/* Center Section: Main Navigation Links */}
        <div className="flex-[2] flex justify-center space-x-10">
          {isAuthenticated && navItems.map((item) => (
            <Link key={item.label} to={item.path} className="flex items-center space-x-2 hover:text-brand-light-blue transition font-bold group">
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Section: My Account & Logout */}
        <div className="flex-1 flex justify-end items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/account" className="flex items-center space-x-2 hover:text-brand-light-blue transition group">
                <div className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center font-bold shadow-sm group-hover:bg-brand-light-blue transition">
                  {user?.username?.charAt(0) || 'ந'}
                </div>
                <span className="font-bold">கணக்கு</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-white text-primary p-2.5 rounded-full hover:bg-brand-light-blue transition shadow-sm border border-primary/20 flex items-center justify-center"
                title="வெளியேறு"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-brand-light-blue text-primary px-4 py-2 rounded-btn font-bold">உள்நுழை</Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 z-50 w-full bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] h-16 flex items-center justify-around text-brandMutedText border-t">
          {navItems.map((item) => (
            <Link key={item.label} to={item.path} className="flex flex-col items-center justify-center w-full h-full hover:text-primary active:text-primary focus:text-primary">
              <item.icon size={24} className="mb-1" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
