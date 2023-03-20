import Logger from "../../config/logger";
import {getPool} from "../../config/db";

const list = async (id: number): Promise<FilmReview[]> => {
    Logger.info(`Getting all reviews for film ${id}`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * from film_review where film_id = ? ORDER BY timestamp DESC';
    const [ rows ] = await conn.query(query, [ id ]);
    await conn.release();
    return rows;
}

const addReview = async (filmId: number, directorId: number, rating: number, review: string, timestamp: string): Promise<FilmReview[]> => {
    Logger.info(`Adding a review for film ${filmId}`);
    const conn = await getPool().getConnection();
    const query = `INSERT into film_review (filmId, directorId, rating, review, timestamp) values (?, ?, ?, ?, ?)`;
    const [ result ] = await conn.query(query, [ filmId, directorId, rating, review, timestamp ]);
    await conn.release();
    return result;
}

export {list}