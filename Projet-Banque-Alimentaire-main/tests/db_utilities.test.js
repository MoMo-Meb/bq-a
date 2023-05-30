const db_utilities = require('../middlewares/db_utilities');

// Mock the base_de_donnees module
jest.mock('../middlewares/db', () => {
    return {
        query: jest.fn(),
    };
});
const base_de_donnees = require('../middlewares/db');

describe('db_utilities tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getDataFrom: valid case for all columns', async () => {
        data = [
            { id: 1, firstName: 'John', lastName: 'Doe' },
            { id: 2, firstName: 'Jane', lastName: 'Woe' },
        ]
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, data);
        });

        const results = await db_utilities.getDataFrom('users');
        expect(results).toEqual(data);
    });

    test('getDataFrom: valid case with matching data', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ id: 1, firstName: 'John', lastName: 'Doe' }]);
        });

        const results = await db_utilities.getDataFrom('users', { firstName: 'John' });
        expect(results).toEqual([{ id: 1, firstName: 'John', lastName: 'Doe' }]);
    });

    test('getDataFrom: valid case with a wanted column', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ name: 'senior' }]);
        });

        const results = await db_utilities.getDataFrom('Particularity', 'name');
        expect(results).toEqual([{ name: 'senior' }]);
    });

    test('getDataFrom: invalid case with error', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(new Error('Error message'), null);
        });

        try {
            await db_utilities.getDataFrom('users');
        } catch (error) {
            expect(error.message).toBe('Error message');
        }
    });
    
    test('checkExistFrom: valid case with single condition', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ 'COUNT(*)': 1 }]);
        });

        const exists = await db_utilities.checkExistFrom('users', { firstName: 'John' });
        expect(exists).toBe(true);
    });

    test('checkExistFrom: valid case with multiple conditions', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ 'COUNT(*)': 1 }]);
        });

        const conditions = { firstName: 'John', lastName: 'Doe' };
        const exists = await db_utilities.checkExistFrom('users', conditions);
        expect(exists).toBe(true);
    });

    test('checkExistFrom: valid case with matching data', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ 'COUNT(*)': 1 }]);
        });

        const exists = await db_utilities.checkExistFrom('users', { firstName: 'John' });
        expect(exists).toBe(true);
    });

    test('checkExistFrom: invalid case with no data found', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, [{ 'COUNT(*)': 0 }]);
        });

        const exists = await db_utilities.checkExistFrom('users', { firstName: 'John' });
        expect(exists).toBe(false);
    });

      
    test('checkExistFrom: invalid case with error', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(new Error('Error message'), null);
        });
    
        try {
            await db_utilities.checkExistFrom('users', { firstName: 'John' });
        } catch (error) {
            expect(error.message).toBe('Error message');
        }
    });
      

    test('updateFrom: valid case', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 1 });
        });
    
        const updateValues = { firstName: 'Jane' };
        const queryCondition = { id: 1 };
        const result = await db_utilities.updateFrom('users', updateValues, queryCondition);
        expect(result).toBe(true);
    });
    
    test('updateFrom: invalid case with no rows affected', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 0 });
        });
    
        const updateValues = { firstName: 'Jane' };
        const queryCondition = { id: 1 };
        const result = await db_utilities.updateFrom('users', updateValues, queryCondition);
        expect(result).toBe(false);
    });    

    test('updateFrom: invalid case with error', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(new Error('Error message'), null);
        });

        try {
            await db_utilities.updateFrom('users', { id: 1 }, { firstName: 'Jane' });
        } catch (error) {
            expect(error.message).toBe('Error message');
        }
    });

    test('deleteFrom: valid case', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 1 });
        });
    
        const queryCondition = { id: 1 };
        const result = await db_utilities.deleteFrom('users', queryCondition);
        expect(result).toBe(true);
    });
    
    test('deleteFrom: invalid case with no rows affected', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 0 });
        });
    
        const queryCondition = { id: 1 };
        const result = await db_utilities.deleteFrom('users', queryCondition);
        expect(result).toBe(false);
    });
    

    test('deleteFrom: invalid case with error', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(new Error('Error message'), null);
        });

        try {
            await db_utilities.deleteFrom('users', { id: 1 });
        } catch (error) {
            expect(error.message).toBe('Error message');
        }
    });
    
    test('insertInto: valid case', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 1 });
        });
    
        const data = { firstName: 'Omar', lastName: 'Ramo', telephone: '123-456-7890', email: 'omar@omar.com', password: 'password-omar' };
        const result = await db_utilities.insertInto('users', data);
        expect(result).toBe(true);
    });
    
    test('insertInto: invalid case with no rows affected', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(null, { affectedRows: 0 });
        });
    
        const data = { firstName: 'Omar', lastName: 'Ramo', telephone: '123-456-7890', email: 'omar@omar.com', password: 'password-omar' };
        const result = await db_utilities.insertInto('users', data);
        expect(result).toBe(false);
    });
    
    test('insertInto: invalid case with error', async () => {
        base_de_donnees.query.mockImplementationOnce((_query, _values, callback) => {
            callback(new Error('Error message'), null);
        });
    
        const data = { firstName: 'Omar', lastName: 'Ramo', telephone: '123-456-7890', email: 'omar@omar.com', password: 'password-omar' };
        try {
            await db_utilities.insertInto('users', data);
        } catch (error) {
            expect(error.message).toBe('Error message');
        }
    });
});