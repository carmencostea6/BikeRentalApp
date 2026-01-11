from flask import Blueprint, jsonify, request
from app.db import get_db_connection

dashboard_bp = Blueprint('dashboard', __name__)

# --- INTEROGARE A-1: Istoric Inchirieri ---
@dashboard_bp.route('/history/<int:client_id>', methods=['GET'])
def get_rental_history(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                B.cod, 
                L.NumeLocatie,
                L.Strada,
                I.DataStart,
                I.PretPenalizare
            FROM Inchirieri I
            JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
            JOIN Locatii L ON I.LocatieStartID = L.LocatieID
            WHERE I.ClientID = ?
            ORDER BY I.DataStart DESC;
        """
        cursor.execute(query, (client_id,))
        rows = cursor.fetchall()
        
        history_list = []
        for row in rows:
            history_list.append({
                'CodBicicleta': row[0].strip() if row[0] else '-', 
                'PunctPornire': row[1].strip() if row[1] else '-',
                'Strada': row[2].strip() if row[2] else '-',
                'DataStart': str(row[3]) if row[3] else '-',
                'PretPenalizare': float(row[4]) if row[4] else 0.0
            })
            
        return jsonify(history_list)

    except Exception as e:
        print(f"Eroare: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE A-2: Sumar Plati pe Card ---
@dashboard_bp.route('/payments/<int:client_id>', methods=['GET'])
def get_payment_summary(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                P.NrCard,
                COUNT(I.InchiriereID) as NumarTranzactii,
                SUM(B.PretBicicleta + (ISNULL(DATEDIFF(HOUR, I.DataStart, I.DataFinal), 0) * ISNULL(I.PretPenalizare, 0)) ) as TotalCheltuit
            FROM Plati P
            JOIN Inchirieri I ON P.InchiriereID = I.InchiriereID
            JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
            WHERE I.ClientID = ?
            GROUP BY P.NrCard;
        """
        
        cursor.execute(query, (client_id,))
        rows = cursor.fetchall()
        
        payment_list = []
        for row in rows:
            payment_list.append({
                'NrCard': row[0].strip() if row[0] else 'Necunoscut', # Curatam spatiile
                'NumarTranzactii': int(row[1]),
                'TotalCheltuit': float(row[2]) if row[2] else 0.0
            })
            
        return jsonify(payment_list)

    except Exception as e:
        print(f"Eroare SQL A-2: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- Helper (Lista Locații) ---
@dashboard_bp.route('/locations/names', methods=['GET'])
def get_location_names():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        # IAU doar numele distincte pentru dropdown
        query = "SELECT DISTINCT NumeLocatie FROM Locatii ORDER BY NumeLocatie ASC"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Returnez o lista simpla de string-uri: ['Herastrau', 'Piata Romana', ...]
        names = [row[0].strip() for row in rows if row[0]]
        return jsonify(names)
    except Exception as e:
        print(f"Eroare Locations List: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGAREA A-3: Biciclete disponibile în Locația X ---
@dashboard_bp.route('/bikes/available', methods=['GET'])
def get_available_bikes():
    location_name = request.args.get('location_name')
    
    if not location_name:
        return jsonify({'error': 'Parametrul location_name lipseste'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        query = """
            SELECT 
                B.cod,
                B.PretBicicleta,
                CONCAT(
                    L.Strada, ', ',
                    L.Numar, ', Sector ',
                    L.Sector
                ) AS AdresaLocatie
            FROM Biciclete B
            JOIN Locatii L ON B.LocatieID = L.LocatieID
            WHERE L.NumeLocatie = ? 
              AND B.Stare = 'liber';
        """
        
        cursor.execute(query, (location_name,))
        rows = cursor.fetchall()
        
        bikes_list = []
        for row in rows:
            bikes_list.append({
                'Cod': row[0].strip() if row[0] else '-',
                'Pret': float(row[1]) if row[1] else 0.0,
                'Adresa': row[2] if row[2] else '-'
            })
            
        return jsonify(bikes_list)

    except Exception as e:
        print(f"Eroare SQL A-3: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE A-4: Istoric Accesorii Client ---
@dashboard_bp.route('/accessories/<int:client_id>', methods=['GET'])
def get_accessories_history(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()

        query = """
            SELECT 
                I.DataStart,
                A.Denumire AS Accesoriu,
                A.PretAccesoriu
            FROM Inchirieri I
            JOIN AccesoriiBiciclete AB ON I.BicicletaID = AB.BicicletaID
            JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
            WHERE I.ClientID = ?
            ORDER BY I.DataStart DESC;
        """
        
        cursor.execute(query, (client_id,))
        rows = cursor.fetchall()
        
        acc_list = []
        for row in rows:
            acc_list.append({
                'Data': row[0].strftime('%Y-%m-%d %H:%M') if row[0] else '-',
                'Accesoriu': row[1].strip() if row[1] else 'Necunoscut',
                'Pret': float(row[2]) if row[2] else 0.0
            })
            
        return jsonify(acc_list)

    except Exception as e:
        print(f"Eroare SQL A-4: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE A-5: Top 3 Cele mai populare locatii ---
@dashboard_bp.route('/locations/top', methods=['GET'])
def get_top_locations():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        query = """
            SELECT TOP 3
                L.NumeLocatie,
                COUNT(I.InchiriereID) as NumarPlecari
            FROM Inchirieri I
            JOIN Locatii L ON I.LocatieStartID = L.LocatieID
            GROUP BY L.NumeLocatie
            ORDER BY NumarPlecari DESC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        top_list = []
        for row in rows:
            top_list.append({
                'Locatie': row[0].strip() if row[0] else 'Necunoscut',
                'Plecari': int(row[1])
            })
            
        return jsonify(top_list)

    except Exception as e:
        print(f"Eroare SQL A-5: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE A-6: Biciclete cu Scaun de Copil ---
@dashboard_bp.route('/bikes/child-seat', methods=['GET'])
def get_child_seat_bikes():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
   
        query = """
            SELECT 
                B.cod, 
                B.PretBicicleta, 
                L.NumeLocatie
            FROM Biciclete B
            JOIN AccesoriiBiciclete AB ON B.BicicletaID = AB.BicicletaID
            JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
            JOIN Locatii L ON B.LocatieID = L.LocatieID
            WHERE A.Denumire = 'ScaunCopil' 
              AND B.Stare = 'liber';
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        result_list = []
        for row in rows:
            result_list.append({
                'Cod': row[0].strip() if row[0] else '-',
                'Pret': float(row[1]) if row[1] else 0.0,
                'Locatie': row[2].strip() if row[2] else 'Necunoscut'
            })
            
        return jsonify(result_list)

    except Exception as e:
        print(f"Eroare SQL A-6: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE A-7: Durata Totala a Plimbarilor pe An ---
@dashboard_bp.route('/stats/duration/<int:client_id>', methods=['GET'])
def get_total_duration(client_id):
    year_param = request.args.get('year')
    
    if not year_param:
        return jsonify({'error': 'Lipseste parametrul an'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()

        query = """
            SELECT 
                SUM(DATEDIFF(MINUTE, I.DataStart, I.DataFinal)) as MinuteTotale
            FROM Inchirieri I
            JOIN Locatii L ON I.LocatieStartID = L.LocatieID
            JOIN Clienti C ON I.ClientID = C.ClientID
            WHERE I.ClientID = ? AND YEAR(I.DataStart) = ?
        """
        cursor.execute(query, (client_id, year_param))
        row = cursor.fetchone()
        
        minutes = int(row[0]) if row and row[0] else 0
        
        return jsonify({'MinuteTotale': minutes})

    except Exception as e:
        print(f"Eroare SQL A-7: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

  # --- INTEROGARE COMPLEXA B-1: Client VIP ---
@dashboard_bp.route('/stats/vip/<int:client_id>', methods=['GET'])
def get_vip_status(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        query = """
            SELECT Nume, Prenume, 'VIP' as Status
            FROM Clienti
            WHERE ClientID = ?
            AND (
                -- PARTEA 1: CALCULEZ SUMA TOTALA PENTRU CLIENTUL CURENT
                SELECT SUM(CostPerInchiriere)
                FROM (
                    SELECT 
                        B.PretBicicleta 
                        + ISNULL((
                            SELECT SUM(Ac.PretAccesoriu) 
                            FROM AccesoriiBiciclete AB 
                            JOIN Accesorii Ac ON AB.AccesoriuID = Ac.AccesoriuID 
                            WHERE AB.BicicletaID = I.BicicletaID
                        ), 0)
                        + (ISNULL(DATEDIFF(HOUR, I.DataStart, I.DataFinal), 0) * ISNULL(I.PretPenalizare, 0))
                        AS CostPerInchiriere
                    FROM Inchirieri I
                    JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
                    WHERE I.ClientID = ?
                ) AS CalculClient
            ) > (
                -- PARTEA 2: MEDIA GLOBALA
                SELECT AVG(TotalPerUser)
                FROM (
                    SELECT SUM(CostPerInchiriere) as TotalPerUser
                    FROM (
                        SELECT 
                            I2.ClientID,
                            B2.PretBicicleta 
                            + ISNULL((
                                SELECT SUM(Ac2.PretAccesoriu) 
                                FROM AccesoriiBiciclete AB2 
                                JOIN Accesorii Ac2 ON AB2.AccesoriuID = Ac2.AccesoriuID 
                                WHERE AB2.BicicletaID = I2.BicicletaID
                            ), 0)
                            + (ISNULL(DATEDIFF(HOUR, I2.DataStart, I2.DataFinal), 0) * ISNULL(I2.PretPenalizare, 0))
                            AS CostPerInchiriere
                        FROM Inchirieri I2
                        JOIN Biciclete B2 ON I2.BicicletaID = B2.BicicletaID
                    ) AS ToateInchirierile
                    GROUP BY ClientID
                ) AS Medii
            );
        """
 
        cursor.execute(query, (client_id, client_id))
        row = cursor.fetchone()
        
        is_vip = True if row else False
        
        return jsonify({'is_vip': is_vip})

    except Exception as e:
        print(f"Eroare SQL B-1: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE COMPLEXA B-2: Locatii in care clientul nu a fost niciodata ---
@dashboard_bp.route('/locations/unvisited/<int:client_id>', methods=['GET'])
def get_unvisited_locations(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        query = """
            SELECT NumeLocatie, Strada, Numar
            FROM Locatii
            WHERE LocatieID NOT IN (
                SELECT DISTINCT LocatieStartID 
                FROM Inchirieri 
                WHERE ClientID = ?
            );
        """
        cursor.execute(query, (client_id,))
        rows = cursor.fetchall()
        
        unvisited_list = []
        for row in rows:
            unvisited_list.append({
                'Nume': row[0].strip(),
                'Adresa': f"{row[1].strip()}, Nr. {row[2]}"
            })
            
        return jsonify(unvisited_list)

    except Exception as e:
        print(f"Eroare SQL B-2: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE COMPLEXA B-3: Statia cu cele mai multe biciclete libere ---
@dashboard_bp.route('/locations/most-free', methods=['GET'])
def get_most_free_station():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        query = """
            SELECT NumeLocatie
            FROM Locatii L
            WHERE LocatieID = (
                SELECT TOP 1 LocatieID
                FROM Biciclete
                WHERE Stare = 'liber'
                GROUP BY LocatieID
                ORDER BY COUNT(*) DESC
            );
        """
        cursor.execute(query)
        row = cursor.fetchone()
        station_name = row[0].strip() if row else None
            
        return jsonify({'Station': station_name})

    except Exception as e:
        print(f"Eroare SQL B-3: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE COMPLEXA B-4: Biciclete Low Budget (Sub medie + Filtru User) ---
@dashboard_bp.route('/bikes/low-budget', methods=['GET'])
def get_low_budget_bikes():
    # Preiau pretul maxim din URL (default 10 daca nu e setat)
    max_price = request.args.get('max_price', default=10, type=float)
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()

        query = """
            SELECT DISTINCT 
                B.cod, 
                B.PretBicicleta, 
                A.Denumire AS Accesoriu, 
                A.PretAccesoriu,
                L.NumeLocatie
            FROM Biciclete B
            JOIN AccesoriiBiciclete AB ON B.BicicletaID = AB.BicicletaID
            JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
            JOIN Locatii L ON B.LocatieID = L.LocatieID
            WHERE 
               B.PretBicicleta < (SELECT AVG(CAST(PretBicicleta AS FLOAT)) FROM Biciclete)
                AND B.Stare = 'liber'
                AND A.PretAccesoriu < ?
        """
        cursor.execute(query, (max_price,))
        rows = cursor.fetchall()
        
        low_budget_list = []
        for row in rows:
            low_budget_list.append({
                'Cod': row[0].strip(),
                'PretBicicleta': float(row[1]),
                'Accesoriu': row[2].strip(),
                'PretAccesoriu': float(row[3]),
                'Locatie': row[4].strip()
            })
            
        return jsonify(low_budget_list)

    except Exception as e:
        print(f"Eroare SQL B-4: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- INTEROGARE COMPLEXA B-5: Level Up (Pret > ALL History) ---
@dashboard_bp.route('/bikes/upgrade/<int:client_id>', methods=['GET'])
def get_upgrade_bikes(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        
        query = """
            SELECT TOP 3 
                B.cod, 
                B.PretBicicleta, 
                L.NumeLocatie
            FROM Biciclete B
            JOIN Locatii L ON B.LocatieID = L.LocatieID
            WHERE B.Stare = 'liber'
            AND B.PretBicicleta > ALL (
                SELECT B2.PretBicicleta
                FROM Inchirieri I
                JOIN Biciclete B2 ON I.BicicletaID = B2.BicicletaID
                WHERE I.ClientID = ?
            )
            ORDER BY B.PretBicicleta ASC;
        """
        cursor.execute(query, (client_id,))
        rows = cursor.fetchall()
        
        upgrade_list = []
        for row in rows:
            upgrade_list.append({
                'Cod': row[0].strip(),
                'Pret': float(row[1]),
                'Locatie': row[2].strip()
            })
            
        return jsonify(upgrade_list)
    except Exception as e:
        print(f"Eroare SQL B-5: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# --- VALIDARE PENTRU REZERVARE (Helper) ---
@dashboard_bp.route('/bikes/validate', methods=['POST'])
def validate_bike():
    data = request.json
    locatie = data.get('locatie')
    cod = data.get('cod')
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Verific daca bicicleta cu acel COD exista in acea LOCATIE si este LIBERA
        query = """
            SELECT B.PretBicicleta
            FROM Biciclete B
            JOIN Locatii L ON B.LocatieID = L.LocatieID
            WHERE B.cod = ? AND L.NumeLocatie = ? AND B.Stare = 'liber'
        """
        cursor.execute(query, (cod, locatie))
        row = cursor.fetchone()
        
        if row:
            return jsonify({'valid': True, 'pret': float(row[0])})
        else:
            return jsonify({'valid': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

