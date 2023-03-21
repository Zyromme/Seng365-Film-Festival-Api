import {ResultSetHeader} from "mysql2";
import logger from "../../config/logger";
import {getPool} from "../../config/db";

const setImage = async (id: number, image: string): Promise<ResultSetHeader> => {
    logger.info(`Setting user ${id}'s image to ${image}`);
    const conn = await getPool().getConnection();
    const query = `UPDATE film set image_filename = ? where id = ?`;
    const [ result ] = await conn.query(query, [image, id]);
    return result;
}

export {setImage}