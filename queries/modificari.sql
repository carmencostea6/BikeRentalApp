-- 1. Adăug coloana 'Rol' (implicit 'user' pentru toți cei existenți)
ALTER TABLE Clienti 
ADD Rol VARCHAR(20) DEFAULT 'user';
GO

-- 2. Actualizezclienții existenți să fie 'user' 
UPDATE Clienti SET Rol = 'user' WHERE Rol IS NULL;
GO

-- 3. Inserez Contul de Administrator
-- Folosescdate fictive pentru câmpurile obligatorii (CNP, Telefon etc.)
INSERT INTO Clienti (Nume, Prenume, CNP, Telefon, Email, Parola, Sex, Rol, Strada, Numar, Oras)
VALUES (
    'System',           -- Nume
    'Admin',    -- Prenume
    '9999999999999',    -- CNP (Fictiv)
    '0000000000',       -- Telefon
    'admin@bikerental.com', 
    'Admin123',         -- Parola (In productie ar trebui hash-uita!)
    'M', 
    'admin',            -- ROLUL IMPORTANT
    'Admin HQ', '1', 'Bucuresti'
);
GO