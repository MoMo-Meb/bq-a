// On importe d'abord le module mysql
const mysql = require('mysql');

// On importe la configuration de la base de données en appelant le fichier créé dans le dossier configuration
const dbConfig = require('../application/config/db.config.js');

// À partir de là, on établit la connexion
const connection = mysql.createConnection({
  // Ces informations sont contenues dans le fichier db.config.js
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// On ouvre la connexion à la base de données
connection.connect(error => {
  if (error) {
    console.error('Erreur lors de la connexion à la base de données :', error);
  } else {
    console.log('Connexion avec la base de données établie');
  }
});

// On exporte la connexion à la base de données
module.exports = connection;
