const base_de_donnees = require("./db")

// function getDataFrom(queryTable, arg2, matchData) {
//     return new Promise((resolve, reject) => {
//         let queryColumn = "*";
//         let conditions = [];
//         let values = [];

//         if (typeof arg2 === "string") {
//             queryColumn = arg2;
//         } else if (typeof arg2 === "object") {
//             matchData = arg2;
//         }

//         let query = `SELECT ${queryColumn} FROM ${queryTable}`;

//         if (matchData) {
//             for (let key in matchData) {
//                 conditions.push(`${key} = ?`);
//                 values.push(matchData[key]);
//             }
//             if (conditions.length > 0) {
//                 query += ` WHERE ${conditions.join(" AND ")}`;
//             }
//         }

//         base_de_donnees.query(query, values, (error, results) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// }

// function getDataFromCustomClause(queryTable, arg2, whereClause, values) {
//     let queryColumn = "*";

//     if (typeof arg2 === "string") {
//         queryColumn = arg2;
//     } else if (typeof arg2 === "object") {
//         values = whereClause;
//         whereClause = arg2;
//     } else if (arg2 === undefined) {
//         values = whereClause;
//         whereClause = arg2;
//     }

//     return new Promise((resolve, reject) => {
//         const query = `SELECT ${queryColumn} FROM ${queryTable} WHERE ${whereClause}`;

//         base_de_donnees.query(query, values, (error, results) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// }


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

    let query = `SELECT ${queryColumn} FROM ${queryTable}`;

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

function checkExistFrom(queryTable, queryColumn) {
    return new Promise((resolve, reject) => {
        let query;
        let params;
        if (typeof queryColumn === 'object' && queryColumn !== null) {
            query = `SELECT COUNT(*) FROM ?? WHERE ${Object.keys(queryColumn).map((key) => `?? = ?`).join(' AND ')}`;
            params = [queryTable].concat(
                Object.keys(queryColumn).reduce((acc, key) => {
                    acc.push(key, queryColumn[key]);
                    return acc;
                }, [])
            );
        } else {
            query = `SELECT COUNT(*) FROM ?? WHERE ?? = ?`;
            params = [queryTable, queryColumn, queryCondition];
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


function updateFrom(queryTable, updateValues, queryCondition) {
    return new Promise((resolve, reject) => {
        const conditionString = Object.keys(queryCondition)
            .map((key) => `?? = ?`)
            .join(' AND ');
        const query = `UPDATE ?? SET ? WHERE ${conditionString}`;
        const params = [queryTable, updateValues].concat(
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
        const params = [queryTable].concat(
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
        const query = `INSERT INTO ${queryTable} SET ?`;
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