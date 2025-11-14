# backend/app/__init__.py
# Acesta este fișierul "App Factory"

from flask import Flask
from flask_cors import CORS
# import config # <-- ACEASTA LINIE CAUZEAZA EROAREA. O STERGEM.

def create_app():
    """Functia 'App Factory'."""
    
    app = Flask(__name__)
    
    # 1. Incarca configurarile din config.py
    # Asta seteaza app.config['SECRET_KEY'], etc.
    app.config.from_object('config') 

    # 2. Seteaza CORS, permitand cookie-uri de la frontend
    # Asigura-te ca portul (aici 5173) este cel corect pentru React/Vite
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"]) 

    # 3. Importa si inregistreaza Blueprint-ul de autentificare
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Aici vei inregistra viitoarele Blueprint-uri (ex: pentru Locatii)
    # from .routes.locatii import locatii_bp
    # app.register_blueprint(locatii_bp)
    
    return app  