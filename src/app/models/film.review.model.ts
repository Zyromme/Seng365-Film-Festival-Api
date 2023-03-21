import Logger from "../../config/logger";
import {getPool} from "../../config/db";

const list = async (id: number): Promise<FilmReview[]> => {
    Logger.info(`Getting all reviews for film ${id}`);
    const conn = await getPool().getConnection();
    const query = `SELECT FR.user_id as reviewerId, U.first_name as reviewerFirstName, U.last_name as reviewerLastName,
 FR.rating, review, timestamp from film_review as FR left join user as U on FR.user_id = U.id where film_id = ? ORDER BY timestamp DESC`;
    const [ rows ] = await conn.query(query, [ id ]);
    await conn.release();
    return rows;
}

const addReview = async (filmId: number, userId: number, rating: number,
                         review: string, timestamp: string): Promise<FilmReview[]> => {
    Logger.info(`Adding a review for film ${filmId}`);
    const conn = await getPool().getConnection();
    const query = `INSERT into film_review (film_id, user_id, rating, review, timestamp) values (?, ?, ?, ?, ?)`;
    const [ result ] = await conn.query(query, [ filmId, userId, rating, review, timestamp ]);
    await conn.release();
    return result;
}

export {list, addReview}