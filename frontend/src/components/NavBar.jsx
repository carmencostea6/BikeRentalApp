import React from 'react';
import { LogIn, UserPlus, LogOut, Bike, LayoutDashboard, Map } from 'lucide-react';
import NavButton from './NavButton.jsx';
import { VIEWS } from '../utils/constants.js';
// --- NavBar ---
const NavBar = ({ isLoggedIn, user, currentView, setCurrentView, handleLogout }) => (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"> 
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Bike className="text-indigo-600 mr-2 h-7 w-7" />
            <span className="text-2xl font-extrabold text-gray-900 tracking-wider">BikeRental</span>
          </div>
          <div className="flex space-x-3 items-center">
            {isLoggedIn ? (
              // Optiuni cand e autentificat
              <>
                <span className="text-sm font-semibold text-gray-600 mr-2 hidden sm:inline">
                  {/* Am corectat user.NumeComplet cu user.Nume */}
                  Salut, {user?.Prenume}
                </span>
                <NavButton view={VIEWS.HOME} currentView={currentView} icon={LayoutDashboard} label="Dashboard" onClick={setCurrentView} />
                <NavButton view="locatii" currentView={currentView} icon={Map} label="Locații" onClick={setCurrentView} />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition duration-150 flex items-center shadow-md"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              // Optiuni cand NU e autentificat
              <>
                <NavButton view={VIEWS.LOGIN} currentView={currentView} icon={LogIn} label="Login" onClick={setCurrentView} />
                <NavButton view={VIEWS.REGISTER} currentView={currentView} icon={UserPlus} label="Înregistrare" onClick={setCurrentView} />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
);
export default NavBar;