// --- AuthPage ---
import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import InputField from '../components/InputField.jsx';
import { VIEWS, API_BASE_URL } from '../utils/constants.js';

const AuthPage = ({ currentView, setCurrentView, setIsLoggedIn, setUser, showMessage, setIsLoading }) => {
  const isLogin = currentView === VIEWS.LOGIN;
  
  const [formData, setFormData] = useState({
    email: '',
    parola: '',
    nume: '',
    prenume: '',
    cnp: '',
    telefon: '',
    sex: 'F',
    strada: '',
    numar: '',
    oras: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Functia de  validare
  const all = (...values) => values.every(v => v && String(v).trim() !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setIsLoading(true);

    const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
    
    let payload;
    if (isLogin) {
        payload = { email: formData.email, parola: formData.parola };
        if (!all(payload.email, payload.parola)) {
            showMessage(false, "Email și Parolă sunt obligatorii.");
            setIsProcessing(false);
            setIsLoading(false);
            return;
        }
    } else {
        // Inregistrare
        payload = { 
            email: formData.email, 
            parola: formData.parola,
            nume: formData.nume,
            prenume: formData.prenume,
            cnp: formData.cnp,
            telefon: formData.telefon,
            sex: formData.sex,
            strada: formData.strada || null,
            numar: formData.numar || null,
            oras: formData.oras || null
        };
        if (!all(payload.email, payload.parola, payload.nume, payload.prenume, payload.cnp, payload.telefon, payload.sex)) {
             showMessage(false, "Câmpurile marcate cu * sunt obligatorii.");
             setIsProcessing(false);
             setIsLoading(false);
             return;
        }
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include' 
        });

        const data = await response.json();

        if (data.success) {
            showMessage(true, data.message);
            
            if (isLogin) {
                setIsLoggedIn(true);
                setUser(data.user);
                
                // --- MODIFICARE PENTRU ADMIN ---
                if (data.user.Rol === 'admin') {
                    console.log("Admin detectat! Redirectare catre Dashboard Admin...");
                    setCurrentView(VIEWS.ADMIN_DASHBOARD);
                } else {
                    setCurrentView(VIEWS.HOME);
                }

            } else {
                setCurrentView(VIEWS.LOGIN);
                setFormData({ email: '', parola: '', nume: '', prenume: '', cnp: '', telefon: '', sex: 'F', strada: '', numar: '', oras: '' });
            }
        } else {
            showMessage(false, data.message);
        }

    } catch (error) {
        console.error("Eroare la apelul API:", error);
        showMessage(false, "Eroare de rețea. Serverul nu răspunde.");
    } finally {
        setIsProcessing(false);
        setIsLoading(false);
    }
  };

  return (
    // Centrare 
    <div className="flex items-center justify-center w-full px-4 flex-grow"> 
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl max-w-lg w-full border-t-8 border-indigo-600 text-center mx-auto">

        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
          {isLogin ? 'Autentificare Client' : 'Înregistrare Cont Nou'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required={true} />
          
          {/* Campul Parola cu iconita ochi */}
          <div className="relative">
            <InputField 
              label="Parolă" 
              type={showPassword ? "text" : "password"} 
              name="parola" 
              value={formData.parola} 
              onChange={handleChange} 
              required={true} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2 p-1 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition duration-150"
              aria-label={showPassword ? "Ascunde parola" : "Afiseaza parola"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Campuri  pentru Inregistrare */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nume" type="text" name="nume" value={formData.nume} onChange={handleChange} required={true} />
                <InputField label="Prenume" type="text" name="prenume" value={formData.prenume} onChange={handleChange} required={true} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="CNP (13 cifre)" type="text" name="cnp" value={formData.cnp} onChange={handleChange} required={true} maxLength="13" />
                <InputField label="Telefon" type="text" name="telefon" value={formData.telefon} onChange={handleChange} required={true} />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700">Sex <span className="text-red-500">*</span></label>
                <select name="sex" value={formData.sex} onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-white">
                  <option value="F">F (Feminin)</option>
                  <option value="M">M (Masculin)</option>
                </select>
              </div>
              
              <hr className="my-4"/>
              
              <h3 className="text-lg font-semibold text-gray-700 text-center">Adresă</h3>
              <InputField label="Stradă" type="text" name="strada" value={formData.strada} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Număr" type="text" name="numar" value={formData.numar} onChange={handleChange} />
                <InputField label="Oraș" type="text" name="oras" value={formData.oras} onChange={handleChange} />
              </div>
            </>
          )}

          <button type="submit" disabled={isProcessing}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-300 transform hover:translate-y-[-1px] mt-6">
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Se procesează...
              </>
            ) : (
              isLogin ? 'Autentificare' : 'Înregistrare Cont'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView(isLogin ? VIEWS.REGISTER : VIEWS.LOGIN)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition duration-150 hover:underline"
          >
            {isLogin ? "Nu ai cont? Creează un cont nou!" : "Ai deja cont? Autentifică-te"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
