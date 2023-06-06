-- Drop existing tables if they exist
DROP TABLE IF EXISTS officeinfo;
DROP TABLE IF EXISTS personnes;
DROP TABLE IF EXISTS particularity;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS command;
DROP TABLE IF EXISTS abonnement;

-- Table for users
CREATE TABLE users (
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
CREATE TABLE services (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    NumberOfPersons INT NOT NULL,
    Price FLOAT NOT NULL
);

-- Table for particularities
CREATE TABLE particularity (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL
);

-- Table for membres
CREATE TABLE personnes (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    LastName VARCHAR(100) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    Sexe ENUM('Homme', 'Femme') NOT NULL DEFAULT 'Homme',
    DateNaissance DATE NOT NULL,
    Particularities VARCHAR(255)
);

-- Table for additional member information
CREATE TABLE officeinfo (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL
);

CREATE TABLE abonnement (
    Id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Adresse VARCHAR(100) NOT NULL,
    Telephone VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Location INT NOT NULL,
    Etat ENUM('CompteVierge', 'ConfirmeParEmail', 'ValideParSecretaire', 'Inactif') 
    NOT NULL DEFAULT 'CompteVierge',
    FamilyMembers VARCHAR(100),
    InactifDate TIMESTAMP
);

CREATE TABLE command (
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
    FOREIGN KEY (AbonnementId) REFERENCES abonnement(Id),
    FOREIGN KEY (PayerId) REFERENCES personnes(Id),
    FOREIGN KEY (CurrentOffice) REFERENCES officeinfo(Id),
    FOREIGN KEY (ServiceId) REFERENCES services(Id),
    FOREIGN KEY (EmployeeId) REFERENCES users(Id)
);

-- event creation for an abonnement after a 1 minute for a test:
CREATE EVENT IF NOT EXISTS update_etat_to_inactif
ON SCHEDULE
  EVERY 1 MINUTE
  STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE
COMMENT 'Yearly update of Etat to inactif'
DO
  UPDATE abonnement
  SET Etat = 'Inactif'
  WHERE Etat != 'Inactif' AND InactifDate <= CURRENT_TIMESTAMP;
