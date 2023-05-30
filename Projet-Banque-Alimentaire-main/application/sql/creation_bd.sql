-- Drop existing tables if they exist
DROP TABLE IF EXISTS OfficeInfo;
DROP TABLE IF EXISTS Personnes;
DROP TABLE IF EXISTS Particularity;
DROP TABLE IF EXISTS Services;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Abonnement;

-- Table for users
CREATE TABLE Users (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Telephone VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    AccountType ENUM('ADMIN', 'SECRETARY', 'ACCOUNTANT') NOT NULL DEFAULT 'ACCOUNTANT',
    LastAuthentication DATE NOT NULL
);


-- Table for services
CREATE TABLE Services (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    NumberOfPersons INT NOT NULL,
    Price FLOAT NOT NULL
);

-- Table for particularities
CREATE TABLE Particularity (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL
);

-- Table for members

-- event creation for an abonnement after a 1 minute for a test:
CREATE EVENT IF NOT EXISTS update_etat_to_inactif
ON SCHEDULE
  EVERY 1 MINUTE
  STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE
COMMENT 'Yearly update of Etat to inactif'
DO
  UPDATE Abonnement
  SET Etat = 'Inactif'
  WHERE Etat != 'Inactif' AND inactifDate <= CURRENT_TIMESTAMP;


CREATE TABLE Personnes (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    LastName VARCHAR(100) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    Sexe ENUM('Homme', 'Femme') NOT NULL DEFAULT 'Homme',
    DateNaissance DATE NOT NULL,
    Particularities VARCHAR(255),
);


-- Table for additional member information
CREATE TABLE OfficeInfo (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS Command;
CREATE TABLE Command (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    AbonnementId INT NOT NULL,
    PayerId INT NOT NULL,
    CurrentOffice INT NOT NULL,
    ServiceId INT NOT NULL,
    EmployeeId INT NOT NULL,
    Etat ENUM('Commande', 'Prepare', 'Recupere', 'Abonnement') NOT NULL DEFAULT 'Commande',
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Notes TEXT,
    FOREIGN KEY (AbonnementId) REFERENCES Abonnement(Id),
    FOREIGN KEY (PayerId) REFERENCES Personnes(Id),
    FOREIGN KEY (CurrentOffice) REFERENCES OfficeInfo(Id),
    FOREIGN KEY (ServiceId) REFERENCES Services(Id),
    FOREIGN KEY (EmployeeId) REFERENCES Users(Id)
);

CREATE TABLE Abonnement (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Adresse VARCHAR(100) NOT NULL,
    Telephone VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Location INT NOT NULL,
    Etat ENUM('CompteVierge', 'ConfirmeParEmail', 'ValideParSecretaire', 'Inactif') 
    NOT NULL DEFAULT 'CompteVierge',
    FamilyMembers VARCHAR(100),
    InactifDate TIMESTAMP,
    FOREIGN KEY (Location) REFERENCES OfficeInfo(Name)
);