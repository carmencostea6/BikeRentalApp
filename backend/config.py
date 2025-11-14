# backend/config.py
# Acest fișier conține toate variabilele de configurare și secretele
SECRET_KEY = 'Gusterul12#' 

# --- Configurarea Conexiunii la MSSQL Server ---
SERVER = r'.\SQLEXPRESS' 
DATABASE = 'BikeRental'
DRIVER = '{ODBC Driver 17 for SQL Server}' 

CONNECTION_STRING = f'DRIVER={DRIVER};SERVER={SERVER};DATABASE={DATABASE};Trusted_Connection=yes;'