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
    await conn.release();
    return result;
}

const setImage = async (id: number, image: string): Promise<ResultSetHeader> => {
    logger.info(`Setting user ${id}'s image to ${image}`);
    const conn = await getPool().getConnection();
    const query = `UPDATE user set image_filename = ? where id = ?`;
    const [ result ] = await conn.query(query, [image, id]);
    return result;
}

const deleteImage = async (id:number): Promise<ResultSetHeader> => {
    logger.info(`Deleting user ${id}'s image`);
    const conn = await getPool().getConnection();
    const query = `UPDATE user set image_filename = NULL where id = ?`;
    const [ result ] = await conn.query(query, [ id ])
    await conn.release();
    return result;
}

export {getOne, setImage, deleteImage}