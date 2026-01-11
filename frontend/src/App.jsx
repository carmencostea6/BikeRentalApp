import React, { useState } from 'react';
import { Loader2, Info } from 'lucide-react';
// Importurile Componentelor
import NavBar from './components/NavBar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LocationsPage from './pages/LocationsPage.jsx';
import Footer from './components/Footer.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import RentBikePage from './pages/RentBikePage.jsx';

// ---  CONSTANTE ---
const API_BASE_URL = 'http://localhost:5000/api'; 

// Adaug rutele lipsa aici
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  HOME: 'home',
  LOCATIONS: 'locatii',          
  ADMIN_DASHBOARD: 'admin_dashboard',
  RENT_PAGE: 'rent_page' 
};

// Componenta Principala (App)
const App = () => {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  // Functie globala de setare a mesajelor
  const showMessage = (success, text) => {
    setMessage({ success, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Functie de Logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error("Eroare la delogare:", error);
    } finally {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView(VIEWS.LOGIN);
        setIsLoading(false);
        showMessage(true, "V-ați delogat cu succes!");
    }
  };

  // Funcție pentru a afișa componenta corectă (Rutarea)
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center flex-grow h-full">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="ml-3 text-lg text-indigo-600 font-semibold">Se încarcă...</p>
        </div>
      );
    }
    
    // 1. Daca e logat si e HOME
   // CORECT
if (isLoggedIn && currentView === VIEWS.HOME) {
  return <HomePage 
            user={user} 
            showMessage={showMessage} 
            setCurrentView={setCurrentView} 
         />;
}

    // 2. Daca e logat si e ADMIN 
    if (isLoggedIn && currentView === VIEWS.ADMIN_DASHBOARD) {
        return <AdminDashboard user={user} showMessage={showMessage} />;
    }
    
    // 3. Daca e logat si vrea LOCATII (Harta)
    if (isLoggedIn && currentView === VIEWS.LOCATIONS) {
       return <LocationsPage title="Harta Stațiilor" user={user} />;
    }
    
    // 4. Daca NU e logat -> AuthPage
    if (!isLoggedIn) {
      return <AuthPage currentView={currentView} setCurrentView={setCurrentView} setIsLoggedIn={setIsLoggedIn} setUser={setUser} showMessage={showMessage} setIsLoading={setIsLoading} />;
    }

    // 5. Daca e logat si vrea sa inchirieze o bicicleta
   if (isLoggedIn && currentView === VIEWS.RENT_PAGE) {
    return <RentBikePage 
              user={user} 
              setCurrentView={setCurrentView} //  BUTONUL "BACK"
              showMessage={showMessage} 
           />;
}
    
    // Fallback
    return <AuthPage currentView={VIEWS.LOGIN} setCurrentView={setCurrentView} setIsLoggedIn={setIsLoggedIn} setUser={setUser} showMessage={showMessage} setIsLoading={setIsLoading} />;
  };

  return (
    // Container principal 
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col"> 
      
      <NavBar 
        isLoggedIn={isLoggedIn} 
        user={user} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        handleLogout={handleLogout} 
      />
      
      {/* Containerul pentru continut. */}
      <div className="flex-grow pt-16 flex flex-col"> 
        
        {/* Mesaje de eroare/succes  */}
        {message && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <div className={`p-4 rounded-xl shadow-lg flex items-center font-medium ${message.success ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                <Info className="w-5 h-5 mr-2"/>
                {message.text}
              </div>
          </div>
        )}
        
        {/* Continutul Paginii  */}
        <main className="w-full flex-grow flex flex-col p-4 sm:p-6 lg:p-8"> 
          {renderContent()}
        </main>

      </div>
      <Footer />
    </div>
  );
};

export default App;