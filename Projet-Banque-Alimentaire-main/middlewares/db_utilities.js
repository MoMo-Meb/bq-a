

const base_de_donnees = require("./db")

function getDataFrom(queryTable, arg2 = "*", customWhereClause = "", values = []) {
    let queryColumn = "*";

    if (typeof arg2 === "string") {
        queryColumn = arg2;
    } else if (typeof arg2 === "object") {
        if (arg2.columnExpression) {
            queryColumn = arg2.columnExpression;
            customWhereClause = arg2.whereClause;
            values = arg2.values;
        } else {
            customWhereClause = Object.entries(arg2).map(([key, value]) => `${key} = ?`).join(" AND ");
            values = Object.values(arg2);
        }
    } else {
        customWhereClause = arg2;
        arg2 = undefined;
    }

    if (arg2 === undefined) {
        queryColumn = "*";
    } else if (queryColumn !== "*") {
        queryColumn = queryColumn.split(",").map(col => col.trim()).join(",");
    }

    let query = `SELECT ${queryColumn} FROM ${queryTable.toLowerCase()}`;

    if (customWhereClause !== "") {
        query += ` WHERE ${customWhereClause}`;
    }

    return new Promise((resolve, reject) => {
        base_de_donnees.query(query, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function checkExistFrom(queryTable, queryColumn) {
    return new Promise((resolve, reject) => {
        let query;
        let params;
        if (typeof queryColumn === 'object' && queryColumn !== null) {
            query = `SELECT COUNT(*) FROM ?? WHERE ${Object.keys(queryColumn).map((key) => `?? = ?`).join(' AND ')}`;
            params = [queryTable.toLowerCase()].concat(
                Object.keys(queryColumn).reduce((acc, key) => {
                    acc.push(key, queryColumn[key]);
                    return acc;
                }, [])
            );
        } else {
            query = `SELECT COUNT(*) FROM ?? WHERE ?? = ?`;
            params = [queryTable.toLowerCase(), queryColumn, queryCondition];
        }
        base_de_donnees.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                const count = results && results.length > 0 ? results[0]['COUNT(*)'] : 0;
                resolve(count > 0);
            }
        });
    });
}

// The rest of your code...

async function checkPersonInSubscription(personId){
    ABONNEMENTS = await getAbonnements();
    ABONNEMENTS.forEach(Abonnement => {
        familyMembers = (Abonnement.FamilyMembers).split(',').trim();

        familyMembers.forEach(member =>{
            if(member == personId){
                return true;
            }
        });
    });
    return false;
} 

function getTables() {
    return new Promise((resolve, reject) => {
        query = `SELECT table_name
    FROM information_schema.tables
    WHERE table_type='BASE TABLE'
          AND table_schema = 'banque_alimentaire'`
        base_de_donnees.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });

}


function getColumns(queryTable) {
    return new Promise((resolve, reject) => {
        query = `SHOW COLUMNS FROM ${queryTable}`


        base_de_donnees.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


function updateFrom(queryTable, updateValues, queryCondition) {
    return new Promise((resolve, reject) => {
        const conditionString = Object.keys(queryCondition)
            .map((key) => `?? = ?`)
            .join(' AND ');
        const query = `UPDATE ?? SET ? WHERE ${conditionString}`;
        const params = [queryTable.toLowerCase(), updateValues].concat(
            Object.keys(queryCondition).reduce((acc, key) => {
                acc.push(key, queryCondition[key]);
                return acc;
            }, [])
        );
        base_de_donnees.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows > 0 ? true : false);
            }
        });
    });
}

function deleteFrom(queryTable, queryCondition) {
    return new Promise((resolve, reject) => {
        const conditionString = Object.keys(queryCondition)
            .map((key) => `?? = ?`)
            .join(' AND ');
        const query = `DELETE FROM ?? WHERE ${conditionString}`;
        const params = [queryTable.toLowerCase()].concat(
            Object.keys(queryCondition).reduce((acc, key) => {
                acc.push(key, queryCondition[key]);
                return acc;
            }, [])
        );
        base_de_donnees.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows > 0 ? true : false);
            }
        });
    });
}

function insertInto(queryTable, data) {
    return new Promise((resolve, reject) => {
        const model = require(`../application/models/${queryTable.toLowerCase()}.model.js`);
        const query = `INSERT INTO ${queryTable.toLowerCase()} SET ?`;
        const params = [new model(data)];
        base_de_donnees.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows > 0 ? true : false);
            }
        });
    });
}

function getOffices() {
    return new Promise((resolve, reject) => {
        base_de_donnees.query('SELECT * FROM OfficeInfo', (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function getServices() {
    return new Promise((resolve, reject) => {
        base_de_donnees.query('SELECT * FROM Services', (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function getAbonnements() {
    return new Promise((resolve, reject) => {
        base_de_donnees.query('SELECT * FROM Abonnement', (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function searchPayer(payerName) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM personnes
        WHERE LastName LIKE ?
      `;
        base_de_donnees.query(query, [`%${payerName}%`], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


module.exports = {
    getDataFrom,
    // getDataFromCustomClause,
    checkExistFrom,
    updateFrom,
    deleteFrom,
    insertInto,
    getTables,
    getColumns,
    getOffices,
    getServices,
    getAbonnements,
    searchPayer
}