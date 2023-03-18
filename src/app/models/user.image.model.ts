import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import logger from "../../config/logger";

const getOne = async (id: number): Promise<any> => {
    logger.info(`Getting image of user : ${id}}`);
    const conn = await getPool().getConnection();
    const query = `SELECT image_filename from user where id = ?`;
    const [ result ] = await conn.query(query, [ id ]);
    await conn.release();
    return result;
}

// const setImage = async (image: string): Promise<ResultSetHeader> => {
 //   logger.info(`Setting users image to ${image}`)
// }

export {getOne}