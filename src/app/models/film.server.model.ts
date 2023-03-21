
import Logger from "../../config/logger";
import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";




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

const insert = async (title: string, description: string, releaseDate: string, genreId: number, runtime: number,
                      ageRating: string, directorId: number): Promise<ResultSetHeader> => {
    Logger.info(`Adding film "${title} to the database`)
    const conn = await getPool().getConnection();
    const query = `INSERT into film (title, description, release_date, genre_id, runtime, age_rating, director_id) values (?, ?, ?, ?, ?, ?, ?)`;
    const [ result ] = await conn.query( query, [ title, description, releaseDate, genreId, runtime, ageRating, directorId] );
    await conn.release();
    return result;
}

const getOneById = async (id: number): Promise<any> => {
    Logger.info(`Getting film with id: ${id}`);
    const conn = await getPool().getConnection();
    const query = `SELECT * from film where id = ?`;
    const [ result ] = await conn.query( query, [ id ]);
    await conn.release();
    return result;
}

const getGenres = async (): Promise<Genre[]> => {
    Logger.info(`Getting all genre's`);
    const conn = await getPool().getConnection();
    const query = `SELECT id as genreId, name from genre`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const deleteOne = async (id: number): Promise<Film[]> => {
    Logger.info(`Deleting film ${id}`);
    const conn = await getPool().getConnection();
    const query = `DELETE from film where id = ?`;
    const [ result ] = await conn.query(query, [ id ]);
    await conn.release();
    return result;
}

const getGenreById = async (id: number): Promise<Genre[]> => {
    Logger.info(`Getting genre ${id}`);
    const conn = await getPool().getConnection();
    const query = `SELECT * from genre where id = ?`;
    const [ result ] = await conn.query(query, [ id ]);
    await conn.release();
    return result;
}

const updateFilm = async (filmId: number, title: string, description: string, releaseDate: string, runtime: number, genreId: number, ageRating: string): Promise<Film[]> => {
    Logger.info(`Updating film ${filmId}`);
    const conn = await getPool().getConnection();
    const query = `UPDATE film set title = ?, description = ?, release_date = ?, runtime = ?, genre_id = ?, age_rating = ? where id = ?`;
    const [ result ] = await conn.query(query, [ title, description, releaseDate, runtime, genreId, ageRating, filmId]);
    await conn.release();
    return result;
}

export {getAll, getOneByTitle, insert, getOneById, getGenres, deleteOne, getGenreById, updateFilm}