from flask import Blueprint, request, jsonify
from app.db import get_db_connection, close_db_connection
from datetime import datetime
import math

rent_bp = Blueprint('rent_api', __name__, url_prefix='/api/rent')

# --- 1. GET LOCATII (Pentru Dropdown) ---
@rent_bp.route('/locations', methods=['GET'])
def get_locations():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT NumeLocatie FROM Locatii")
        locations = [row[0] for row in cursor.fetchall()]
        return jsonify(locations)
    except Exception as e:
        return jsonify([]), 500
    finally:
        close_db_connection(conn, cursor)

# --- 2. GET BICICLETE LIBERE (Cu Pret si Accesorii) ---
@rent_bp.route('/available', methods=['GET'])
def get_available_bikes():
    location_name = request.args.get('location')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT LocatieID FROM Locatii WHERE NumeLocatie = ?", (location_name,))
        res = cursor.fetchone()
        if not res: return jsonify([]), 404
        loc_id = res[0]

        # Selectez bicicletele libere si accesoriile lor
        query = """
            SELECT 
                B.cod, 
                B.PretBicicleta,
                A.Denumire,
                A.PretAccesoriu
            FROM Biciclete B
            LEFT JOIN AccesoriiBiciclete AB ON B.BicicletaID = AB.BicicletaID
            LEFT JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
            WHERE B.LocatieID = ? AND B.Stare = 'liber'
        """
        cursor.execute(query, (loc_id,))
        
        bikes_map = {}
        
        for row in cursor.fetchall():
            cod = row[0]
            pret_b = float(row[1])
            acc_nume = row[2]
            acc_pret = float(row[3]) if row[3] is not None else 0
            
            if cod not in bikes_map:
                bikes_map[cod] = {
                    'cod': cod,
                    'pret_ora': pret_b,
                    'accesorii': [],
                    'cost_accesorii': 0
                }
            
            if acc_nume:
                bikes_map[cod]['accesorii'].append(f"{acc_nume} (+{acc_pret} lei)")
                bikes_map[cod]['cost_accesorii'] += acc_pret

        final_list = []
        for b in bikes_map.values():
            acc_str = ", ".join(b['accesorii']) if b['accesorii'] else "Fără accesorii"
            display = f"{b['cod']} | {b['pret_ora']} Lei/h | {acc_str}"
            final_list.append({
                'cod': b['cod'],
                'pret': b['pret_ora'],
                'display': display
            })
            
        return jsonify(final_list)
    except Exception as e:
        print(e)
        return jsonify([]), 500
    finally:
        close_db_connection(conn, cursor)

# --- 3. START CURSA ---
@rent_bp.route('/start', methods=['POST'])
def start_ride():
    data = request.json
    client_id = data.get('client_id')
    loc_nume = data.get('locatie')
    bike_cod = data.get('bicicleta')
    card = data.get('card')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT LocatieID FROM Locatii WHERE NumeLocatie = ?", (loc_nume,))
        loc_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT BicicletaID FROM Biciclete WHERE cod = ?", (bike_cod,))
        bike_id = cursor.fetchone()[0]
        cursor.execute("""
            INSERT INTO Inchirieri (ClientID, BicicletaID, LocatieStartID, LocatieFinalID, DataStart)
            OUTPUT INSERTED.InchiriereID
            VALUES (?, ?, ?, ?, GETDATE())
        """, (client_id, bike_id, loc_id, loc_id))
        rent_id = cursor.fetchone()[0]

        # Update Bicicleta
        cursor.execute("UPDATE Biciclete SET Stare = 'inchiriat' WHERE BicicletaID = ?", (bike_id,))

        # Insert Plata
        cursor.execute("""
            INSERT INTO Plati (InchiriereID, NrCard, DataExpirareCard, CVV, Suma)
            VALUES (?, ?, ?, ?, 0)
        """, (rent_id, card['nr'], card['exp'], card['cvv']))

        conn.commit()
        return jsonify({'success': True, 'rent_id': rent_id, 'start_time': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)

# --- 4. STOP CURSA ---
@rent_bp.route('/stop', methods=['POST'])
def stop_ride():
    data = request.json
    rent_id = data.get('rent_id')
    loc_nume = data.get('locatie_stop')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Gasesc ID-ul locatiei de stop
        cursor.execute("SELECT LocatieID FROM Locatii WHERE NumeLocatie = ?", (loc_nume,))
        loc_stop_id = cursor.fetchone()[0]

        # 2. Iau datele inchirierii + Pret Bicicleta + Penalizare 
        cursor.execute("""
            SELECT I.DataStart, B.PretBicicleta, I.PretPenalizare, B.BicicletaID
            FROM Inchirieri I
            JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
            WHERE I.InchiriereID = ?
        """, (rent_id,))
        row = cursor.fetchone()
        
        start_time, pret_bicicleta, pret_penalizare , bike_id = row
        end_time = datetime.now()
        
        # 3. Calculez pretul accesoriilor
        cursor.execute("""
            SELECT SUM(A.PretAccesoriu) 
            FROM AccesoriiBiciclete AB
            JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
            WHERE AB.BicicletaID = ?
        """, (bike_id,))
        acc_row = cursor.fetchone()
        pret_accesorii = float(acc_row[0]) if acc_row[0] is not None else 0.0
        

        # 4. Calculez Durata
        durata_secunde = (end_time - start_time).total_seconds()
        durata_minute = int(durata_secunde / 60)
        durata_ore_taxabile = math.ceil(durata_secunde / 3600)
        if durata_ore_taxabile < 1: durata_ore_taxabile = 1 # Minim o ora

        # 5. FORMULA  DE PRET
        # Pret = Pret_bicicleta + (Ore * Penalizare) + Accesorii
        cost_bicicleta = durata_ore_taxabile * float(pret_penalizare) + float(pret_bicicleta)
        total_plata = cost_bicicleta + pret_accesorii

        # 6. Update DB
        cursor.execute("UPDATE Inchirieri SET DataFinal = GETDATE(), LocatieFinalID = ? WHERE InchiriereID = ?", (loc_stop_id, rent_id))
        cursor.execute("UPDATE Biciclete SET Stare = 'liber', LocatieID = ? WHERE BicicletaID = ?", (loc_stop_id, bike_id))
        cursor.execute("UPDATE Plati SET Suma = ? WHERE InchiriereID = ?", (total_plata, rent_id))

        conn.commit()
        
        # Returnez durata in minute 
        return jsonify({
            'success': True, 
            'total': total_plata, 
            'durata': f"{durata_minute} min", 
            'detalii': f"Bicicletă: {cost_bicicleta} lei + Accesorii: {pret_accesorii} lei"
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)