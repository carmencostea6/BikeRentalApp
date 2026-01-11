# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify, session
import pyodbc
import re 
from app.db import get_db_connection, close_db_connection 

auth_bp = Blueprint('auth_api', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Ruta pentru inregistrarea unui client nou."""
    data = request.json
    print(f">>> Date primite pentru INREGISTRARE: {data}")

    # Extrag toate datele din payload
    email = data.get('email')
    parola = data.get('parola')
    nume = data.get('nume')
    prenume = data.get('prenume')
    cnp = data.get('cnp')
    telefon = data.get('telefon')
    sex = data.get('sex')
    
    strada = data.get('strada') or None
    numar_raw = data.get('numar') # ca string
    oras = data.get('oras') or None
    # --- Incep Validari ---
    if not all([email, parola, nume, prenume, cnp, telefon, sex]):
        print("!!! Eroare: Campuri obligatorii lipsa.")
        return jsonify({"success": False, "message": "Câmpurile marcate cu * sunt obligatorii."}), 400
    
    # Validare Telefon
    if not re.fullmatch(r"07\d{8}", telefon):
        print("!!! Telefon invalid.")
        return jsonify({
            "success": False,
            "message": "Numărul de telefon este invalid. Trebuie să aibă 10 cifre și să înceapă cu '07'."
        }), 400
    
    # Validare CNP
    def cnp_valid(cnp):
        if len(cnp) != 13 or not cnp.isdigit():
            return False, "CNP-ul trebuie să conțină exact 13 cifre."
        if cnp[0] not in "123456": # Simplificare - doar verific prima cifra
            return False, "Prima cifră a CNP-ului este invalidă."
        return True, None
    
    valid, err = cnp_valid(cnp)
    if not valid:
        print(f"!!! CNP invalid: {err}")
        return jsonify({"success": False, "message": err}), 400
        
    # Validare Numar (pentru a fi int sau NULL)
    numar = None
    if numar_raw and str(numar_raw).strip(): 
        try:
            numar = int(numar_raw)
        except ValueError:
            print("!!! Eroare: Numarul strazii nu este un integer valid.")
            return jsonify({"success": False, "message": "Câmpul 'Număr' trebuie să fie un număr valid (sau lăsat gol)."}), 400


    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Eroare interna la conexiunea cu baza de date."}), 500

    cursor = conn.cursor()
    
    try:
        # 1. Verifica daca email-ul exista deja
        print(">>> Verificare Email...")
        cursor.execute("SELECT ClientID FROM Clienti WHERE Email = ?", (email,))
        if cursor.fetchone():
            print("!!! Eroare: Email deja existent.")
            return jsonify({"success": False, "message": "Email-ul este deja înregistrat."}), 409
        
        # 2. Verifica daca CNP-ul exista deja
        print(">>> Verificare CNP...")
        cursor.execute("SELECT ClientID FROM Clienti WHERE CNP = ?", (cnp,))
        if cursor.fetchone():
            print("!!! Eroare: CNP deja existent.")
            return jsonify({"success": False, "message": "CNP-ul este deja înregistrat."}), 409

        # 3. Inserarea noului client
        print(">>> Inserare client nou (cu adresa)...")
        sql_insert = """
        INSERT INTO Clienti (Nume, Prenume, CNP, Sex, Telefon, Email, Parola, Strada, Numar, Oras) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (nume, prenume, cnp, sex, telefon, email, parola, strada, numar, oras)
        
        cursor.execute(sql_insert, params)
        conn.commit()
        
        print(">>> Client inregistrat cu succes!")
        return jsonify({"success": True, "message": "Înregistrare reușită! Vă puteți autentifica."}), 201

    except pyodbc.IntegrityError as e:
        print(f"!!! Eroare Integritate BD: {e}")
        return jsonify({"success": False, "message": "Eroare la inserarea datelor (verifica CNP sau formatul datelor)."}), 400
    
    except pyodbc.Error as e:
        print(f"!!! Eroare PYODBC (posibil Truncare): {e}")
        if e.args[0] == '22001':
            return jsonify({"success": False, "message": "Datele introduse sunt prea lungi pentru un câmp."}), 400
        return jsonify({"success": False, "message": f"Eroare SQL: {str(e)}"}), 500
        
    except Exception as e:
        print(f"!!! Eroare neasteptata la inregistrare: {e}")
        return jsonify({"success": False, "message": "Eroare internă la înregistrare."}), 500
    finally:
        close_db_connection(conn, cursor)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    parola = data.get('parola')
    print(f">>> Date primite pentru LOGIN: {data}")

    if not all([email, parola]):
        return jsonify({"success": False, "message": "Email-ul și parola sunt obligatorii."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Eroare interna la conexiunea cu baza de date."}), 500

    cursor = conn.cursor()

    try:
        print(">>> Cautare client...")
        #  Selectez si 'Rol' ( ISNULL - fallback daca rolul e NULL)
        cursor.execute("""
            SELECT ClientID, Nume, Prenume, ISNULL(Rol, 'user') as Rol 
            FROM Clienti 
            WHERE Email = ? AND Parola = ?
        """, (email, parola))
        
        client = cursor.fetchone()
        
        if client:
            print(f">>> Client gasit! Rol: {client.Rol}")
            session['logged_in'] = True
            session['client_id'] = client.ClientID
            session['nume'] = client.Nume.strip()
            session['prenume'] = client.Prenume.strip()
            session['rol'] = client.Rol.strip() 

            return jsonify({
                "success": True,
                "message": "Autentificare reușită!",
                "user": {
                    "ClientID": client.ClientID,
                    "NumeComplet": f"{client.Nume.strip()} {client.Prenume.strip()}",
                    "Nume": client.Nume.strip(),
                    "Prenume": client.Prenume.strip(),
                    "Rol": client.Rol.strip() 
                }
            }), 200
        else:
            print("!!! Eroare: Email sau parola incorecte.")
            return jsonify({"success": False, "message": "Email sau parolă incorecte."}), 401

    except Exception as e:
        print(f"!!! Eroare neasteptata la autentificare: {e}")
        return jsonify({"success": False, "message": "Eroare internă la autentificare."}), 500
    finally:
        close_db_connection(conn, cursor)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Ruta pentru delogare."""
    print(">>> Delogare utilizator.")
    session.clear() 
    return jsonify({"success": True, "message": "Delogare reușită."}), 200