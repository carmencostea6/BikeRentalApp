--INTEROGARI--

--A)Interogari simple

--1)Istoricul inchirierilor pentru client: Ce bicicletă a inchiriat, de unde și cât a costat?
SELECT 
    B.cod AS CodBicicleta,
    L.NumeLocatie AS PunctPornire,
    L.Strada,
    I.DataStart,
    I.PretPenalizare
FROM Inchirieri I
JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
JOIN Locatii L ON I.LocatieStartID = L.LocatieID
WHERE I.ClientID = 1
ORDER BY I.DataStart DESC;

--2)Istoric plati client:Cât a plătit în total pe fiecare card bancar folosit?
SELECT 
    P.NrCard,
    COUNT(I.InchiriereID) as NumarTranzactii,
    SUM(B.PretBicicleta + (ISNULL(DATEDIFF(HOUR, I.DataStart, I.DataFinal), 0) * ISNULL(I.PretPenalizare, 0)) ) as TotalCheltuit
FROM Plati P
JOIN Inchirieri I ON P.InchiriereID = I.InchiriereID
JOIN Biciclete B ON I.BicicletaID = B.BicicletaID
WHERE I.ClientID = 1
GROUP BY P.NrCard;

--3)Bicicletele disponibile în locația X
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
WHERE L.NumeLocatie = 'Piata Romana' --parametru variabil
  AND B.Stare = 'liber';

--4) Ce accesorii a avut clientul pe bicicletele închiriate?
SELECT 
    I.DataStart,
    A.Denumire AS Accesoriu,
    A.PretAccesoriu
FROM Inchirieri I
JOIN AccesoriiBiciclete AB ON I.BicicletaID = AB.BicicletaID
JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
WHERE I.ClientID = 1;

--5)Top Locații: Cele mai populare puncte de pornire (Statistică Publică)
SELECT TOP 5
    L.NumeLocatie,
    COUNT(I.InchiriereID) as NumarPlecari
FROM Inchirieri I
JOIN Locatii L ON I.LocatieStartID = L.LocatieID
GROUP BY L.NumeLocatie
ORDER BY NumarPlecari DESC;

--6)Găsește biciclete care au Scaun de Copil
SELECT B.cod, B.PretBicicleta, L.NumeLocatie
FROM Biciclete B
JOIN AccesoriiBiciclete AB ON B.BicicletaID = AB.BicicletaID
JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
JOIN Locatii L ON B.LocatieID = L.LocatieID
WHERE A.Denumire = 'ScaunCopil' AND B.Stare = 'liber';

--7)Durata totală a plimbărilor clientului prin oraș (in anul X -parametru variabil)
SELECT 
    C.Nume,C.Prenume,
    SUM(DATEDIFF(MINUTE, I.DataStart, I.DataFinal)) as MinuteTotale
FROM Inchirieri I
JOIN Locatii L ON I.LocatieStartID = L.LocatieID
JOIN Clienti C ON I.ClientID = C.ClientID
WHERE I.ClientID = 1 AND YEAR(I.DataStart) = 2025 -- @An este parametrul
GROUP BY C.Nume, C.Prenume;


--B)Interogari complexe

--1)Afiseaza daca clientul a cheltuit peste media utilizatorilor => Client VIP

SELECT Nume, Prenume, 'VIP' as Status
FROM Clienti
WHERE ClientID = 2
AND (
    -- PARTEA 1: CALCULEZ SUMA TOTALA PENTRU CLIENTUL 2
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
        WHERE I.ClientID = 2
    ) AS CalculClient
) > (
    -- PARTEA 2: MEDIA GLOBALA
    SELECT AVG(TotalPerUser)
    FROM (
        SELECT SUM(CostPerInchiriere) as TotalPerUser
        FROM (
            -- Calculez costul per fiecare inchiriere din sistem
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
--2)Afiseaza locațiile in care clientul nu a fost niciodata
SELECT NumeLocatie, Strada, Numar
FROM Locatii
WHERE LocatieID NOT IN (
    SELECT DISTINCT LocatieStartID 
    FROM Inchirieri 
    WHERE ClientID = 1
);

--3)Statia cu cele mai multe biciclete libere
SELECT NumeLocatie
FROM Locatii L
WHERE LocatieID = (
    SELECT TOP 1 LocatieID
    FROM Biciclete
    WHERE Stare = 'liber'
    GROUP BY LocatieID
    ORDER BY COUNT(*) DESC
);

--4)Biciclete Low Budget-cost mai mic decat media
SELECT DISTINCT 
    B.cod, 
    B.PretBicicleta, 
    A.Denumire AS Accesoriu, 
    A.PretAccesoriu
FROM Biciclete B
JOIN AccesoriiBiciclete AB ON B.BicicletaID = AB.BicicletaID
JOIN Accesorii A ON AB.AccesoriuID = A.AccesoriuID
WHERE 
  
    B.PretBicicleta < (SELECT AVG(PretBicicleta) FROM Biciclete)
    AND B.Stare = 'liber'
    -- Parametru variabil: Accesoriul costa mai putin decat vrea userul
    AND A.PretAccesoriu < 10

--5)Găsește bicicletele disponibile care sunt mai performante (mai scumpe) decât toate bicicletele pe care le-a inchiriat clientul pana acum
SELECT B.cod, B.PretBicicleta, L.NumeLocatie
FROM Biciclete B
JOIN Locatii L ON B.LocatieID = L.LocatieID
WHERE B.Stare = 'liber'
AND B.PretBicicleta > ALL (
    SELECT B2.PretBicicleta
    FROM Inchirieri I
    JOIN Biciclete B2 ON I.BicicletaID = B2.BicicletaID
    WHERE I.ClientID = 1
);

