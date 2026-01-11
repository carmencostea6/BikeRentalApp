import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Save, Lock, Ban } from 'lucide-react';

// --- 1. CONFIGURARE TABELE SI PERMISIUNI AVANSATE ---
const TABLE_SETTINGS = {
    'Clienti': {
        pk: 'ClientID',
        canAdd: true, canEdit: true, canDelete: true,
        required: ['Nume', 'Prenume', 'CNP', 'Telefon', 'Email', 'Parola', 'Sex'],
        // Fara  restrictionate aici
    },
    'Biciclete': {
        pk: 'BicicletaID',
        canAdd: true, canEdit: true, canDelete: true,
        required: ['PretBicicleta', 'LocatieID', 'Stare', 'cod'],
    },
    'Accesorii': {
        pk: 'AccesoriuID',
        canAdd: true, canEdit: true, canDelete: true,
        required: ['Denumire', 'PretAccesoriu']
    },
    'AccesoriiBiciclete': {
        pk: 'AccesoriiBicicleteID',
        canAdd: true, canEdit: true, canDelete: true,
        required: ['BicicletaID', 'AccesoriuID'],
        readOnlyInEdit: ['BicicletaID', 'AccesoriuID'] 
    },
    'Locatii': {
        pk: 'LocatieID',
        canAdd: false, canEdit: true, canDelete: false, 
        required: ['NumeLocatie'],
        // NrBiciclete e calculat automat de SQL Trigger, adminul nu-l atinge!
        hiddenInForm: ['NrBiciclete'] 
    },
    'Inchirieri': {
        pk: 'InchiriereID',
        canAdd: false, canEdit: true, canDelete: false, 
        editableFields: ['PretPenalizare', 'LocatieStopID'], 
        required: []
    },
    'Plati': {
        pk: 'PlataID',
        canAdd: false, canEdit: false, canDelete: false, 
        required: []
    }
};

// --- 2. CONFIGURARE DROPDOWNS ---
const COLUMN_CONFIG = {
    'Sex': { type: 'select', options: ['F', 'M'], defaultValue: 'F' },
    'Stare': { type: 'select', options: ['liber', 'inchiriat', 'in reparatii'], defaultValue: 'liber' },
    'Rol': { type: 'select', options: ['user', 'admin'], defaultValue: 'user' }
};

