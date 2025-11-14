// --- Card ---
import React from 'react';
const Card = ({ title, description, buttonLabel, onClick }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 transform hover:translate-y-[-2px]">
        <h4 className="text-xl font-bold text-indigo-600 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mt-2 h-12">{description}</p>
        <button 
            onClick={onClick}
            className="mt-4 w-full py-2 px-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition duration-300 text-sm">
            {buttonLabel}
        </button>
    </div>
);
export default Card;