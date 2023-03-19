import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as image from "../models/user.image.model";
import * as users from "../models/user.server.model";
import logger from "../../config/logger";
import * as user from "../models/user.server.model";


const getImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET user ${req.params.id}'s image`);
    const id = req.params.id;
    const token = req.header("X-Authorization");
    try{
        const result = await user.getUserById(parseInt(id, 10));
        if (result[0].image_filename === null) {
            // user has no image

            res.status(404).send(result[0].image_filename);
        } else {
            res.status(200).send(`OK`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const setImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`PATCH setting user ${req.params.id}'s image`)
    const contentType = req.header("Content-Type");
    const id = req.params.id;
    const imageFile = req.body;
    const token = req.header("X-Authorization");
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
                await image.setImage(parseInt(id, 10), imageFile);
                res.status(201).send(`Create. New image created`);
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
    Logger.http(`DELETE register a user with email: ${req.body.email}`)
    const id = req.params.id;
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
    }
    try{
        const result = await user.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send('Not found. No such user with ID given');
        }
        if (result[0].auth_token === token) {
            // Current user is authenticated to delete their image
            await image.deleteImage(parseInt(id, 10));
            res.status(200).send(`OK. Image deleted`);
        } else {
            // User logged in but trying to delete someone else's image
            res.status( 403 ).send( `Forbidden. Cannot delete another user's profile photo`);
        }
        // Your code goes here
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}