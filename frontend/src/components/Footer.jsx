import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner border-t border-gray-200 py-6 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          
          {/* Partea Stanga: Detalii Companie */}
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h4 className="text-lg font-extrabold text-indigo-900 tracking-wider flex items-center justify-center md:justify-start gap-2">
              BikeRental S.R.L.
            </h4>
            <p className="text-gray-500 mt-1">Cea mai rapidă cale de a explora orașul.</p>
          </div>

          {/* Partea Dreapta: Contact */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
            
            {/* Email */}
            <div className="flex items-center group cursor-pointer">
              <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <Mail className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium group-hover:text-indigo-600 transition">contact@bikerental.ro</span>
            </div>

            {/* Telefon */}
            <div className="flex items-center group cursor-pointer">
              <div className="bg-green-50 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition duration-300">
                <Phone className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium group-hover:text-green-600 transition">+40 731 479 701</span>
            </div>

             {/* Locatie */}
             <div className="flex items-center group cursor-pointer">
              <div className="bg-red-50 p-2 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition duration-300">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium group-hover:text-red-600 transition">București, Sector 1</span>
            </div>

          </div>
        </div>

        {/* Linia de copyright */}
        <div className="border-t border-gray-100 mt-6 pt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} BikeRental App. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
};

export default Footer;