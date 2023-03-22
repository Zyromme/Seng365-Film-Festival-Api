
import Logger from "../../config/logger";
import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";
import {generate} from "rand-token";
import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import logger from "../../config/logger";


const getAll = async (startIndex: number, count: number, q: string, genreIds:any, ageRatings: any,
                      directorId: number, reviewerId: number, sortBy: string): Promise<Film[]> => {
    Logger.info(`Getting all films from the database`);
    const conn = await getPool().getConnection();
    let query = 'SELECT F.id as filmId, F.title, F.genre_id as genreId, F.age_rating as ageRating, F.director_id' +
        ' as directorId, U.first_name as directorFirstName, U.last_name as directorLastName, F.release_date as' +
        ' releaseDate, cast(round(ifNull(FR.rating, 0), 2) as float) as rating from film as F left join user as U on ' +
        'F.director_id = U.id ';

    // if defined, only films reviewed by reviewerId is retrieved
    if (!isNaN(reviewerId)) {
        query += `right join (SELECT film_id, Avg(rating) as rating from film_review where
         user_id = ${reviewerId} group by film_id)`;
    } else {
        query += 'left join (SELECT film_id, Avg(rating) as rating from film_review group by film_id)';
    }
    query += ' as FR on F.id = FR.film_id';
    let first = true;

    // if defined, adds search title and description query
    if (q !== undefined) {
        query += `(where F.title like ${q} or F.description like ${q})`
        first = false;
    }

    // if defined, only films with given genres are retrieved
    if (genreIds !== undefined) {
        if (first) {
            query += "(Where "
        } else {
            query += "and (Where "
        }
        if (genreIds.length > 1) {
            for (let i=0; i < genreIds.length; i++) {
                if (i === 0) {
                    query += `genre_id = ${genreIds[0]}`
                } else {
                    query += `or genre_id = ${genreIds[i]}`
                }
            }
            query += ") "
        } else {
            query += `genre_id = ${genreIds[0]}`
        }
        query += ") ";
        first = false;
    }

    // if defined, only films with given age ratings are retrieved
    if (ageRatings !== undefined) {
        if (first) {
            query += "(Where "
        } else {
            query += "and (Where "
        }
        if (ageRatings.length > 1) {
            query += "and (Where "
            for (let i=0; i < ageRatings.length; i++) {
                if (i === 0) {
                    query += `genre_id = ${ageRatings[0]}`
                } else {
                    query += `or genre_id = ${ageRatings[i]}`
                }
            }
        }
        query += ") ";
        first = false;
    }

    // if defined, only films directed by directorId is retrieved
    if (!isNaN(directorId)) {
        if (first) {
            query += ` where director_id = ${directorId}`;
        } else {
            query += ` and director_id = ${directorId}`
        }
    }

    // if defined, films are sorted by the given sortBy parameter
    if (sortBy !== undefined) {
        if (sortBy === "ALPHABETICAL_ASC") {
            query += " order by F.title";
        } else if (sortBy === "ALPHABETICAL_DESC") {
            query += " order by F.title desc";
        } else if (sortBy === "RELEASED_ASC") {
            query += " order by F.release_date";
        } else if (sortBy === "RELEASED_DESC") {
            query += " order by F.release_date desc";
        } else if ( sortBy === "RATING_ASC") {
            query += " order by rating";
        } else if (sortBy === "RATING_DESC") {
            query += " order by rating desc";
        }
    } else {
        query += " order by F.release_date";
    }
    logger.info(query);

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
    const query = 'INSERT into film (title, description, release_date, genre_id,' +
        ' runtime, age_rating, director_id) values (?, ?, ?, ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [ title, description, releaseDate,
        genreId, runtime, ageRating, directorId] );
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

const updateFilm = async (filmId: number, title: string, description: string, releaseDate: string, runtime: number,
                          genreId: number, ageRating: string): Promise<Film[]> => {
    Logger.info(`Updating film ${filmId}`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE film set title = ?, description = ?, release_date = ?, runtime = ?, genre_id = ?,' +
        ' age_rating = ? where id = ?';
    const [ result ] = await conn.query(query, [ title, description, releaseDate, runtime, genreId, ageRating, filmId]);
    await conn.release();
    return result;
}

const getFullbyId = async (id: number): Promise<Film[]> => {
    Logger.info(`Getting all details about film ${id}`);
    const conn = await getPool().getConnection();
    const query = 'SELECT F.id as filmId, F.title, F.description, F.genre_id as genreId, F.director_id as directorId,' +
        ' U.first_name as directorFirstName, U.last_name as directorLastName, F.release_date as releaseDate,' +
        ' F.age_rating as ageRating,F.runtime, ifNull(cast(Round(Avg(FR.rating), 2) as float), 0) as rating,' +
        ' count(FR.id) as numReviews from film as F left join user as U on F.director_id = U.id join film_review' +
        ' as FR on F.id = FR.film_id where F.id = ?';
    const [ result ] = await conn.query( query, [ id ]);
    await conn.release();
    return result;
}

const checkGenres = async (ids: any): Promise<any> => {
    Logger.info(`Checking if all genres exists in the database`);
    const conn = await getPool().getConnection();
    Logger.info(`ids are ${ids}`)
    const query = "SELECT count (*) from genre where id in ${ids}";
    const [ result ] = await conn.query( query );
    await conn.release();
    return result;
}

const getFilmsByDirector = async (id: number): Promise<Film[]> => {
    Logger.info(`Getting al films directed by user ${id}`);
    const conn = await getPool().getConnection();
    const query = `SELECT * from film where director_id = ?`
    const [ result ] = await conn.query(query, [ id ]);
    await conn.release();
    return result;
}



export {getAll, getOneByTitle, insert, getOneById, getGenres, deleteOne, getGenreById, updateFilm,
    getFullbyId, checkGenres, getFilmsByDirector}

// SELECT F.id as filmId, F.title, F.genre_id as genreId, F.age_rating as ageRating, F.director_id as directorId, U.first_name as directorFirstName, U.last_name as directorLastName, F.release_date as releaseDate, ifNull(cast(ROUND(FR.rating, 2) as float), 0) from film as F left join user as U on F.director_id = U.id left join (SELECT film_id, Avg(rating) as rating from film_review group by film_id) as FR on F.id = FR.film_id;