import {getPool} from "../../config/db";
import Logger from "../../config/logger";

import {ResultSetHeader} from "mysql2";

const insert = async (email: string, firstName: string, lastName: string, password: string): Promise<ResultSetHeader> =>{
    Logger.info(`Adding ${firstName} ${lastName} to the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into user (email, first_name, last_name, password) values (?, ?, ?, ?)';
    const [ result ] = await conn.query(query, [email, firstName, lastName, password]);
    await conn.release();
    return result;
}

const getOneByEmail = async (email: string): Promise<User[]> => {
    Logger.info(`Getting user with email: ${email}`);
    const conn = await getPool().getConnection();
    const query = `select * from user where email = ?`;
    const [ result ] = await conn.query(query, [email] );
    Logger.info(`Result userId is: ${result}`);
    await conn.release;
    return result;
}

const getUserById = async (id: number): Promise<any> => {    // Still returns Promise<any>
    Logger.info(`Getting user with id: ${id}`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [ result ] = await conn.query(query, [ id ] );
    await conn.release();
    return result;
}

const login = async (email: string, token: string): Promise<ResultSetHeader> => {
    Logger.info(`Inserting token to user with email: ${email}`);
    const conn = await getPool().getConnection();
    const query = `UPDATE user set auth_token = ? WHERE email = ?`;
    const [ result ] = await conn.query(query, [ token, email ]);
    await conn.release();
    return result;
}

const logout = async (token: string): Promise<ResultSetHeader> => {
    Logger.info(`Removing token`);
    const conn = await getPool().getConnection();
    const query = `UPDATE user set auth_token = NULL where auth_token = ?`;
    const [ result ] = await conn.query(query, [ token ]);
    await conn.release();
    return result;
}


export {insert, getOneByEmail, getUserById, login, logout}