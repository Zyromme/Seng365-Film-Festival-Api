import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as filmReview from "../models/film.review.model"
import * as film from "../models/film.server.model";
import * as user from "../models/user.server.model"

const getReviews = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET all film ${req.params.id}'s reviews`)
    const id = req.params.id;
    try{
        const result = await filmReview.list(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send(`Not found. No film found with id`);
            return;
        } else {
            res.status(200).send(result);
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const addReview = async (req: Request, res: Response): Promise<void> => {
    const filmId = req.params.id;
    const rating = req.body.review;
    const token = req.header("X-Authorization");
    const validRating = [1, 2, 3, 4, 5 ,6 ,7, 8, 9, 10];
    if (!validRating.includes(rating)) {
        res.status(400).send(`Bad Request. Rating must be between 1-10(inclusive)`)
    }
    try{
        const filmReviewed = await film.getOneById(parseInt(filmId, 10));
        if (filmReviewed.length === 0) {
            res.statusMessage = (`Not found`);
            res.status(404).send(`No film with id ${filmId}`);
            return;
        }
        if (token === undefined) {
            res.status(401).send('Unauthorized');
            return;
        }
        const reviewer = await user.getUserByToken(token);
        if (reviewer.length === 0) {
            res.status(401).send('Unauthorized');
            return;
        }
        const todayDate = new Date().toISOString();
        const todayDateRightFormat = todayDate.substring(0, 10) + " " + todayDate.substring(11, 19);
        if (filmReviewed[0].release_date.toString() > todayDateRightFormat) {
            res.status(403).send(`Forbidden. Cannot post a review on a film that has not yet released`);
            return;
        }
        if (filmReviewed[0].director_id === reviewer[0].id) {
            res.status(403).send(`Forbidden. Cannot review your own film`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



export {getReviews, addReview}