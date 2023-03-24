import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Validator from "../validator";
import * as user from "../models/user.server.model"
import * as schemas from '../resources/schemas.json';
import * as film from '../models/film.server.model';
import * as filmReview from '../models/film.review.model'
import {checkRatings} from "../models/film.server.model";


const viewAll = async (req: Request, res: Response): Promise<void> => {
    const validation = await Validator.validate(schemas.film_search, req.query);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
    try{
        let startIndex = parseInt(req.query.startIndex as string, 10);
        let count = parseInt(req.query.count as string, 10);
        const q = req.query.q as string;
        const genreIds = req.query.genreIds;
        const ageRatings = req.query.ageRatings;
        const directorId = req.query.directorId as string;
        const reviewerId = req.query.reviewerId as string;
        let sortBy = req.query.sortBy as string;
        if (genreIds !== undefined) {
            const genreCheck = await film.checkGenres(genreIds);
            if  (genreCheck.length !== genreIds.length) {
                res.status(400).send(`Bad request. Invalid genre id`)
                return;
            }
        }

        if (ageRatings !== undefined) {
            if (!checkRatings(ageRatings)) {
                res.status(400).send(`Bad request. Age rating invalid`)
                return;
            }

        }
        if (directorId !== undefined) {
            const directorCheck = await film.getFilmsByDirector(parseInt(directorId, 10));
            if (directorCheck.length === 0) {
                res.status(400).send(`Bad request. User ${parseInt(directorId, 10)} has not directed a film`)
                return;
            }
        }
        if (reviewerId !== undefined) {
            const reviewerCheck = await filmReview.getReviewsByUser(parseInt(reviewerId, 10));
            if (reviewerCheck.length === 0) {
                res.status(400).send(`Bad request. user ${parseInt(reviewerId, 10)} has not reviewed any film`);
                return;
            }
        }
        const validSortBy = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "RELEASED_ASC", "RELEASED_DESC", "RATING", "RATING_DESC"]
        if (sortBy !== undefined) {
            if (!validSortBy.includes(sortBy)) {
                res.status(400).send(`Bad request. SortBy valid values are only ALPHABETICAL_ASC,
                 ALPHABETICAL_DESC, RELEASED_ASC, RELEASED_DESC, RATING_ASC, RATING_DESC`)
                return;
            }
        } else {
            sortBy = "RELEASED_ASC"
        }
        const result = await film.getAll(q, genreIds,
            ageRatings, parseInt(directorId, 10), parseInt(reviewerId, 10), sortBy);

        if (isNaN(startIndex)) {
            startIndex = 0
        }
        if (!isNaN(count)) {
            count += startIndex;
        } else {
            count = result.length;
        }
        if (count > (result.length - startIndex)) {
            count = result.length + 1;
        }
        res.status(200).send({"films": result.slice(startIndex, count), "count": result.length})
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
    if (isNaN(parseInt(id, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    try{
        const existTest = await film.getOneById(parseInt(id, 10));
        if (existTest.length === 0) {
            res.statusMessage = (`Not found`);
            res.status(404).send(`No film with id ${id}`);
            return;
        } else {
            const result = await film.getFullbyId(parseInt(id, 10));
            res.status(200).send(result[0]);
            return;
        }
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
        return;
    }
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
        const director = await user.getUserByToken(token);
        if (director.length === 0) {
            res.status(401).send(`Unauthorized`);
            return;
        }
        const directorId = director[0].id;
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
            if (releaseDate < todayDateRightFormat) {
                res.status(403).send(`Forbidden. Cannot release a film in the past`);
                return;
            }
        }
        const result = await film.insert(title, description, releaseDate.toString(),
            genreId, runtime, ageRating, directorId);
        res.status(201).send({"filmId": result.insertId});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send(err);
        return;
    }
}

const editOne = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`PATCH editing film: ${req.params.id}`)
    const validation = await Validator.validate(schemas.film_patch, req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
    const filmId = req.params.id
    if (isNaN(parseInt(filmId, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    const token = req.header("X-Authorization");
    let title = req.body.title;
    let description = req.body.description;
    let releaseDate = req.body.releaseDate;
    let genreId = req.body.genreId;
    let runtime = req.body.runtime;
    let ageRating = req.body.ageRating;
    const validAgeRating = ["G", "PG", "M", "R16", "R18", "TBC"];
    try{
        // Check if user is logged in
        if (token === undefined) {
            res.status(401).send('Unauthorized');
            return;
        }
        const filmEdit = await film.getOneById(parseInt(filmId, 10));
        // Check age rating
        if (ageRating !== undefined) {
            if (!validAgeRating.includes(ageRating)) {
                res.status(400).send(`Bad request. Invalid age rating`)
                return;
            }
        } else {
            ageRating = filmEdit[0].age_rating;
        }
        // Check if film exists
        if (filmEdit.length === 0) {
            res.status(404).send(`No film found with id`);
            return;
        }
        // Check if film has been reviewed
        const reviewCheck = await filmReview.list(parseInt(filmId, 10));
        if (reviewCheck.length !== 0) {
            res.status(403).send(`Forbidden. Cannot edit a film that's already been reviewed`);
            return;
        }
        // Check if the director is requesting edits
        const editor = await user.getUserByToken(token);
        if (editor[0].id !== filmEdit[0].director_id) {
            res.status(403).send(`Forbidden. Only the director may change film details`);
            return;
        }
        // Check if title is valid
        if (title !== undefined) {
            const titleCheck = await film.getOneByTitle(title);
            if (titleCheck.length !== 0) {
                res.status(400).send(`Forbidden. Film title is not unique`)
                return;
            }
        } else {
            title = filmEdit[0].title;
        }
        // Check genre
        if (genreId !== undefined) {
            const genresCheck = await film.getGenreById(genreId);
            if (genresCheck.length === 0) {
                res.status(400).send(`Bad request. Invalid genre`)
                return;
            }
        } else {
            genreId = filmEdit[0].genre_id;
        }
        // Check release date
        const todaysDate = new Date(Date.now());
        const oldReleaseDate = new Date(filmEdit[0].release_date);
        if (releaseDate !== undefined) {
            if (oldReleaseDate < todaysDate) {
                res.status(403).send(`Cannot change the release date since it has already passed`);
                return;
            }
            if (releaseDate < todaysDate) {
                res.status(403).send(`Cannot release a film in the past`);
                return;
            }
        } else {
                releaseDate = oldReleaseDate;
        }
        // Check description
        if (description === undefined) {
            if (description === "") {
                res.status(400).send(`Bad request. Description cannot be empty`);
                return;
            }
            description = filmEdit[0].description;
        }
        // Check runtime
        if (runtime === undefined) {
            runtime = filmEdit[0].runtime;
        }
        await film.updateFilm(parseInt(filmId, 10), title, description, releaseDate, runtime, genreId, ageRating);
        res.status(200).send(`OK. Film details edited`)
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
    if (isNaN(parseInt(filmId, 10))) {
        res.status(400).send(`Bad request. Id given is not a number`);
        return;
    }
    const token = req.header("X-Authorization");
    if (token === undefined) {
        res.status(401).send('Unauthorized');
        return;
    }
    try{
        const userLoggedIn = await user.getUserByToken(token);
        const filmToDelete = await film.getOneById(parseInt(filmId, 10));
        if (filmToDelete.length === 0) {
            res.status(404).send('Not found. No such film with ID given');
            return;
        }
        if (filmToDelete[0].director_id === userLoggedIn[0].id) {
            // User is the director of the film he/she is trying to delete
            await film.deleteOne(parseInt(filmId, 10));
            res.status(200).send(`OK. Film deleted`)
            return;
        } else {
            // User logged in but viewing someone else's image
            res.status( 403 ).send( `Forbidden. Only the director of the film can delete it`);
            return;
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