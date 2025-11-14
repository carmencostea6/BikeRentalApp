import React from 'react';
// --- NavButton ---
const NavButton = ({ view, currentView, icon: Icon, label, onClick }) => (
    <button
        onClick={() => onClick(view)}
        className={`px-4 py-2 rounded-full text-sm font-bold transition duration-150 flex items-center shadow-sm 
        ${currentView === view ? 'bg-indigo-600 text-white shadow-indigo-400' : 'text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50'}`}
    >
        <Icon className="w-4 h-4 mr-1" />
        {label}
    </button>
);
export default NavButton;
