-- 1. INSERT (Inserare date noi)

-- A. Inserez un CLIENT nou
INSERT INTO Clienti (Nume, Prenume, CNP, Sex, Telefon, Email, Parola, Strada, Numar, Oras) 
VALUES 
('Dobre', 'Vlad', '1980808400123', 'M', '0755123987', 'vlad.dobre@mail.com', 'passVlad1', 'Bd. Unirii', 12, 'Bucuresti');

-- B. Inserez o INCHIRIERE noua pentru clientul creat mai sus 
INSERT INTO Inchirieri (ClientID, BicicletaID, LocatieStartID, LocatieFinalID, DataStart, DataFinal)
VALUES 
((SELECT TOP 1 ClientID FROM Clienti WHERE Email = 'vlad.dobre@mail.com'), 2, 1, 1, '2026-01-15 10:00:00', '2026-01-15 12:00:00');

-- 2. UPDATE

-- A. Actualizez starea BICICLETEI 
UPDATE Biciclete
SET Stare = 'inchiriat'
WHERE BicicletaID = 2;

-- B. Actualizez datele unui CLIENT (clientul isi schimba numarul de telefon)
UPDATE Clienti
SET Telefon = '0799999999', Strada = 'Bd.Unirii'
WHERE Email = 'vlad.dobre@mail.com';

-- 3. DELETE

-- A. Sterg o BICICLETA
DELETE FROM Biciclete
WHERE Cod = 'BC002' 

-- B.Sterg un CLIENT
DELETE FROM Clienti
WHERE Nume='Costea'
