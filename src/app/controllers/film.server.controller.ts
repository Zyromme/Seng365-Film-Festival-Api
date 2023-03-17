import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Validator from "../validator";
import * as schemas from '../resources/schemas.json';
import * as film from '../models/film.server.model';


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
    const title = req.body.title;
    const description = req.body.description;
    const releaseDate = req.body.releaseDate;
    const genreId = req.body.genreId;
    const runtime = req.body.runtime;
    const ageRating = req.body.ageRating;
    try{
       // const testTitle = await film.getOneByTitle(title);
        // if (testTitle.length === 0) {
        //    cont titleInDatabaseDate = new Date(testTitle.releaseDate)
        //    if ()
        //    const today = new Date();
          //  const currentDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() +' '
            //    + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        // }
        const result = await film.insert(title, description, releaseDate.toString(), genreId, runtime, ageRating);
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

const getGenres = async (req: Request, res: Response): Promise<void> => {
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

export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};