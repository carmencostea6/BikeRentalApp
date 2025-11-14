import React, { useState } from 'react';
import { Loader2, Info } from 'lucide-react';
// Importurile Componentelor
import NavBar from './components/NavBar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DummyPage from './pages/DummyPage.jsx';

// --- PASUL 1: ACTIVAREA CONEXIUNII ---
// Acum este activat pentru a comunica cu Python
const API_BASE_URL = 'http://localhost:5000/api'; 

// --- Rute (VIEWS) ---
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  HOME: 'home', 
};

// =========================================================================
// Componenta Principala (App) - Gestioneaza Starea si Rutarea
// =========================================================================
const App = () => {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  // Functie globala de setare a mesajelor
  const showMessage = (success, text) => {
    setMessage({ success, text });
    setTimeout(() => setMessage(null), 5000); // Curata mesajul dupa 5 secunde
  };

  // Functie de Logout (APELEAZA ACUM SERVERUL)
  const handleLogout = async () => {
    setIsLoading(true);
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include' // Trimite cookie-ul de sesiune
        });
    } catch (error) {
        console.error("Eroare la delogare:", error);
    } finally {
        // Chiar daca API-ul esueaza, delogheaza local
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
        // Loader centrat
        <div className="flex justify-center items-center flex-grow">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="ml-3 text-lg text-indigo-600 font-semibold">Se încarcă...</p>
        </div>
      );
    }
    
    // Rutarea logică
    if (isLoggedIn && currentView === VIEWS.HOME) {
      return <HomePage user={user} showMessage={showMessage} />;
    }
    
    if (!isLoggedIn) {
      // AuthPage trebuie sa fie centrata
      return <AuthPage currentView={currentView} setCurrentView={setCurrentView} setIsLoggedIn={setIsLoggedIn} setUser={setUser} showMessage={showMessage} setIsLoading={setIsLoading} />;
    }
    
    if (isLoggedIn && currentView === 'locatii') {
       return <DummyPage title="Vizualizare Locații" user={user} />;
    }
    
    // Fallback
    return <AuthPage currentView={VIEWS.LOGIN} setCurrentView={setCurrentView} setIsLoggedIn={setIsLoggedIn} setUser={setUser} showMessage={showMessage} setIsLoading={setIsLoading} />;
  };

  return (
    // Container principal - fortam inaltimea ecranului si layout flexibil pe coloana
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col"> 
      <NavBar 
        isLoggedIn={isLoggedIn} 
        user={user} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        handleLogout={handleLogout} 
      />
      
      {/* Container pentru continut, sub navbar */}
      <div className="p-4 sm:p-6 lg:p-8 w-full flex-grow pt-20 flex flex-col"> 
        {message && (
          <div className={`p-4 mb-4 mt-10 rounded-xl shadow-lg max-w-xl mx-auto flex items-center font-medium ${message.success ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            <Info className="w-5 h-5 mr-2"/>
            {message.text}
          </div>
        )}
        
        {/* Main Content: creste pentru a umple spatiul si permite centrarea AuthPage */}
        <main className="w-full flex-grow flex flex-col"> 
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;