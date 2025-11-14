// --- HomePage ---
import React from 'react';
import Card from '../components/Card.jsx';

const HomePage = ({ user, showMessage }) => (
    <div className="max-w-7xl mx-auto">
        <div className="bg-white p-10 rounded-xl shadow-2xl border-t-8 border-indigo-600 mt-8 text-left">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
            Dashboard Client
          </h2>
          
          <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-200 shadow-lg">
            <p className="text-2xl text-indigo-800 font-bold">Bine ai venit, {user ? user.Prenume : 'Client'}!</p>
            <p className="text-md text-indigo-600 mt-2">Acum poți începe o nouă închiriere sau gestiona contul tău.</p>
            <p className="text-sm text-gray-500 mt-4">ID de sesiune (ClientID): {user?.ClientID}</p>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-5">Opțiuni Rapide</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Închiriază o Bicicletă" description="Găsește cea mai apropiată locație și pornește o nouă închiriere." buttonLabel="Start Închiriere" onClick={() => showMessage(true, "Logica de închiriere se va implementa aici!")} />
            <Card title="Vizualizare Locații" description="Vezi stocul de biciclete disponibil la fiecare stație din oraș." buttonLabel="Vezi Locațiile" onClick={() => showMessage(true, "Navigare către pagina Locații (TBD)")} />
            <Card title="Istoric & Plăți" description="Verifică închirierile anterioare și plătește penalizările acumulate." buttonLabel="Vezi Istoricul" onClick={() => showMessage(true, "Logica de Istoric se va implementa aici!")} />
          </div>
        </div>
    </div>
);
export default HomePage;