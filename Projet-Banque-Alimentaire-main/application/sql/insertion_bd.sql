TRUNCATE TABLE Users;
TRUNCATE TABLE Services;
TRUNCATE TABLE Particularity;
TRUNCATE TABLE OfficeInfo;
TRUNCATE TABLE Abonnement;
TRUNCATE TABLE Personnes;

-- Insérer des données d'exemple pour Users
INSERT INTO Users (FirstName, LastName, Telephone, Email, Password, AccountType, LastAuthentication) VALUES
('John', 'Doe', '514-123-4567', 'john.doe@example.com', 'password123', 'ADMIN', '2023-04-10'),
('Jane', 'Smith', '514-987-6543', 'jane.smith@example.com', 'password123', 'SECRETARY', '2023-04-09'),
('Alice', 'Johnson', '514-321-7890', 'alice.johnson@example.com', 'password123', 'ACCOUNTANT', '2023-04-08');

-- Insérer des données d'exemple pour Services
INSERT INTO Services (Name, Description, NumberOfPersons, Price) VALUES
('Forfait alimentaire de base', 'Un forfait alimentaire de base comprenant des articles non périssables', 1, 10.0),
('Forfait alimentaire familial', 'Un forfait alimentaire familial comprenant des articles non périssables', 4, 35.0),
('Forfait alimentaire diététique spécial', 'Un forfait alimentaire adapté aux besoins diététiques spécifiques', 1, 15.0),
('Abonnement', 'Paiement abonnement à la banque', -1, 25);

-- Ajouter les membres de la famille
INSERT INTO Personnes (LastName, FirstName, Sexe, DateNaissance, Particularities)
VALUES
('Doe', 'John', 'Homme', '1975-01-01', 'Diabète, Végétalien'),
('Doe', 'Jane', 'Femme', '1980-02-02', 'Végétalien'),
('Doe', 'Jack', 'Homme', '2005-03-03', NULL),
('Doe', 'Jill', 'Femme', '2007-04-04', 'Intolérance au gluten'),
('Smith', 'Bob', 'Homme', '1985-05-05', NULL),
('Smith', 'Alice', 'Femme', '1992-06-06', 'Allergie aux produits laitiers, Allergie aux arachides'),
('Smith', 'Tom', 'Homme', '2010-07-07', NULL);

-- Ajouter les abonnements de la famille de 4 membres
INSERT INTO Abonnement (Adresse, Telephone, Email, Location, Etat, FamilyMembers)
VALUES
('123 Rue Principale', '123-555-1234', 'johndoe@gmail.com', 1, 'ValideParSecretaire', '1,2,3,4'),
('456 Rue Elm', '123-555-5678', 'bobsmith@gmail.com', 2, 'ValideParSecretaire', '5, 7, 6');
-- Insert default data for Particularities (allergies or illnesses)
INSERT INTO Particularity (Name, Description) VALUES
('Allergie aux arachides', 'Allergique aux arachides'),
('Intolérance au gluten', 'Intolérance au gluten'),
('Allergie aux produits laitiers', 'Allergique aux produits laitiers'),
('Diabète', 'Diabétique, nécessite des considérations diététiques spécifiques'),
('Végétalien', 'Suit un régime végétalien');

-- Insert default data for OfficeInfo (real life address and name)
INSERT INTO OfficeInfo (Name, Location) VALUES
('Bureau principal', '123 Main St, New York, NY 10001'),
('Succursale du centre-ville', '456 Downtown St, New York, NY 10002'),
('Succursale du centre-ville', '789 Uptown Ave, New York, NY 10003'),
('Succursale de Brooklyn', '1011 Brooklyn Blvd, Brooklyn, NY 11201'),
('Succursale de Queens', '1213 Queens Rd, Queens, NY 11301');



