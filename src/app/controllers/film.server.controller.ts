import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Validator from "../validator";
import * as user from "../models/user.server.model"
import * as schemas from '../resources/schemas.json';
import * as film from '../models/film.server.model';
import * as image from "../models/user.image.model";
import {getUserById} from "../models/user.server.model";
import logger from "../../config/logger";


const viewAll = async (req: Request, res: Response): Promise<void> => {
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

const getOne = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET film ${req.params.id}`)
    const id = req.params.id;
    try{
        const result = await film.getOneById(parseInt(id, 10));
        if (result.length === 0) {
            res.statusMessage = (`Not found`);
            res.status(404).send(`No film with id ${id}`);
        } else {
            res.status(200).send(result[0]);
        }
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addOne = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST adding film with title: "${req.body.title}`)
    const validation = await Validator.validate(schemas.film_post, req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
    const token = req.header("X-Authorization");
    const title = req.body.title;
    const description = req.body.description;
    let releaseDate = req.body.releaseDate;
    const genreId = req.body.genreId;
    const runtime = req.body.runtime;
    let ageRating = req.body.ageRating;
    const validAgeRating = ["G", "PG", "M", "R16", "R18", "TBC"];
    if (ageRating == null) {
        ageRating = "TBC";
    }
    if (!validAgeRating.includes(ageRating)) {
        res.status(400).send(`Bad request. Invalid age rating`);
    }
    const director = await user.getUserByToken(token);
    const directorId = director[0].id;
    try{
        const genreInDatabase = await film.getGenreById(genreId);
        if (genreInDatabase.length === 0) {
            res.status(400).send(`Bad request. Invalid genre`)
            return;
        }
        if (token === undefined) {
            res.status(401).send('Unauthorized');
            return;
        }
        const testTitle = await film.getOneByTitle(title);
        if (testTitle.length !== 0) {
            res.status(403).send(`Forbidden. Film title is not unique`);
            return;
        }
        const todayDate = new Date().toISOString();
        const todayDateRightFormat = todayDate.substring(0, 10) + " " + todayDate.substring(11, 19);
        if (releaseDate == null) {
            releaseDate = todayDateRightFormat;
        } else{
            logger.info(`Release date: ${releaseDate}`);
            logger.info(`TodayDateRightFormat: ${todayDateRightFormat}`);
            if (releaseDate < todayDateRightFormat) {
                res.status(403).send(`Forbidden. Cannot release a film in the past`);
                return;
            }
        }
        const result = await film.insert(title, description, releaseDate.toString(),
            genreId, runtime, ageRating, directorId);
        res.status(200).send(`filmId: ${result.insertId}`);
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send(err);
        return;
    }
}

const editOne = async (req: Request, res: Response): Promise<void> => {

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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`DELETE film ${req.params.id}`)
    const filmId = req.params.id
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
    }
    try{
        const userLoggedIn = await user.getUserByToken(token);
        const filmToDelete = await film.getOneById(parseInt(filmId, 10));
        if (filmToDelete.length === 0) {
            res.status(404).send('Not found. No such film with ID given');
        }
        if (filmToDelete[0].director_id === userLoggedIn[0].id) {
            // User is the director of the film he/she is trying to delete
            const result = await film.deleteOne(parseInt(filmId, 10));
            res.status(200).send(`OK. Film deleted`)
        } else {
            // User logged in but viewing someone else's image
            res.status( 403 ).send( `Forbidden. Only the director of the film can delete it`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getGenres = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET all genres`)
    try{
        const result = await film.getGenres();
        res.status(200).send(result);
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};