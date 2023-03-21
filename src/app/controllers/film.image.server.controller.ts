import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as user from "../models/user.server.model";
import * as film from "../models/film.server.model"
import path from "path";
import * as image from "../models/film.image.model";
import logger from "../../config/logger";


const getImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET film ${req.params.id}'s image`);
    const id = req.params.id;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    try {
        const result = await film.getOneById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send(`Bad request. No film with such Id`);
            return;
        }
        if (result[0].image_filename === null) {
            res.status(404).send(`Bad request. film has no Image`);
            return;
        } else {
            const filename = result[0].image_filename.toLowerCase();
            const imageFile = path.resolve(`storage/images/${filename}`);
            res.status(200).sendFile(imageFile);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`PATCH setting film ${req.params.id}'s image`)
    // tslint:disable-next-line:no-shadowed-variable
    const file = require('fs');
    const fs = file.promises;
    const contentType = req.headers["content-type"];
    logger.info(`ContentType is ${contentType}`);
    const id = req.params.id;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    const imageFile = req.body;
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
    }
    const acceptedType = ["image/png", "image/jpeg", "image/gif"]
    if (!acceptedType.includes(contentType)) {
        res.status(400).send(`Bad request. Invalid image supplied (possibly incorrect file type)`)
        return;
    }
    let imageFormat;
    if (contentType === "image/png") {
        imageFormat = "png";
    } else if (contentType === "image/jpeg") {
        imageFormat = "jpeg";
    } else if (contentType === "image/gif") {
        imageFormat = 'gif'
    }
    try{
        if(!Buffer.isBuffer(imageFile)) {
            res.status(400).send(`Bad request. Invalid image supplied (possibly incorrect file type)`)
            return;
        }
        const result = await film.getOneById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send('Not found. No film with such Id');
        }
        const editor = await user.getUserByToken(token);
        if (editor[0].auth_token === token) {
            if (!acceptedType.includes(contentType)) {
                res.status(400).send(`Bad Request. Invalid image supplied (possibly incorrect file type)`);
                return;
            }
            const imageFilename = `film${id}${token}.${imageFormat}`.toLowerCase()
            await fs.writeFile(`storage/images/${imageFilename}`, imageFile);
            // Current user is authenticated and viewing their details
            if (result[0].image_filename === null) {
                // No current image
                await image.setImage(parseInt(id, 10), imageFilename);
                res.status(201).send(`Created. New image created`);
            } else {
                await image.setImage(parseInt(id, 10), imageFilename);
                res.status(200).send(`OK. Image updated`)
            }
        } else {
            // User logged in but not the director of the film
            res.status( 403 ).send( `Forbidden. Only the director of a film can change the hero image`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage};