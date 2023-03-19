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

const addReview = async (filmId: number)

export {list}