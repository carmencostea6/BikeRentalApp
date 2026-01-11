import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Configurare Iconuri Leaflet (pentru a evita problemele cu imaginile implicite)
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationsPage = ({ title, user }) => {
    // Coordonatele locațiilor din baza de date - locatii puse de mine ca exemplu
    const locatiiBucuresti = [
        { id: 1, nume: "Piața Romană", adresa: "Bd. Dorobanți 50, Sector 1", coords: [44.4473, 26.0972] },
        { id: 2, nume: "Universitate", adresa: "Bd. Regina Elisabeta 3, Sector 3", coords: [44.4355, 26.1025] },
        { id: 3, nume: "Herăstrău", adresa: "Sos. Nordului 1, Sector 1", coords: [44.4705, 26.0886] },
        { id: 4, nume: "Obor", adresa: "Sos. Colentina 2, Sector 2", coords: [44.4503, 26.1278] },
        { id: 5, nume: "Tineretului", adresa: "Bd. Tineretului 10, Sector 4", coords: [44.4140, 26.1060] }
    ];

    // Centrul Bucurestiului pentru vizualizare initiala
    const centerPosition = [44.439663, 26.096306];

    return (
        <div className="max-w-7xl mx-auto mt-8 mb-10 px-4">
            
            {/* Header Pagina */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-8 border-indigo-600 mb-6 text-left flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">🗺️ Harta Stațiilor</h2>
                    <p className="text-gray-600 mt-1">Găsește cea mai apropiată stație de închiriere din București.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-indigo-800">Utilizator conectat:</p>
                    <p className="text-indigo-600">{user?.Nume} {user?.Prenume}</p>
                </div>
            </div>

            {/* Harta */}
            <div className="bg-white p-2 rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <MapContainer 
                    center={centerPosition} 
                    zoom={13} 
                    scrollWheelZoom={true} 
                    style={{ height: "600px", width: "100%", borderRadius: "0.75rem" }}
                >
                    {/* Layer-ul de harta  */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Generare Pini (Markers) */}
                    {locatiiBucuresti.map((loc) => (
                        <Marker key={loc.id} position={loc.coords}>
                            <Popup>
                                <div className="text-center p-1">
                                    <h3 className="font-bold text-indigo-700 text-lg">{loc.nume}</h3>
                                    <p className="text-sm text-gray-600 my-1">📍 {loc.adresa}</p>
                                    <div className="mt-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded inline-block border border-green-200">
                                        Deschis 24/7
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div className="mt-6 text-center text-gray-400 text-sm">
                * Poți da zoom in/out și poți trage de hartă pentru a explora. Dă click pe un pin pentru detalii.
            </div>
        </div>
    );
};

export default LocationsPage;