const AdminDashboard = () => {
    const [activeTable, setActiveTable] = useState('Clienti');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null); 
    const [formData, setFormData] = useState({});

    const settings = TABLE_SETTINGS[activeTable]; 

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/admin/${activeTable}`);
            if (res.ok) setData(await res.json());
            else alert("Eroare la încărcarea datelor.");
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [activeTable]);

    // --- DELETE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Sigur vrei să ștergi?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/admin/${activeTable}/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (res.ok) {
                alert(json.message);
                fetchData();
            } else {
                alert("Eroare: " + json.error);
            }
        } catch (e) { alert("Eroare rețea"); }
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validare campuri obligatorii (doar la Adaugare)
        if (!editItem) {
            for (let field of (settings.required || [])) {
                if (!formData[field] || String(formData[field]).trim() === '') {
                    alert(`Câmpul '${field}' este obligatoriu!`);
                    return;
                }
            }
        }

        const isEdit = !!editItem;
        const pk = settings.pk;
        const url = `http://127.0.0.1:5000/api/admin/${activeTable}` + (isEdit ? `/${editItem[pk]}` : '');
        const method = isEdit ? 'PUT' : 'POST';

        const payload = { ...formData };
        if (payload[pk]) delete payload[pk];

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (res.ok) {
                alert(json.message);
                setIsModalOpen(false);
                fetchData();
            } else {
                alert("Eroare Server: " + (json.error || json.message));
            }
        } catch (e) { console.error(e); alert("Eroare la salvare."); }
    };

    // --- OPEN MODAL ---
    const openModal = (item = null) => {
        setEditItem(item);
        if (item) {
            // Edit Mode
            if (settings.editableFields) {
                const filteredData = {};
                settings.editableFields.forEach(field => {
                    filteredData[field] = item[field];
                });
                setFormData(filteredData);
            } else {
                setFormData({ ...item });
            }
        } else {
            // Add Mode
            const structure = data.length > 0 ? { ...data[0] } : {};
            Object.keys(structure).forEach(k => {
                if (COLUMN_CONFIG[k] && COLUMN_CONFIG[k].defaultValue) {
                    structure[k] = COLUMN_CONFIG[k].defaultValue;
                } else {
                    structure[k] = '';
                }
            });
            setFormData(structure);
        }
        setIsModalOpen(true);
    };

    // --- RENDER INPUT ---
    const renderInput = (key) => {
        // 1. Verific campuri ascunse
        if (key === settings.pk) return null;
        if (settings.hiddenInForm && settings.hiddenInForm.includes(key)) return null;
        
        // 2. Verific whitelisting pentru Edit (ex: Inchirieri)
        if (editItem && settings.editableFields && !settings.editableFields.includes(key)) {
            return null;
        }

        const config = COLUMN_CONFIG[key];
        const isRequired = settings.required?.includes(key);
        
        // 3. Verific daca e READ-ONLY in mod EDIT (ex: BicicletaID in AccesoriiBiciclete)
        const isReadOnly = editItem && settings.readOnlyInEdit && settings.readOnlyInEdit.includes(key);

        const inputProps = {
            value: formData[key] || '',
            onChange: (e) => setFormData({...formData, [key]: e.target.value}),
            disabled: isReadOnly,
            className: `border rounded p-2 w-full outline-none focus:ring-2 focus:ring-indigo-500 
                ${isReadOnly ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300' : 'bg-white border-gray-300'}`
        };

        // RENDER: Dropdown
        if (config && config.type === 'select' && !isReadOnly) {
            return (
                <div key={key} className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">
                        {key} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <select {...inputProps} className="border border-gray-300 rounded p-2 bg-white">
                        {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            );
        }

        // RENDER: Date
        if (key.includes('Data') && !isReadOnly) {
             return (
                <div key={key} className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">{key}</label>
                    <input type="datetime-local" {...inputProps} 
                           value={formData[key] ? String(formData[key]).replace(' ', 'T').slice(0,16) : ''} />
                </div>
             );
        }

        // RENDER: Standard Text
        return (
            <div key={key} className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    {key} 
                    {isRequired && !isReadOnly && <span className="text-red-500">*</span>}
                    {isReadOnly && <Lock className="w-3 h-3 text-gray-400" />}
                </label>
                <input type="text" {...inputProps} placeholder={isReadOnly ? "Ineditabil" : (isRequired ? "Obligatoriu" : "Opțional")} />
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-gray-900 text-white p-6 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-2">🛡️ Panou Administrator</h1>
                    <div className="text-sm opacity-70">Control complet asupra bazei de date</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
                    {Object.keys(TABLE_SETTINGS).map(table => (
                        <button key={table} onClick={() => setActiveTable(table)} 
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTable === table ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {table}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Gestionare {activeTable}</h2>
                    {settings.canAdd && (
                        <button onClick={() => openModal(null)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow transition">
                            <Plus className="w-5 h-5" /> Adaugă
                        </button>
                    )}
                </div>

                {/* Table Grid */}
                {loading ? <p className="text-center py-10">Se încarcă datele...</p> : (
                    <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-800 text-white uppercase">
                                <tr>
                                    {data.length > 0 && Object.keys(data[0]).map(key => (<th key={key} className="py-3 px-4 text-left font-semibold">{key}</th>))}
                                    <th className="py-3 px-4 text-center">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        {Object.values(row).map((val, i) => (<td key={i} className="py-3 px-4 text-gray-700 truncate max-w-xs">{String(val)}</td>))}
                                        <td className="py-3 px-4 flex justify-center gap-2">
                                            {settings.canEdit ? (
                                                <button onClick={() => openModal(row)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit className="w-4 h-4" /></button>
                                            ) : (
                                                <Ban className="w-4 h-4 text-gray-300 cursor-not-allowed" />
                                            )}
                                            
                                            {settings.canDelete && (
                                                <button onClick={() => handleDelete(row[settings.pk])} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (<tr><td colSpan="100%" className="text-center py-8 text-gray-500">Nicio înregistrare găsită.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{editItem ? 'Editare' : 'Adăugare'} {activeTable}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 gap-4">
                            {Object.keys(formData).map(key => renderInput(key))}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Anulează</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4" /> Salvează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;