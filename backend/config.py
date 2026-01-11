# backend/config.py
SECRET_KEY = 'Gusterul12#' 

# --- Configurarea Conexiunii la MSSQL Server ---
SERVER = r'.\SQLEXPRESS' 
DATABASE = 'BikeRental'
DRIVER = '{ODBC Driver 17 for SQL Server}' 

CONNECTION_STRING = f'DRIVER={DRIVER};SERVER={SERVER};DATABASE={DATABASE};Trusted_Connection=yes;'