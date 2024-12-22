import res from "express/lib/response";
import pool from "../config/connect";
import { Where } from "sequelize/lib/utils";
import { where } from "sequelize";
import { query } from "express";

const insertRecordsDb = async (table, data) => {
    let connection;
    try{

        connection = await pool.getConnection();

        const column = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const query = `INSERT INTO ${table} (${column}) VALUES ${placeholders}`;

        const [result] = await connection.execute(query, values);

        console.log("Data inserted: ", result);
        return result;

    } catch(error) {
        throw new Error('Unable to create record.', error);
    }
    finally{
        if(connection) connection.release();
    }
}


const updateRecordDb = async (table, data, where) => {
    let connection;
    try{
        connection = await pool.getConnection();

        const setClause = Object.keys()
                        .map(key => `${key} => ?`)
                        .join('? ');
        const values = Object.keys(data);

        const query = `UPDATE TABLE ${table} SET ${setClause} WHERE ${where}`
        const [result] = await connection.execute(query, values);
        
        console.log('Update records: ', result.affectedRows);
        return result;
    } catch(error) {
        throw new Error('Unable to update record.', error);
    } finally {
        if(connection) connection.release();
    }
}


const deleteRecordDb = async (table, where) => {
    let connection;
    try{

        connection = await pool.getConnection();

        const query = `DELETE FROM ${table} WHERE ${where}`;
        const [result] = connection.execute(query);

        console.log("deleted count: ", result.affectedRows);
        return result;

    } catch(error) {
        throw new Error('Unable to create record.', error);
    } finally {
        if(connection) connection.release();
    }
}

const readRecordDb = async (table, columns = ['*'], where = '') => {
    let connection;
    try{
        connection = await pool.getConnection();

        const query = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${Where}`;
        const [rows] = await connection.execute(query);

        console.log("Fetched rows: ", rows);
        return rows;

    } catch(error) {
        throw new Error('Unable to create record.', error);
    } finally {
        if(connection) connection.release();
    }
}

// Example usage

// Create new user
// ### await insertRecordDb('users', { name: 'Ashok', email: 'ashok@mail.com' });

// Read all users
// ### const users = await readRecordDb('users');
// console.log(users);

// Update a user's email
// ### await updateRecordDb('users', { email: 'ashok.ambore@mail.com' }, 'id = 1');

// Delete a user
// ### await deleteRecordDb('users', 'id = 1');