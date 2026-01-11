import React, { useState, useEffect, useRef } from 'react';
import { VIEWS } from '../utils/constants';
import Card from '../components/Card.jsx';



const HomePage = ({ user, showMessage, setCurrentView }) => {

    // --- STATE PENTRU ISTORIC & PLATI & ACCESORII ---

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [accessoriesData, setAccessoriesData] = useState([]);

    // --- STATE PENTRU A-7 (DURATA & SELECTOR AN) ---
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [totalDuration, setTotalDuration] = useState(0);
    const availableYears = Array.from({length: new Date().getFullYear() - 2020 + 1}, (_, i) => 2020 + i).reverse();

    // --- STATE PENTRU LOCATII ---
    const [isLocationsOpen, setIsLocationsOpen] = useState(false);
    const [locationNames, setLocationNames] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [bikesData, setBikesData] = useState([]);

    // State-uri Interogari Complexe

    const [topLocations, setTopLocations] = useState([]);
    const [childSeatBikes, setChildSeatBikes] = useState([]);
    const [unvisitedLocations, setUnvisitedLocations] = useState([]);
    const [mostFreeStation, setMostFreeStation] = useState(null);
    const [lowBudgetBikes, setLowBudgetBikes] = useState([]);
    const [maxAccessoryPrice, setMaxAccessoryPrice] = useState(15);

    // --- STATE PENTRU INCHIRIERE ---
    const [isRentOpen, setIsRentOpen] = useState(false);
    const [upgradeBikes, setUpgradeBikes] = useState([]);

    // Helper pentru data curenta (Local Time)
    const getLocalISOString = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajustare fus orar
        return now.toISOString().slice(0, 16);

    };

    const [rentLoc, setRentLoc] = useState('');
    const [rentCode, setRentCode] = useState('');
    const [rentDate, setRentDate] = useState('');

    // --- STATE GLOBAL ---
    const [isLoading, setIsLoading] = useState(false);
    const [isVip, setIsVip] = useState(false);
    const resultsRef = useRef(null);

    // LOGICA 1: DASHBOARD & VIP

    useEffect(() => {
        // Check Active Ride la load (daca userul da refresh pe Home dar are cursa activa)
        const savedRide = JSON.parse(localStorage.getItem(`active_ride_${user?.ClientID}`));
        if (savedRide) {
            // Daca are cursa activa, il trimit direct pe pagina de RENT
            setCurrentView(VIEWS.RENT_PAGE);
        }

        const checkVipStatus = async () => {

            if (!user || !user.ClientID) return;

            try {

                const response = await fetch(`http://127.0.0.1:5000/api/dashboard/stats/vip/${user.ClientID}`);

                if (response.ok) {

                    const data = await response.json();

                    setIsVip(data.is_vip);

                }

            } catch (error) { console.error("Eroare VIP check:", error); }

        };

        checkVipStatus();

    }, [user]);

    // LOGICA 2: ISTORIC

    const fetchDurationStats = async (year) => {

        if (!user || !user.ClientID) return;

        try {

            const response = await fetch(`http://127.0.0.1:5000/api/dashboard/stats/duration/${user.ClientID}?year=${year}`);

            if (response.ok) {

                const data = await response.json();

                setTotalDuration(data.MinuteTotale);

            }

        } catch (error) { console.error(error); }

    };



    const handleYearChange = (e) => {

        setSelectedYear(e.target.value);

        fetchDurationStats(e.target.value);

    };



    const fetchHistoryData = async () => {

        if (!user || !user.ClientID) return;

        setIsLoading(true);

        setIsHistoryOpen(true);

        try {

            const resH = await fetch(`http://127.0.0.1:5000/api/dashboard/history/${user.ClientID}`);

            if (resH.ok) setHistoryData(await resH.json());

           
            const resP = await fetch(`http://127.0.0.1:5000/api/dashboard/payments/${user.ClientID}`);

            if (resP.ok) setPaymentData(await resP.json());


            const resA = await fetch(`http://127.0.0.1:5000/api/dashboard/accessories/${user.ClientID}`);

            if (resA.ok) setAccessoriesData(await resA.json());


            fetchDurationStats(selectedYear);

        } catch (error) { showMessage(true, "Eroare la încărcarea datelor."); } finally { setIsLoading(false); }

    };

    // LOGICA 3: LOCATII

    const fetchLowBudgetBikes = async (price) => {

        try {

            const response = await fetch(`http://127.0.0.1:5000/api/dashboard/bikes/low-budget?max_price=${price}`);

            if (response.ok) setLowBudgetBikes(await response.json());

        } catch (error) { console.error(error); }

    };



    const handlePriceChange = (e) => setMaxAccessoryPrice(e.target.value);

    const handlePriceAfterChange = () => fetchLowBudgetBikes(maxAccessoryPrice);



    const openLocationsModal = async () => {

        setIsLocationsOpen(true);

        try {

            const response = await fetch('http://127.0.0.1:5000/api/dashboard/locations/names');

            if (response.ok) {

                const names = await response.json();

                setLocationNames(names);

                if (names.length > 0) {

                    setSelectedLocation(names[0]);

                    fetchBikesForLocation(names[0]);

                }

            }

            const resTop = await fetch('http://127.0.0.1:5000/api/dashboard/locations/top');

            if (resTop.ok) setTopLocations(await resTop.json());

           

            const resChild = await fetch('http://127.0.0.1:5000/api/dashboard/bikes/child-seat');

            if (resChild.ok) setChildSeatBikes(await resChild.json());



            if (user?.ClientID) {

                const resUnvisited = await fetch(`http://127.0.0.1:5000/api/dashboard/locations/unvisited/${user.ClientID}`);

                if (resUnvisited.ok) setUnvisitedLocations(await resUnvisited.json());

            }



            const resMostFree = await fetch('http://127.0.0.1:5000/api/dashboard/locations/most-free');

            if (resMostFree.ok) {

                const data = await resMostFree.json();

                setMostFreeStation(data.Station);

            }



            fetchLowBudgetBikes(maxAccessoryPrice);



        } catch (error) { console.error("Eroare date locatii:", error); }

    };



    const fetchBikesForLocation = async (locName) => {

        if (!locName) return;

        setIsLoading(true);

        try {

            const response = await fetch(`http://127.0.0.1:5000/api/dashboard/bikes/available?location_name=${encodeURIComponent(locName)}`);

            if (response.ok) setBikesData(await response.json());

        } catch (error) { console.error(error); } finally { setIsLoading(false); }

    };



    const handleLocationChange = (e) => {

        const newLoc = e.target.value;

        setSelectedLocation(newLoc);

        fetchBikesForLocation(newLoc);

    };


    // LOGICA 4: REZERVARE
    const openRentModal = async () => {

        setIsRentOpen(true);


        // Setam data default la ACUM + 2 minute

        const nowPlus2Min = new Date();

        nowPlus2Min.setMinutes(nowPlus2Min.getMinutes() + 2);

        nowPlus2Min.setMinutes(nowPlus2Min.getMinutes() - nowPlus2Min.getTimezoneOffset());

        setRentDate(nowPlus2Min.toISOString().slice(0, 16));

       

        if (locationNames.length === 0) {

            const res = await fetch('http://127.0.0.1:5000/api/dashboard/locations/names');

            if (res.ok) setLocationNames(await res.json());

        }



        if (user?.ClientID) {

            try {

                const response = await fetch(`http://127.0.0.1:5000/api/dashboard/bikes/upgrade/${user.ClientID}`);

                if (response.ok) {

                    setUpgradeBikes(await response.json());

                }

            } catch (error) { console.error("Eroare B-5:", error); }

        }

    };



    const handleConfirmReservation = async () => {

        if (!rentLoc || !rentCode || !rentDate) {

            alert("Te rog completează toate câmpurile!");

            return;

        }

       

        // --- VALIDARE DATA  ---

        const selectedTime = new Date(rentDate).getTime();

        const currentTime = new Date().getTime();

       

        // Permit o marja de eroare de 5 minute in trecut (pentru decalaje ceas)

        const fiveMinutesAgo = currentTime - (5 * 60 * 1000);



        if (selectedTime < fiveMinutesAgo) {

            alert("Nu poți face o rezervare în trecut!");

            return;

        }


        try {

            const res = await fetch('http://127.0.0.1:5000/api/dashboard/bikes/validate', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ locatie: rentLoc, cod: rentCode })

            });

           

            const data = await res.json();

           

            if (data.valid) {

                const newReservation = {

                    id: Date.now(),

                    locatie: rentLoc,

                    cod: rentCode,

                    data: rentDate,

                    pret: data.pret,

                    status: 'Activă'

                };



                const existing = JSON.parse(localStorage.getItem(`reservations_${user.ClientID}`)) || [];

                localStorage.setItem(`reservations_${user.ClientID}`, JSON.stringify([...existing, newReservation]));



                setIsRentOpen(false);

               

                const dateObj = new Date(rentDate);

                const formattedDate = dateObj.toLocaleDateString('ro-RO') + ' ' + dateObj.toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'});

               

                showMessage(true, `Rezervare realizată cu succes! Poți folosi bicicleta ${rentCode} din ${rentLoc} începând cu ${formattedDate}.`);

               

                setRentLoc('');

                setRentCode('');

            } else {

                alert(`Eroare: Bicicleta ${rentCode} nu există în ${rentLoc} sau nu este liberă.`);

            }



        } catch (error) {

            console.error("Eroare validare:", error);

            alert("Eroare de conexiune la validare.");

        }

    };


    // RENDER (UI)

    return (

        <div className="max-w-7xl mx-auto relative">


            <div className="bg-white p-10 rounded-xl shadow-2xl border-t-8 border-indigo-600 mt-8 text-left">

                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Dashboard Client</h2>



                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-lg flex flex-col md:flex-row justify-between items-center">

                    <div>

                        <div className="flex items-center gap-3">

                            <h2 className="text-3xl text-indigo-900 font-extrabold tracking-tight">Bine ai venit, {user ? user.Prenume : 'Client'}!</h2>

                            <div className="relative group flex items-center gap-2 cursor-help">

                                {isVip ? (

                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full border border-yellow-400 shadow-sm flex items-center gap-1 animate-pulse">👑 VIP MEMBER</span>

                                ) : (

                                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">Membru Standard</span>

                                )}

                                <span className="text-gray-400 hover:text-indigo-600 transition-colors">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>

                                </span>

                                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">

                                    <p className="font-bold mb-1 underline">Ce înseamnă statusul?</p>

                                    {isVip ? "Felicitări! Suma cheltuită de tine este MAI MARE decât media tuturor utilizatorilor din platformă." : "Statusul VIP se acordă automat clienților care au cheltuieli totale peste media comunității."}

                                    <div className="absolute left-4 top-full w-3 h-3 bg-gray-900 rotate-45 transform -translate-y-1.5"></div>

                                </div>

                            </div>

                        </div>

                        <p className="text-md text-indigo-600 mt-2 font-medium">{isVip ? "Mulțumim că ești un client de top! Ai beneficii exclusive." : "Acum poți începe o nouă închiriere sau gestiona contul tău."}</p>

                        <p className="text-xs text-gray-400 mt-4 font-mono">Client ID: {user?.ClientID}</p>

                    </div>

                    <div className="mt-4 md:mt-0">

                        {isVip ? (<div className="text-center bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-inner"><span className="text-4xl">🌟</span><p className="text-xs font-bold text-yellow-700 mt-1">STATUS: GOLD</p></div>) : (<div className="text-center opacity-50"><span className="text-4xl">🚲</span></div>)}

                    </div>

                </div>
                <div 
                        onClick={() => setCurrentView(VIEWS.RENT_PAGE)}
                        className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg cursor-pointer transform hover:-translate-y-1 hover:shadow-xl transition duration-300 flex flex-col justify-between group"
                    >
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Start Cursă Nouă</h3>
                            <p className="text-indigo-100 text-sm">Alege bicicleta, plătește și pornește la drum!</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <span className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </div>
                    </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    

                    <Card title="Rezervă o cursă" description="Start rezervare & Recomandări." buttonLabel="Start Rezervare" onClick={openRentModal} />

                    <Card title="Vizualizare Locații" description="Vezi bicicletele disponibile în locația dorită." buttonLabel="Vezi Locațiile" onClick={openLocationsModal} />

                    <Card title="Istoric & Plăți" description="Vezi istoricul, plățile și accesoriile." buttonLabel="Vezi Detalii" onClick={fetchHistoryData} />

                </div>

            </div>



            {/* --- MODAL 1: ISTORIC --- */}

            {isHistoryOpen && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-6 border-b pb-4">

                            <h3 className="text-3xl font-bold text-gray-800">Raport Activitate</h3>

                            <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-2xl">✕</button>

                        </div>

                        {isLoading ? (<p className="text-center text-gray-600 text-xl">Se încarcă datele...</p>) : (

                            <div className="space-y-10">

                                {/* A-7 */}

                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center">

                                    <div><h4 className="text-2xl font-bold flex items-center gap-2">⏱️ Timp Total Petrecut pe Bicicletă</h4><p className="text-blue-100 text-sm mt-1">Selectează anul pentru a vedea cât ai pedalat.</p></div>

                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">

                                        <div className="flex flex-col"><label className="text-xs font-bold text-blue-200 uppercase">Anul</label><select value={selectedYear} onChange={handleYearChange} className="text-gray-900 rounded p-1 font-bold cursor-pointer focus:outline-none">{availableYears.map(year => <option key={year} value={year}>{year}</option>)}</select></div>

                                        <div className="text-right bg-white/20 p-3 rounded-lg backdrop-blur-sm"><span className="block text-3xl font-extrabold">{totalDuration}</span><span className="text-xs uppercase font-bold tracking-wider">Minute</span></div>

                                    </div>

                                </div>

                                {/* A-1 */}

                                <div><h4 className="text-xl font-bold text-indigo-700 mb-3 border-l-4 border-indigo-500 pl-2">🚲 Istoric Închirieri</h4>{historyData.length > 0 ? (<div className="overflow-x-auto shadow-md rounded-lg"><table className="min-w-full bg-white text-sm"><thead className="bg-gray-100 text-gray-700 uppercase font-semibold"><tr><th className="py-3 px-4 text-center">Data Start</th><th className="py-3 px-4 text-center">Cod Bicicletă</th><th className="py-3 px-4 text-left">Locație Start</th><th className="py-3 px-4 text-left">Adresă</th><th className="py-3 px-4 text-center">Penalizări</th></tr></thead><tbody className="divide-y divide-gray-200">{historyData.map((item, index) => (<tr key={index} className="hover:bg-gray-50"><td className="py-3 px-4 text-center text-gray-700">{item.DataStart ? String(item.DataStart).split('.')[0] : '-'}</td><td className="py-3 px-4 text-center font-mono font-bold text-blue-600">{item.CodBicicleta}</td><td className="py-3 px-4 text-gray-800">{item.PunctPornire}</td><td className="py-3 px-4 text-gray-500 italic">{item.Strada}</td><td className={`py-3 px-4 text-center font-bold ${item.PretPenalizare > 0 ? 'text-red-600' : 'text-green-600'}`}>{item.PretPenalizare} Lei</td></tr>))}</tbody></table></div>) : <p className="text-gray-500 italic">Nu există închirieri.</p>}</div>

                                {/* A-2, A-4 */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    <div><h4 className="text-xl font-bold text-green-700 mb-3 border-l-4 border-green-500 pl-2">💳 Sumar Plăți</h4>{paymentData.length > 0 ? (<div className="overflow-x-auto shadow-md rounded-lg"><table className="min-w-full bg-white text-sm"><thead className="bg-green-50 text-green-800 uppercase font-semibold"><tr><th className="py-3 px-4 text-left">Număr Card</th><th className="py-3 px-4 text-center">Tranzacții</th><th className="py-3 px-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-gray-200">{paymentData.map((item, index) => (<tr key={index} className="hover:bg-gray-50"><td className="py-3 px-4 font-mono text-gray-700">**** {item.NrCard.slice(-4)}</td><td className="py-3 px-4 text-center font-bold">{item.NumarTranzactii}</td><td className="py-3 px-4 text-right font-bold text-green-700">{item.TotalCheltuit} Lei</td></tr>))}</tbody></table></div>) : <p className="text-gray-500 italic">Fără plăți.</p>}</div>

                                    <div><h4 className="text-xl font-bold text-orange-600 mb-3 border-l-4 border-orange-500 pl-2">🎒 Accesorii Utilizate</h4>{accessoriesData.length > 0 ? (<div className="overflow-x-auto shadow-md rounded-lg"><table className="min-w-full bg-white text-sm"><thead className="bg-orange-50 text-orange-800 uppercase font-semibold"><tr><th className="py-3 px-4 text-center">Data</th><th className="py-3 px-4 text-left">Accesoriu</th><th className="py-3 px-4 text-right">Preț</th></tr></thead><tbody className="divide-y divide-gray-200">{accessoriesData.map((item, index) => (<tr key={index} className="hover:bg-gray-50"><td className="py-3 px-4 text-center text-gray-600 text-xs">{item.Data}</td><td className="py-3 px-4 font-bold text-gray-800">{item.Accesoriu}</td><td className="py-3 px-4 text-right font-bold text-orange-600">{item.Pret} Lei</td></tr>))}</tbody></table></div>) : <p className="text-gray-500 italic">Niciun accesoriu utilizat.</p>}</div>

                                </div>

                            </div>

                        )}

                        <div className="mt-8 flex justify-end pt-4 border-t"><button onClick={() => setIsHistoryOpen(false)} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition">Închide</button></div>

                    </div>

                </div>

            )}



            {/* --- MODAL 2: LOCATII --- */}

            {isLocationsOpen && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[85vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-4 border-b pb-2">

                            <h3 className="text-2xl font-bold text-gray-800">Explorare Locații</h3>

                            <button onClick={() => setIsLocationsOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-2xl">✕</button>

                        </div>

                        {mostFreeStation && (<div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm flex items-center justify-between"><div><p className="text-sm font-bold text-green-800 uppercase tracking-wide">✅ Recomandarea Sistemului</p><p className="text-xl font-extrabold text-gray-800 mt-1">Stația "{mostFreeStation}" are cele mai multe biciclete libere!</p></div><button onClick={() => { setSelectedLocation(mostFreeStation); fetchBikesForLocation(mostFreeStation); setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow">Vezi Bicicletele</button></div>)}

                        {topLocations.length > 0 && (<div className="mb-8"><h4 className="text-lg font-bold text-indigo-800 mb-3">🔥 Top 3 Cele mai Populare Stații</h4><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{topLocations.map((loc, index) => (<div key={index} className={`p-3 rounded-lg shadow border flex flex-col items-center ${index === 0 ? 'bg-yellow-100 border-yellow-300 text-yellow-900' : index === 1 ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-orange-100 border-orange-300 text-orange-900'}`}><span className="text-2xl mb-1">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span><span className="font-bold text-lg">{loc.Locatie}</span><span className="text-sm opacity-80">{loc.Plecari} plecări</span></div>))}</div></div>)}

                        {unvisitedLocations.length > 0 && (<div className="mb-8"><h4 className="text-lg font-bold text-teal-700 mb-3 flex items-center gap-2">🗺️ Explorează Locații Noi (Nu ai fost aici!)</h4><div className="flex overflow-x-auto pb-4 gap-4">{unvisitedLocations.map((loc, index) => (<div key={index} className="min-w-[200px] bg-teal-50 border border-teal-200 p-3 rounded-lg shadow-sm hover:shadow-md transition"><p className="font-bold text-teal-900">{loc.Nume}</p><p className="text-xs text-teal-600 mt-1">{loc.Adresa}</p></div>))}</div></div>)}

                        {childSeatBikes.length > 0 && (<div className="mb-8"><h4 className="text-lg font-bold text-purple-700 mb-3 flex items-center">👶 Familie & Copii (Scaune Disponibile)</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{childSeatBikes.map((bike, index) => (<div key={index} className="bg-purple-50 border border-purple-200 p-3 rounded-lg flex justify-between items-center shadow-sm"><div><p className="font-bold text-gray-800">{bike.Locatie}</p><p className="text-xs text-gray-500 font-mono">#{bike.Cod}</p></div><span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">{bike.Pret} Lei</span></div>))}</div></div>)}

                        <div className="mb-8 border-t pt-6"><h4 className="text-lg font-bold text-pink-700 mb-4 flex items-center gap-2">💸 Oferte Low Budget (Biciclete Ieftine)</h4><div className="bg-pink-50 p-4 rounded-lg border border-pink-200 mb-4"><div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-pink-900">Preț Maxim Accesoriu: <span className="text-lg">{maxAccessoryPrice} RON</span></label><span className="text-xs text-pink-600 bg-white px-2 py-1 rounded border border-pink-100">Filtru Activ</span></div><input type="range" min="0" max="50" step="1" value={maxAccessoryPrice} onChange={handlePriceChange} onMouseUp={handlePriceAfterChange} className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"/><p className="text-xs text-gray-500 mt-2 text-center">Trage de slider pentru a filtra accesoriile sub un anumit preț.</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{lowBudgetBikes.length > 0 ? lowBudgetBikes.map((bike, index) => (<div key={index} className="bg-white border border-pink-200 p-3 rounded-lg shadow-sm flex flex-col justify-between hover:border-pink-400 transition"><div><div className="flex justify-between"><span className="font-bold text-gray-800">{bike.Locatie}</span><span className="text-pink-600 font-bold">{bike.PretBicicleta} Lei</span></div><div className="text-xs text-gray-500 mt-1 font-mono">#{bike.Cod}</div><div className="mt-2 text-sm bg-pink-50 text-pink-800 px-2 py-1 rounded inline-block">+ {bike.Accesoriu} ({bike.PretAccesoriu} Lei)</div></div></div>)) : (<p className="col-span-3 text-center text-gray-500 py-2 italic">Nu am găsit biciclete cu accesorii sub {maxAccessoryPrice} RON.</p>)}</div></div>

                        <div ref={resultsRef} className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 mt-8"><label className="block text-gray-700 font-bold mb-2">🔎 Caută Standard:</label><select value={selectedLocation} onChange={handleLocationChange} className="w-full p-2 border border-gray-300 rounded">{locationNames.map((name, index) => <option key={index} value={name}>{name}</option>)}</select></div>

                        {isLoading ? (<p className="text-center text-blue-600">Se caută...</p>) : (<div><h4 className="text-xl font-bold mb-4 text-gray-700">Rezultate: <span className="text-blue-600">{selectedLocation}</span></h4>{bikesData.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{bikesData.map((bike, index) => (<div key={index} className="border p-4 rounded-lg shadow-sm bg-white"><div className="flex justify-between items-start mb-2"><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">LIBER</span><span className="font-mono text-gray-500 text-xs">#{bike.Cod}</span></div><p className="text-gray-600 text-sm mb-2">📍 {bike.Adresa}</p><div className="mt-2 pt-2 border-t font-bold text-blue-600">{bike.Pret} Lei</div></div>))}</div>) : <p className="text-center py-4 bg-gray-50 text-gray-500">Nu există biciclete standard aici.</p>}</div>)}

                        <div className="mt-6 flex justify-end"><button onClick={() => setIsLocationsOpen(false)} className="bg-gray-600 text-white px-6 py-2 rounded">Închide</button></div>

                    </div>

                </div>

            )}



            {/* --- MODAL 3:  REZERVARE --- */}

            {isRentOpen && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative overflow-hidden max-h-[90vh] overflow-y-auto">

                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-purple-600"></div>

                        <div className="flex justify-between items-center mb-6">

                            <h3 className="text-2xl font-bold text-gray-800">Rezervare Rapidă</h3>

                            <button onClick={() => setIsRentOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-2xl">✕</button>

                        </div>



                        {/* SECTIUNEA B-5: LEVEL UP */}

                        <div className="mb-8 border-b pb-6">

                            <div className="flex items-center gap-2 mb-3">

                                <span className="bg-red-100 text-red-600 p-1 rounded text-xl">🚀</span>

                                <div><h4 className="font-bold text-gray-800 text-lg">Level Up! Biciclete Premium</h4><p className="text-xs text-gray-500">Modele mai performante decât tot ce ai închiriat până acum.</p></div>

                            </div>

                            {upgradeBikes.length > 0 ? (

                                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">

                                    {upgradeBikes.map((bike, index) => (

                                        <div key={index} onClick={() => { setRentCode(bike.Cod); setRentLoc(bike.Locatie); }} className="min-w-[150px] bg-gradient-to-br from-gray-50 to-white border border-red-200 p-3 rounded-xl shadow-sm hover:border-red-500 hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1 relative group">

                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">PRO</div>

                                            <p className="font-mono font-bold text-gray-900 text-lg mb-1">{bike.Cod}</p>

                                            <div className="flex justify-between items-end"><span className="text-xs text-gray-500 truncate max-w-[80px]">{bike.Locatie}</span><span className="text-red-600 font-bold text-sm">{bike.Pret} Lei</span></div>

                                            <div className="mt-2 text-center text-xs text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition">Alege ↓</div>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"><p className="text-gray-500 text-sm italic">Nu există biciclete mai performante disponibile momentan. <br/>(Ai gusturi de top! )</p></div>

                            )}

                        </div>



                        {/* SECTIUNEA 2: FORMULAR */}

                        <div className="space-y-4">

                            <div>

                                <label className="block text-sm font-bold text-gray-700 mb-1">Locație Preluare</label>

                                <select value={rentLoc} onChange={(e) => setRentLoc(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">

                                    <option value="">-- Alege Locația --</option>

                                    {locationNames.map((name, idx) => (<option key={idx} value={name}>{name}</option>))}

                                </select>

                            </div>

                            <div>

                                <label className="block text-sm font-bold text-gray-700 mb-1">Cod Bicicletă</label>

                                <input type="text" placeholder="Ex: BC005" value={rentCode} onChange={(e) => setRentCode(e.target.value)} className="w-full border border-gray-300 rounded p-2 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>

                            </div>

                            <div>

                                <label className="block text-sm font-bold text-gray-700 mb-1">Data și Ora Start</label>

                                <input type="datetime-local" value={rentDate} min={getLocalISOString()} onChange={(e) => setRentDate(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>

                            </div>

                            <button onClick={handleConfirmReservation} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg mt-4">Confirmă Rezervarea</button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};



export default HomePage; 