INSERT INTO Command (AbonnementId, PayerId, CurrentOffice, ServiceId, EmployeeId, Date, Time, Notes) VALUES
(5, 7, 2, 3, 2, '2020-01-31', '13:24:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2023-01-28', '20:15:00', 'récupération de panier'),
(5,7, 2, 3, 2, '2023-12-02', '12:20:00', 'récupération de panier'),
(5,7, 3, 3, 2, '2021-07-04', '04:22:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2023-02-15', '21:09:00', 'changement de service'),
(5, 7, 1, 3, 2, '2023-12-17', '12:17:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2020-07-29', '01:34:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2020-11-29', '00:56:00', 'changement de service'),
(5, 7, 4, 3, 2, '2021-10-25', '15:47:00', 'changement de service'),
(5, 7, 2, 3, 2, '2022-05-05', '20:51:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2020-06-08', '23:11:00', 'changement de service'),
(5, 7, 3, 3, 2, '2023-06-22', '13:54:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2022-07-24', '12:49:00', 'changement de service'),
(5, 7, 5, 3, 2, '2023-05-25', '19:51:00', 'changement de service'),
(5, 7, 2, 3, 2, '2023-12-13', '01:17:00', 'changement de service'),
(5, 7, 5, 3, 2, '2022-06-03', '07:21:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2021-08-26', '02:47:00', 'changement de service'),
(5, 7, 4, 3, 2, '2020-08-02', '00:03:00', 'changement de service'),
(5, 7, 4, 3, 2, '2020-07-13', '18:45:00', 'changement de service'),
(5, 7, 4, 3, 2, '2022-04-13', '21:18:00', 'changement de service'),
(5, 7, 4, 3, 2, '2021-10-28', '01:28:00', 'changement de service'),
(5, 7, 3, 3, 2, '2023-06-16', '18:30:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2023-03-23', '11:27:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2023-05-23', '04:16:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2020-06-01', '16:16:00', 'changement de service'),
(5, 7, 5, 3, 2, '2020-01-19', '12:54:00', 'changement de service'),
(5, 7, 2, 3, 2, '2022-12-05', '04:05:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2020-03-01', '02:48:00', 'changement de service'),
(5, 7, 5, 3, 2, '2022-08-15', '18:05:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2020-06-02', '14:27:00', 'changement de service'),
(5, 7, 5, 3, 2, '2020-05-27', '08:50:00', 'changement de service'),
(5, 7, 4, 3, 2, '2020-03-07', '09:46:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2023-05-02', '22:28:00', 'changement de service'),
(5, 7, 3, 3, 2, '2022-11-13', '10:02:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2020-08-26', '16:52:00', 'changement de service'),
(5, 7, 4, 3, 2, '2023-07-12', '14:12:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2021-09-09', '08:07:00', 'changement de service'),
(5, 7, 5, 3, 2, '2022-10-16', '15:27:00', 'changement de service'),
(5, 7, 1, 3, 2, '2022-07-17', '18:20:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2020-03-18', '00:19:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2023-02-15', '11:46:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2022-05-17', '19:19:00', 'changement de service'),
(5, 7, 5, 3, 2, '2020-03-14', '05:38:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2022-04-19', '19:07:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2020-10-21', '00:38:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2020-08-13', '22:32:00', 'changement de service'),
(5, 7, 3, 3, 2, '2021-03-21', '14:03:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2023-07-23', '17:14:00', 'changement de service'),
(5, 7, 2, 3, 2, '2020-09-27', '01:25:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2021-07-20', '18:15:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2022-03-18', '19:00:00', 'changement de service'),
(5, 7, 2, 3, 2, '2022-10-22', '00:54:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2022-09-04', '05:24:00', 'changement de service'),
(5, 7, 2, 3, 2, '2020-09-07', '23:36:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2022-07-23', '16:54:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2023-01-28', '12:43:00', 'changement de service'),
(5, 7, 4, 3, 2, '2021-07-26', '16:02:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2020-07-25', '01:55:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2020-05-12', '13:45:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2023-02-28', '20:59:00', 'changement de service'),
(5, 7, 1, 3, 2, '2023-08-11', '10:49:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2022-09-22', '15:14:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2020-05-24', '12:15:00', 'changement de service'),
(5, 7, 4, 3, 2, '2021-01-10', '13:13:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2023-09-02', '19:29:00', 'changement de service'),
(5, 7, 1, 3, 2, '2021-10-27', '09:06:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2020-03-10', '06:33:00', 'récupération de panier'),
(5, 7, 2, 3, 2, '2022-11-24', '12:29:00', 'changement de service'),
(5, 7, 2, 3, 2, '2023-10-29', '08:49:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2022-12-06', '02:48:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2020-06-02', '17:44:00', 'changement de service'),
(5, 7, 2, 3, 2, '2021-05-19', '14:00:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2022-11-20', '06:13:00', 'changement de service'),
(5, 7, 4, 3, 2, '2023-09-18', '01:59:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2020-08-15', '11:09:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2022-06-04', '12:08:00', 'changement de service'),
(5, 7, 3, 3, 2, '2021-11-05', '04:11:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2022-03-15', '15:59:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2021-12-25', '12:33:00', 'changement de service'),
(5, 7, 4, 3, 2, '2021-11-13', '19:00:00', 'changement de service'),
(5, 7, 1, 3, 2, '2023-12-03', '10:42:00', 'changement de service'),
(5, 7, 3, 3, 2, '2023-09-02', '02:13:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2022-01-08', '01:07:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2023-03-28', '02:35:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2021-01-02', '07:09:00', 'changement de service'),
(5, 7, 5, 3, 2, '2022-09-16', '21:36:00', 'changement de service'),
(5, 7, 5, 3, 2, '2023-02-25', '15:09:00', 'changement de service'),
(5, 7, 2, 3, 2, '2020-07-19', '19:35:00', 'changement de service'),
(5, 7, 4, 3, 2, '2020-08-03', '12:29:00', 'changement de service'),
(5, 7, 2, 3, 2, '2023-09-06', '00:45:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2021-01-29', '13:00:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2023-05-18', '18:40:00', 'récupération de panier'),
(5, 7, 1, 3, 2, '2021-06-20', '14:40:00', 'changement de service'),
(5, 7, 2, 3, 2, '2020-02-11', '03:09:00', 'récupération de panier'),
(5, 7, 5, 3, 2, '2022-03-18', '16:53:00', 'récupération de panier'),
(5, 7, 3, 3, 2, '2022-02-28', '21:02:00', 'changement de service'),
(5, 7, 1, 3, 2, '2021-03-26', '04:58:00', 'changement de service'),
(5, 7, 1, 3, 2, '2020-06-16', '06:56:00', 'changement de service'),
(5, 7, 3, 3, 2, '2020-06-22', '12:16:00', 'récupération de panier'),
(5, 7, 4, 3, 2, '2021-04-16', '12:22:00', 'changement de service');