#  Bike Rental App

O aplicație web full-stack pentru gestionarea unui sistem de închiriere de biciclete (bike-sharing) în
București.

## 1. Obiectivul Aplicației

* Aplicația permite utilizatorilor înregistrați să închirieze biciclete dintr-o rețea de stații automate.
Utilizatorii pot ridica o bicicletă dintr-o locație și o pot returna în oricare altă locație din rețea.

* Sistemul gestionează autentificarea clienților, stocul de biciclete la locații, procesul de închiriere și
calculul automat al costurilor și penalizărilor (în cazul depășirii timpului limită). Plata se efectuează
exclusiv online.

## 2. Tehnologii Utilizate

* Arhitectura aplicației este separată între frontend, backend și baza de date.


1.Frontend: 
* React:construit cu Vite, utilizează React Hooks și rutare bazată pe stare.
* Stilizare:Tailwind CSS Folosit pentru design-ul interfeței (utility-first CSS).
2.Backend 
* Python:limbajul de bază pentru logica server-ului.
* Framework:Flask Framework micro-web pentru crearea API-ului RESTful (cu Blueprints).
3.Baza de Date 
* MS SQL Server:Baza de date relațională (SGBD) pentru stocarea datelor.
* Conector BD:pyodbc Driverul ODBC Python pentru conectarea la SQL Server.

## 3. Arhitectura Proiectului

Proiectul este împărțit în două directoare principale:

1. /frontend
* Conține aplicația client React (inițializată cu Vite).
* Gestionează interfața cu utilizatorul (UI) și experiența utilizatorului (UX).
* Comunică cu backend-ul printr-un API RESTful.
* Structură:


```
/src/components: Componente reutilizabile (NavBar, Card, InputField).
/src/pages: Componente principale (AuthPage, HomePage).
/src/utils: Fișiere de configurare (constante, URL-ul API).
App.jsx: Fișierul root care gestionează starea globală și rutarea.
```
2./backend
* Conține serverul Flask (Python).
* Gestionează logica de business, conexiunea la baza de date și rutele API.
* Folosește o structură de Blueprints pentru a separa logic rutele.
* Structură:
```
/app: Conține logica aplicației.
/routes: Blueprints (ex: auth.py pentru autentificare).
db.py: Logica de conexiune pyodbc.
__init__.py: Funcția "Application Factory" (create_app).
config.py: Fișierul de configurare (chei secrete, string-ul de conexiune).
main.py: Punctul de intrare pentru rularea serverului.
```

3.Baza de Date
* Baza de date BikeRental este găzduită pe MS SQL Server (Express 2019).
* Structura BD conține 7 tabele principale: Clienti, Locatii, Biciclete, Accesorii,
AccesoriiBiciclete, Inchirieri, Plati.

## 4. Instrucțiuni de Instalare și Rulare

* Pentru a rula aplicația local, sunt necesare următoarele componente: Python, Node.js, MS SQL Server
și driverul ODBC.

A. Cerințe Preliminare
* Node.js & npm: Descarcă și instalează Node.js.
* Python: Descarcă și instalează Python.
* MS SQL Server: Instalează o versiune (ex: Express 2019) și SSMS (SQL Server Management
Studio).
* Driver ODBC: Descarcă și instalează Microsoft ODBC Driver 17 for SQL Server.

B. Configurare Bază de Date

1. Deschide SSMS și conectează-te la instanța ta (ex: .\SQLEXPRESS).
2. Creează o bază de date nouă numită BikeRental.


3. Rulează tabelele conform diagamei din documentul pdf.
4. Rulează scriptul SQL de populare a datelor.

C. Rulare Backend (Python)

1. Deschide un terminal și navighează în folderul backend.
2. (Recomandat) Creează un mediu virtual:

```
python -m venv venv
.\venv\Scripts\activate
```
3. Instalează dependențele:

```
pip install Flask flask-cors pyodbc
```
4. Configurează Conexiunea:
    * Deschide backend/config.py.
   *  Verifică dacă SERVER = r'.\SQLEXPRESS' corespunde numelui serverului tău din SSMS.
5. Rulează serverul:

```
python main.py
```
```
Serverul va rula pe http://localhost:5000.
```
D. Rulare Frontend (React)

1. Deschide un alt terminal și navighează în folderul frontend.
2. Instalează dependențele (prima dată):

```
npm install
```
3. Pornește serverul de dezvoltare Vite:

```
npm run dev
```
```
* Aplicația va fi accesibilă în browser la http://localhost:5173.
```

## 5. Funcționalități

### Implementate
* Structură Proiect: Frontend (React) și Backend (Flask) separate.
* Bază de Date: Structură relațională complexă (7 tabele) în MSSQL.
* Autentificare API:
  * Creare cont client (Înregistrare), cu validare NOT NULL și câmpuri opționale.
  * Autentificare client (Login) pe baza Email și Parola.
  * Delogare (Logout) și gestionarea sesiunii.
* Interfață Utilizator:
  * Sistem de rutare bazat pe stare (Login / Dashboard).
  *Afișare/ascundere parolă.
  * Notificări dinamice pentru succes sau eroare.

 ### Funcționalități Viitoare (To-Do)
* Gestionare Cont: Implementarea paginii "Contul Meu" (funcționalitate UPDATE pe tabela
Clienti).
* Vizualizare Locații: Crearea paginii "Locații" pentru a afișa stațiile și stocul de biciclete (SELECT
cu JOIN pe Biciclete).
* Procesul de Închiriere:
  * Implementarea funcției INSERT în tabela Inchirieri.
  * Implementarea funcției UPDATE pe starea bicicletei (din 'liber' în 'închiriat').
*Istoric & Plăți:
 *Afișarea istoricului de închirieri pentru clientul logat (Interogare simplă cu JOIN pe
Inchirieri, Plati, Biciclete).
 *Calcularea automată a costului final și a penalizărilor.
* Statistici (Interogări Complexe):
  * Implementarea unor statistici relevante (ex: "Cele mai aglomerate stații", "Clienții cei mai
activi") conform cerințelor proiectului.
* Panou de Administrare:
  * Crearea unei secțiuni separate pentru administrarea bicicletelor și locațiilor (INSERT,
UPDATE, DELETE pe tabelele de bază).


