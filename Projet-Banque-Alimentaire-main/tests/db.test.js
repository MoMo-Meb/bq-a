const mysql = require('mysql');
const dbConfig = require('../application/config/db.config.js');
const limite = 10000

describe('Connexion à la base de données', () => {
    test('devrait se connecter à la base de données', done => {
        const connection = mysql.createConnection({
            host: dbConfig.HOST,
            user: dbConfig.USER,
            password: dbConfig.PASSWORD,
            database: dbConfig.DB
        });

        connection.connect(error => {
            expect(error).toBeFalsy();
            connection.end(() => {
                done();
            });
        });
    }, limite); // Set a timeout of 10 seconds

    test('devrait échouer avec une configuration invalide', done => {
        const connection = mysql.createConnection({
            host: 'invalid_host',
            user: 'invalid_user',
            password: 'invalid_password',
            database: 'invalid_db'
        });

        connection.connect(error => {
            expect(error).toHaveProperty('code', 'ENOTFOUND');
            connection.end(() => {
                done();
            });
        });
    }, limite); // Set a timeout of 10 seconds
});
