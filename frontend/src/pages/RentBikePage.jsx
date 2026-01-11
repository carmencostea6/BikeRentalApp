import React, { useState, useEffect } from 'react';
import { MapPin, Bike, CreditCard, Clock, CheckCircle, ArrowLeft, Navigation } from 'lucide-react';
import { VIEWS } from '../utils/constants';

const RentBikePage = ({ user, setCurrentView, showMessage }) => {
    // State Navigare
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);

    // State Date
    const [locations, setLocations] = useState([]);
    const [bikesList, setBikesList] = useState([]);
    
    // State Formular
    const [form, setForm] = useState({
        locationStart: '',
        bikeCode: '',
        cardNr: '',
        cardExp: '',
        cardCvv: '',
        locationStop: ''
    });

    // State Cursa
    const [ride, setRide] = useState(null); // { id, start, total }
    const [timer, setTimer] = useState("00:00:00");

    // --- INIT ---
    useEffect(() => {
        // Incarc locatiile la start
        fetch('http://127.0.0.1:5000/api/rent/locations')
            .then(res => res.json())
            .then(data => setLocations(data));

        // Verific daca userul are deja o cursa pornita (refresh page check)
        const saved = JSON.parse(localStorage.getItem(`active_ride_${user?.ClientID}`));
        if (saved) {
            setRide(saved);
            setStep(3); // Direct la cronometru
        }
    }, [user]);

    // --- TIMER ---
    useEffect(() => {
        let interval;
        if (step === 3 && ride?.start) {
            interval = setInterval(() => {
                const now = new Date();
                const start = new Date(ride.start);
                const diff = Math.floor((now - start) / 1000);
                const h = Math.floor(diff / 3600).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                setTimer(`${h}:${m}:${s}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, ride]);

    const handleLocationSelect = async (locName) => {
        setForm({ ...form, locationStart: locName, bikeCode: '' });
        setIsLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/rent/available?location=${locName}`);
            const data = await res.json();
            setBikesList(data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleStart = async () => {
        if (!form.cardNr || !form.cardExp || !form.cardCvv) return alert("Date card incomplete!");
        setIsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/api/rent/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: user.ClientID,
                    locatie: form.locationStart,
                    bicicleta: form.bikeCode,
                    card: { nr: form.cardNr, exp: form.cardExp, cvv: form.cardCvv }
                })
            });
            const data = await res.json();
            if (data.success) {
                const newRide = { id: data.rent_id, start: data.start_time };
                setRide(newRide);
                localStorage.setItem(`active_ride_${user.ClientID}`, JSON.stringify(newRide));
                setStep(3);
                showMessage(true, "Bicicleta deblocată!");
            } else { alert("Eroare: " + data.error); }
        } catch (e) { alert("Eroare rețea"); }
        finally { setIsLoading(false); }
    };

    const handleStop = async () => {
        if (!form.locationStop) return alert("Selectează locația de stop!");
        setIsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/api/rent/stop', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    rent_id: ride.id,
                    locatie_stop: form.locationStop
                })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.removeItem(`active_ride_${user.ClientID}`);
                setRide({ ...ride, total: data.total, duration: data.durata });
                setStep(4);
            } else { alert("Eroare: " + data.error); }
        } catch (e) { alert("Eroare rețea"); }
        finally { setIsLoading(false); }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            
            {/* PASUL 1: Selectie Bicicleta */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                    <button onClick={() => setCurrentView(VIEWS.HOME)} className="flex items-center text-gray-500 mb-6 hover:text-indigo-600"><ArrowLeft size={18}/> Înapoi la Dashboard</button>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2"><MapPin className="text-indigo-600"/> Pas 1: Configurare Cursă</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Alege Locația de Start</label>
                            <select className="w-full p-3 border rounded-lg bg-gray-50 text-lg focus:ring-2 focus:ring-indigo-500" 
                                value={form.locationStart} onChange={(e) => handleLocationSelect(e.target.value)}>
                                <option value="">-- Selectează --</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>

                        {form.locationStart && (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alege Bicicleta Disponibilă</label>
                                {isLoading ? <p className="text-gray-500">Se caută biciclete...</p> : bikesList.length === 0 ? <p className="text-red-500">Nicio bicicletă disponibilă aici.</p> : (
                                    <div className="grid gap-3 max-h-60 overflow-y-auto pr-2">
                                        {bikesList.map(b => (
                                            <div key={b.cod} 
                                                onClick={() => setForm({...form, bikeCode: b.cod})}
                                                className={`p-4 border rounded-lg cursor-pointer transition flex justify-between items-center ${form.bikeCode === b.cod ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500' : 'hover:bg-gray-50'}`}>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{b.cod}</p>
                                                    <p className="text-xs text-gray-500">{b.display.split('|')[2]}</p>
                                                </div>
                                                <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">{b.pret} Lei/h</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button disabled={!form.bikeCode} onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4">
                            Pasul Următor 👉
                        </button>
                    </div>
                </div>
            )}

            {/* PASUL 2: Plata */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                    <button onClick={() => setStep(1)} className="flex items-center text-gray-500 mb-6 hover:text-indigo-600"><ArrowLeft size={18}/> Înapoi</button>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2"><CreditCard className="text-green-600"/> Pas 2: Detalii Plată</h2>
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                        <input type="text" placeholder="Număr Card (16 cifre)" className="w-full p-3 border rounded-lg" value={form.cardNr} onChange={e => setForm({...form, cardNr: e.target.value})} />
                        <div className="flex gap-4">
                            <input type="date" className="w-1/2 p-3 border rounded-lg" value={form.cardExp} onChange={e => setForm({...form, cardExp: e.target.value})} />
                            <input type="text" placeholder="CVV" maxLength="3" className="w-1/2 p-3 border rounded-lg" value={form.cardCvv} onChange={e => setForm({...form, cardCvv: e.target.value})} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Plata se va procesa la finalul cursei în funcție de durată.</p>
                    </div>

                    <button onClick={handleStart} disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition mt-6 flex justify-center items-center gap-2">
                        {isLoading ? "Se procesează..." : <>DEBLOCHEAZĂ & START <Bike/></>}
                    </button>
                </div>
            )}

            {/* PASUL 3: Cursa Activa */}
            {step === 3 && (
                <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-indigo-500 animate-pulse-slow">
                    <h2 className="text-4xl font-bold mb-4 flex justify-center items-center gap-3"><Clock size={40} className="text-green-400"/> Cursă în Desfășurare</h2>
                    <p className="text-indigo-200 mb-8 text-lg">Bicicleta: <span className="font-mono font-bold text-white">{ride?.cod || form.bikeCode}</span></p>
                    
                    <div className="text-8xl font-mono font-black tracking-widest mb-12 text-white drop-shadow-lg">
                        {timer}
                    </div>

                    <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md text-left">
                        <label className="block text-indigo-100 font-bold mb-2">Unde lași bicicleta?</label>
                        <select className="w-full p-4 rounded-lg bg-white text-gray-900 font-bold text-xl mb-6 shadow-inner" 
                            value={form.locationStop} onChange={e => setForm({...form, locationStop: e.target.value})}>
                            <option value="">-- Alege Locația Stop --</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        
                        <button onClick={handleStop} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-105 flex justify-center gap-2">
                            STOP & FINALIZARE 🏁
                        </button>
                    </div>
                </div>
            )}

            {/* PASUL 4: Sumar */}
            {step === 4 && (
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center border-t-8 border-green-500">
                    <div className="flex justify-center mb-6"><div className="bg-green-100 p-4 rounded-full"><CheckCircle size={60} className="text-green-600"/></div></div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Cursă Finalizată!</h2>
                    <p className="text-gray-500 mb-8">Mulțumim că ai ales BikeRental.</p>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
    <span className="text-gray-600 text-lg">Durată</span>

    <span className="font-bold text-2xl text-gray-800">{ride?.duration}</span>
</div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-600 text-lg">Total Plătit</span>
                            <span className="font-extrabold text-4xl text-green-600">{ride?.total} LEI</span>
                        </div>
                    </div>

                    <button onClick={() => { localStorage.removeItem(`active_ride_${user.ClientID}`); setCurrentView(VIEWS.HOME); }} 
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg">
                        Înapoi la Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default RentBikePage;