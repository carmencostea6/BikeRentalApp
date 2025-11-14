-- 1. Sterge datele din tabelele dependente
DELETE FROM Plati;
DELETE FROM AccesoriiBiciclete;
DELETE FROM Inchirieri; -- Asigura-te ca aici folosesti numele corect: [Închirieri] sau Inchirieri
DELETE FROM Biciclete;

-- 2. Sterge datele din tabelele de baza
DELETE FROM Clienti;
DELETE FROM Locatii;
DELETE FROM Accesorii;

-- 3. Reseteaza contorii de autoincrementare (IDENTITY)
DBCC CHECKIDENT (Plati, RESEED, 0);
DBCC CHECKIDENT (Inchirieri, RESEED, 0);
DBCC CHECKIDENT (Biciclete, RESEED, 0);
DBCC CHECKIDENT (Locatii, RESEED, 0);
DBCC CHECKIDENT (Clienti, RESEED, 0);
DBCC CHECKIDENT (Accesorii, RESEED, 0);

-- 1. Populeaza tabelul Accesorii
INSERT INTO Accesorii (Denumire, PretAccesoriu) VALUES
('Cos', 2.00),         
('ScaunCopil', 5.00),  
('Cric', 0.00),
('Far', 1.00),
('Casca', 3.00),       
('SuportTel', 1.50);

-- 2. Populeaza tabelul Clienti
INSERT INTO Clienti (Nume, Prenume, CNP, Sex, Telefon, Email, Parola, Strada, Numar, Oras) VALUES
('Popescu', 'Andrei', '1900101400011', 'M', '0722123456', 'andrei.p@mail.com', 'parola123', 'Primaverii', 10, 'Bucuresti'),
('Ionescu', 'Maria', '2950520400022', 'F', '0744987654', 'maria.i@mail.com', 'mariei95', 'Florilor', 5, 'Bucuresti'),
('Vasilescu', 'George', '1851212400033', 'M', '0766112233', 'george.v@mail.com', 'gigiBV', 'Victoriei', 150, 'Bucuresti'),
('Dumitrescu', 'Elena', '2880808400044', 'F', '0720556677', 'elena.d@mail.com', 'elena88D', 'Pacii', 20, 'Bucuresti'),
('Constantin', 'Alex', '1990303400055', 'M', '0788334455', 'alex.c@mail.com', 'alexpwd', 'Unirii', 1, 'Bucuresti'),
('Mihai', 'Ioana', '2010202400066', 'F', '0733667788', 'ioana.m@mail.com', 'ioana2001', 'Libertatii', 33, 'Bucuresti');

-- 3. Populeaza tabelul Locatii
INSERT INTO Locatii (NumeLocatie, Strada, Numar, Sector, NrBiciclete) VALUES
('Piata Romana', 'Dorobanti', 50, 1, 1),
('Universitate', 'Elisabeta', 3, 3, 3),
('Herastrau', 'Nordului', 1, 1, 2),
('Obor', 'Colentina', 2, 2, 1),
('Tineretului', 'Tineretului', 10, 4, 4);

-- 4. Populeaza tabelul Biciclete (Depinde de Locatii)
INSERT INTO Biciclete (LocatieID, cod, Stare, PretBicicleta) VALUES
-- Locatia 1 (ID 1)
(1, 'BC001', 'liber', 10.50),
-- Locatia 2 (ID 2)
(2, 'BC002', 'liber', 10.50),
(2, 'BC003', 'liber', 11.00),
(2, 'BC004', 'liber', 11.00),
-- Locatia 3 (ID 3)
(3, 'BC005', 'liber', 10.50),
(3, 'BC006', 'liber', 10.50),
-- Locatia 4 (ID 4)
(4, 'BC007', 'inchiriat', 10.00),
-- Locatia 5 (ID 5)
(5, 'BC008', 'liber', 10.50),
(5, 'BC009', 'liber', 10.50),
(5, 'BC010', 'liber', 10.50),
(5, 'BC011', 'liber', 10.50);

-- 5. Populeaza tabelul AccesoriiBiciclete (Depinde de Biciclete si Accesorii)
INSERT INTO AccesoriiBiciclete (BicicletaID, AccesoriuID, Marca) VALUES
(1, 1, 'BrandX'), -- Bicicleta 1 (BC001) are Accesoriu 1 (Cos)
(1, 4, 'Lumina'),
(3, 2, 'SafeRide'), -- Bicicleta 3 (BC003) are Accesoriu 2 (ScaunCopil)
(5, 4, NULL), 
(5, 5, 'Protekt'),
(8, 6, 'Grip'); -- Bicicleta 8 (BC008) are Accesoriu 6 (SuportTel)

-- 6. Populeaza tabelul Inchirieri (Depinde de Clienti, Biciclete, Locatii)
INSERT INTO Inchirieri (ClientID, BicicletaID, LocatieStartID, LocatieFinalID, DataStart, DataFinal) VALUES
('1', '1', '1', '2', '2025-11-10 10:00:00', '2025-11-10 11:30:00'),
('2', '3', '3', '3', '2025-11-10 12:00:00', '2025-11-10 15:30:00'),
('3', '5', '4', '5', '2025-11-11 08:00:00', '2025-11-11 09:00:00'),
('4', '8', '2', '1', '2025-11-11 14:00:00', '2025-11-11 18:00:00'),
('5', '6', '5', '4', '2025-11-12 17:00:00', '2025-11-12 18:50:00'),
('6', '2', '1', '1', '2025-11-12 10:00:00', '2025-11-12 10:45:00');

-- 7. Populeaza tabelul Plati (Depinde de Inchirieri)
INSERT INTO Plati (InchiriereID, NrCard, DataExpirareCard, CVV) VALUES
(1, '1111222233334444', '2028-12-01', 123),
(2, '5555666677778888', '2026-05-01', 456),
(3, '9999000011112222', '2027-10-01', 789),
(4, '1234123412341234', '2029-01-01', 101),
(5, '4321432143214321', '2025-11-01', 202),
(6, '6789678967896789', '2030-03-01', 303);