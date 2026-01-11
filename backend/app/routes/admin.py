from flask import Blueprint, request, jsonify
from app.db import get_db_connection, close_db_connection
import pyodbc

admin_bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')

# --- CONFIGURARE PERMISIUNI  ---

TABLE_CONFIG = {
    'Clienti':            {'pk': 'ClientID',             'methods': ['GET', 'POST', 'PUT', 'DELETE']},
    'Biciclete':          {'pk': 'BicicletaID',          'methods': ['GET', 'POST', 'PUT', 'DELETE']},
    'Accesorii':          {'pk': 'AccesoriuID',          'methods': ['GET', 'POST', 'PUT', 'DELETE']},
    'AccesoriiBiciclete': {'pk': 'AccesoriiBicicleteID', 'methods': ['GET', 'POST', 'PUT', 'DELETE']},
    
    # Restrictii 
    'Locatii':    {'pk': 'LocatieID',    'methods': ['GET', 'PUT']}, # Doar Vizualizare si Editare
    'Inchirieri': {'pk': 'InchiriereID', 'methods': ['GET', 'PUT']}, # Doar Vizualizare si Editare 
    'Plati':      {'pk': 'PlataID',      'methods': ['GET']}         # READ-ONLY 
}

# Helper verificare permisiuni
def check_permission(table_name, method):
    if table_name not in TABLE_CONFIG:
        return False, "Tabel invalid."
    if method not in TABLE_CONFIG[table_name]['methods']:
        return False, f"Metoda {method} nu este permisă pentru tabelul {table_name}."
    return True, None

# --- 1. READ (SELECT ALL) ---
@admin_bp.route('/<table_name>', methods=['GET'])
def get_all(table_name):
    allowed, msg = check_permission(table_name, 'GET')
    if not allowed: return jsonify({'error': msg}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            row_dict = {}
            for col, val in zip(columns, row):
                row_dict[col] = val if val is not None else ""
            results.append(row_dict)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)

# --- 2. DELETE ---
@admin_bp.route('/<table_name>/<int:id>', methods=['DELETE'])
def delete_item(table_name, id):
    allowed, msg = check_permission(table_name, 'DELETE')
    if not allowed: return jsonify({'error': msg}), 403
    
    pk_column = TABLE_CONFIG[table_name]['pk']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"DELETE FROM {table_name} WHERE {pk_column} = ?", (id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Șters cu succes!'})
    except pyodbc.IntegrityError:
        return jsonify({'error': 'Nu se poate șterge: Date referențiate în alte tabele.'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)

# --- 3. CREATE (INSERT) ---
@admin_bp.route('/<table_name>', methods=['POST'])
def create_item(table_name):
    allowed, msg = check_permission(table_name, 'POST')
    if not allowed: return jsonify({'error': msg}), 403

    data = request.json
    pk_column = TABLE_CONFIG[table_name]['pk']
    if pk_column in data: del data[pk_column] 

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        values = [None if v == "" else v for v in list(data.values())]
        
        query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'success': True, 'message': 'Adăugat cu succes!'})
    except pyodbc.IntegrityError:
        return jsonify({'error': 'Date duplicate sau invalide.'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)

# --- 4. UPDATE ---
@admin_bp.route('/<table_name>/<int:id>', methods=['PUT'])
def update_item(table_name, id):
    allowed, msg = check_permission(table_name, 'PUT')
    if not allowed: return jsonify({'error': msg}), 403

    pk_column = TABLE_CONFIG[table_name]['pk']
    data = request.json
    if pk_column in data: del data[pk_column]

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        values = [None if v == "" else v for v in list(data.values())]
        values.append(id)
        
        query = f"UPDATE {table_name} SET {set_clause} WHERE {pk_column} = ?"
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'success': True, 'message': 'Actualizat cu succes!'})
    except pyodbc.IntegrityError:
        return jsonify({'error': 'Conflict de date.'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        close_db_connection(conn, cursor)