# backend/app/db.py
import pyodbc
from flask import current_app 
def get_db_connection():
    """Stabileste si returneaza o conexiune la baza de date."""
    try:
       
        conn_string = current_app.config['CONNECTION_STRING']
        conn = pyodbc.connect(conn_string)
        print(">>> Conexiune BD reusita!")
        return conn
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"!!! Eroare de conexiune la BD: {sqlstate}")
        print(ex)
        return None

def close_db_connection(conn, cursor):
    """Inchide conexiunea la baza de date."""
    if cursor:
        cursor.close()
    if conn:
        conn.close()
        # print(">>> Conexiune BD inchisa.")