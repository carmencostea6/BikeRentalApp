-- 1. Verifica toti clientii (6 inregistrari)
SELECT * FROM Clienti;

-- 2. Verifica toate locatiile si numarul de biciclete (5 inregistrari)
SELECT * FROM Locatii;

-- 3. Verifica toate bicicletele si locatia la care sunt alocate (11 inregistrari)
SELECT BicicletaID, cod, Stare, PretBicicleta, LocatieID FROM Biciclete;

-- 4. Verifica închirierile (6 înregistrări)
SELECT * FROM [Inchirieri]; -- sau Inchirieri, depinde cum este numele final

-- 5. Verifica platile si relatia lor cu închirierile (6 înregistrări)
SELECT * FROM Plati;

--6. Verifica accesoriile
SELECT * FROM Accesorii;
--7. Verifica AccesoriiBicicleta
SELECT *FROM AccesoriiBiciclete;