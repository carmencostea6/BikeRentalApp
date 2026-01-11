# backend/app/__init__.py
from flask import Flask, app
from flask_cors import CORS

def create_app():
    """Functia 'App Factory'."""
    
    app = Flask(__name__)
    
    # 1. Incarca configurarile din config.py
    app.config.from_object('config') 

    # 2. Seteaza CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"]) 

    # 3. Importa si inregistreaza Blueprint-urile
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # 4. BLUEPRINT PENTRU DASHBOARD 
    from .routes.dashboard import dashboard_bp
    # Prefixul va fi /api/dashboard, deci ruta finala e /api/dashboard/history/1
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # 5. BLUEPRINT PENTRU ADMIN
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    # 6. BLUEPRINT PENTRU RENTALS
    from app.routes.rent import rent_bp
    app.register_blueprint(rent_bp)

    
    return app