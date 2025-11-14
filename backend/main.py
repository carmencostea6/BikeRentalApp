# backend/main.py
# Acesta este NOUL fisier principal de rulare a aplicatiei

from app import create_app # Importam functia factory din app/__init__.py

# Cream instanta aplicatiei
app = create_app()

if __name__ == '__main__':
    # Ruleaza aplicatia
    # ATENTIE: Seteaza debug=False pentru productie!
    app.run(debug=True, port=5000)