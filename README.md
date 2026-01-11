# BikeRental App
* BikeRental este o aplicație Full-Stack pentru gestionarea unui sistem de închiriere de biciclete într-o rețea de stații automatizate. Sistemul gestionează întregul flux, de la autentificare și rezervare, până la calculul plății în funcție de durată și penalizări.

## Tehnologii Utilizate
Proiectul este construit folosind o arhitectură modulară:

* Frontend: React.js (JavaScript, Tailwind CSS)

* Backend: Python (Flask)

* Bază de Date: Microsoft SQL Server 2019 (gestionată prin SSMS)

## Funcționalități Principale
 ### Modul Client
* **Dashboard Interactiv** : Vizualizare statistici personale (timp total pedalat, status VIP bazat pe cheltuieli).

* **Harta Stațiilor** : Identificarea vizuală a stațiilor de închiriere din oraș.

* **Închiriere Live**:
    * Selectarea locației de start și a bicicletei (cu opțiuni de filtrare pentru accesorii).
    * Cronometru în timp real pentru cursa în desfășurare.
    * Calcul automat al costului la finalizare: PretBicicleta + PretAccesoriu + (DataFinal - DataStart) * PretPenalizare.

* **Statistici Complexe**:
    * Vizualizarea istoricului de închirieri și plăți.
    * Recomandări de biciclete "Low Budget" sau "Level Up" (modele mai performante decât istoricul utilizatorului).

### Modul Administrator
* **CRUD** Complet: Gestionarea tabelelor din baza de date (Clienți, Biciclete, Accesorii, Locații).
* Gestiune Flotă: Adăugarea de biciclete noi, modificarea prețurilor sau a stării acestora (liber/închiriat/reparații).

## Structura Bazei de Date
 Aplicația utilizează o bază de date relațională robustă, incluzând:

* Tabele: Clienti, Biciclete, Locatii, Inchirieri, Plati, Accesorii, AccesoriiBiciclete (pentru relația Many-to-Many).

* Constrângeri: Chei primare și străine, constrângeri de integritate (CHECK pentru date/CNP/Telefon, DEFAULT pentru statusuri).

* Automatizare: Triggere pentru actualizarea automată a numărului de biciclete din stații la închiriere/returnare.

## Instalare și Rulare
1. Configurare Bază de Date
* Asigură-te că ai instalat Microsoft SQL Server.

* Importă scriptul SQL din folderul /database sau execută query-urile de creare a tabelelor.

* Actualizează string-ul de conectare în fișierul de configurare al backend-ului (app.py sau config.py).

2. Backend (Python)
' ' '
cd backend
# Creare mediu virtual (opțional)
python -m venv venv
# Instalare dependențe
pip install -r requirements.txt
# Rulare server
python app.py
' ' '
3. Frontend (React)
' ' '
cd frontend
# Instalare dependențe node
npm install
# Pornire aplicație
npm run dev
' ' '