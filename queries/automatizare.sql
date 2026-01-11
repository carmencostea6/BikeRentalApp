-- TRIGGER 1: La ADAUGARE (INSERT) sau MUTARE/MODIFICARE (UPDATE)
CREATE OR ALTER TRIGGER trg_UpdateNrBiciclete_InsertUpdate
ON Biciclete
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Daca s-a schimbat LocatieID sau e o inserare noua
    IF UPDATE(LocatieID)
    BEGIN
        -- 1. Actualizez locatia NOUA (unde a ajuns bicicleta)
        -- Recalculez numarul total pentru locatiile afectate
        UPDATE L
        SET L.NrBiciclete = (SELECT COUNT(*) FROM Biciclete WHERE LocatieID = I.LocatieID)
        FROM Locatii L
        JOIN Inserted I ON L.LocatieID = I.LocatieID;

        -- 2. Actualizaez locatia VECHE (daca a fost o mutare prin UPDATE)
        -- (Deleted contine valorile vechi in caz de UPDATE)
        UPDATE L
        SET L.NrBiciclete = (SELECT COUNT(*) FROM Biciclete WHERE LocatieID = D.LocatieID)
        FROM Locatii L
        JOIN Deleted D ON L.LocatieID = D.LocatieID
        WHERE D.LocatieID IS NOT NULL 
          AND D.LocatieID != (SELECT LocatieID FROM Inserted WHERE BicicletaID = D.BicicletaID); -- Doar daca locatia e diferita
    END
END;
GO

-- TRIGGER 2: La STERGERE (DELETE)
CREATE OR ALTER TRIGGER trg_UpdateNrBiciclete_Delete
ON Biciclete
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Actualizez locatia de unde a fost stearsa bicicleta
    UPDATE L
    SET L.NrBiciclete = (SELECT COUNT(*) FROM Biciclete WHERE LocatieID = D.LocatieID)
    FROM Locatii L
    JOIN Deleted D ON L.LocatieID = D.LocatieID;
END;
GO

ALTER TABLE Plati
ADD Suma DECIMAL(10, 2) DEFAULT 0;
GO

-- 1. Actualizez SUMA pentru toate inchirierile finalizate (unde DataFinal nu e NULL)
UPDATE Plati
SET Suma = 
    -- A. COST BICICLETA (Tarif Orar * Numar Ore)
    (CEILING(DATEDIFF(MINUTE, I.DataStart, I.DataFinal) / 60.0) * B.PretBicicleta)
    
    +
    
    -- B. COST ACCESORII (Suma tuturor accesoriilor de pe bicicleta respectiva)
    ISNULL((
        SELECT SUM(A.PretAccesoriu)
        FROM AccesoriiBiciclete AB
        JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
        WHERE AB.BicicletaID = B.BicicletaID
    ), 0)

    -- C. PENALIZARI
FROM Plati P
JOIN Inchirieri I ON P.InchiriereID = I.InchiriereID
JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
WHERE I.DataFinal IS NOT NULL;
GO
