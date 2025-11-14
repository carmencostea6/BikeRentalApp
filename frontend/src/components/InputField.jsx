// --- InputField ---
import React from 'react';
const InputField = ({ label, type, name, value, onChange, required, maxLength }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 text-left">
            {label} 
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required} 
            maxLength={maxLength}
            // Am marit padding-ul vertical (py-3) pentru a face loc iconitei
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-white" 
        />
    </div>
);
export default InputField;