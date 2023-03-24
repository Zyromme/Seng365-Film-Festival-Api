import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as image from "../models/user.image.model";
import * as user from "../models/user.server.model";
import path = require("path");
import file from "fs";


const getImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET user ${req.params.id}'s image`);
    const id = req.params.id;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    try{
        const result = await user.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send(`Bad request. No user with such Id`);
        }
        if (result[0].image_filename === null) {
            res.status(404).send(`Bad request. User has no Image`);
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
    Logger.http(`PATCH setting user ${req.params.id}'s image`)
    // tslint:disable-next-line:no-shadowed-variable
    const file = require('fs');
    const fs = file.promises;
    const contentType = req.header("Content-Type");
    const id = req.params.id;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    const imageFile = req.body;
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
        return;
    }
    const acceptedType = ["image/png", "image/jpeg", "image/gif"]
    if (!acceptedType.includes(contentType)) {
        res.status(400).send(`Bad request. Invalid image supplied (possibly incorrect file type)`);
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
            res.status(400).send(`Bad request. Invalid image supplied (possibly incorrect file type)`);
            return;
        }
        const result = await user.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send('Not found. No such user with ID given');
            return;
        }
        if (result[0].auth_token === token) {
            if (!acceptedType.includes(contentType)) {
                res.status(400).send(`Bad Request. Invalid image supplied (possibly incorrect file type)`);
                return;
            }
            const imageFilename = `${id}${token}.${imageFormat}`.toLowerCase()
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
            // User logged in but viewing someone else's image
            res.status( 403 ).send( `Forbidden. Can not change another user's profile photo`);
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`DELETE profile picture of user with email: ${req.body.email}`)
    const fs = file.promises;
    const id = req.params.id;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
        return;
    }
    try{
        const result = await user.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send('Not found. No such user with ID given');
        }
        if (result[0].auth_token === token) {
            // Current user is authenticated to delete their image
            await fs.unlink(`storage/images/${result[0].image_filename}`)
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