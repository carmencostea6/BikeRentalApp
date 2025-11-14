import React from 'react';
// --- DummyPage ---
const DummyPage = ({ title, user }) => (
    <div className="bg-white p-10 rounded-xl shadow-2xl border-t-4 border-indigo-500 text-center mt-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600">Această pagină este în construcție.</p>
        <p className="text-sm mt-4 text-indigo-600">Autentificat ca: {user?.NumeComplet}</p>
    </div>
);
export default DummyPage;