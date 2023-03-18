import * as schemas from '../resources/schemas.json';
import * as film from '../models/film.server.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";
import {describe} from "node:test";



const getAll = async (): Promise<Film[]> => {
    Logger.info(`Getting all films from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from film';
    const [ rows ] = await conn.query(query);
    await conn.release();
    return rows;
}

const getOneByTitle = async (title: string): Promise<Film[]> => {
    Logger.info(`Getting film "${title}" from the database`)
    const conn = await getPool().getConnection();
    const query = `SELECT * from film where title = ?`;
    const [ result ] = await conn.query( query, [ title ]);
    await conn.release
    return result;
}

const insert = async (title: string, description: string, releaseDate: string,
                      genreId: number, runtime: number, ageRating: string): Promise<ResultSetHeader> => {
    Logger.info(`Adding film "${title} to the database`)
    const conn = await getPool().getConnection();
    const query = `INSERT into film (title, description, release_date, genre_id, runtime, age_rating) values (?, ?, ?, ?, ?, ?)`;
    const [ result ] = await conn.query( query, [ title, description, releaseDate, genreId, runtime, ageRating] );
    await conn.release();
    return result;
}

const getOneById = async (id: number): Promise<Film[]> => {
    Logger.info(`Getting film with id: ${id}}`);
    const conn = await getPool().getConnection();
    const query = `SELECT * from film where id = ?`;
    const [ result ] = await conn.query( query, [ id ]);
    await conn.release();
    return result;
}

export {getAll, getOneByTitle, insert, getOneById}