import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as image from "../models/user.image.model";
import * as users from "../models/user.server.model";
import logger from "../../config/logger";
import * as user from "../models/user.server.model";


const getImage = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try{
        const result = image.getOne(parseInt(id, 10));
        res.statusMessage = "Not Implemented Yet!";
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const setImage = async (req: Request, res: Response): Promise<void> => {
    const contentType = req.header("Content-Type")
    const id = req.params.id;
    const token = req.header("X-Authorization")
    if (token === undefined) {
        res.status(401).send('Unauthorized');
    }
    const acceptedType = ["image/png", "image/jpeg", "image/gif"]

    try{
        const result = await user.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send('Not found. No such user with ID given');
        }
        if (result[0].auth_token === token) {
            if (!acceptedType.includes(contentType)) {
                res.status(400).send(`Bad Request. Invalid image supplied (possibly incorrect file type)`);
                return;
            }
            // Current user is authenticated and viewing their details
            if (result[0].image_filename === null) {
                // No current image
                res.status(201).send(`Create. New image created`)
            } else {
                // Changing image
                res.status(200).send(`OK. Image updated`)
            }
        } else {
            // User logged in but viewing someone else's image
            res.status( 403 ).send( `Forbidden. Can not change another user's profile photo`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}