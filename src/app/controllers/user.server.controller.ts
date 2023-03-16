import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import * as argon2 from "argon2";
import * as user from '../models/user.server.model';
import * as Validator from "../validator";

const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST register a user with email: ${req.body.email}`)
    const validation = await Validator.validate(schemas.user_register, req.body);

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    try{
        const testEmail = await user.getOneByEmail(email);
        Logger.http(`${testEmail}`)
        if (testEmail.length === 0) {
            res.status(403).send("Forbidden. Email already in use.")
            return
        }
        const hashedPass = await argon2.hash(password);
        const result = await user.insert( email, firstName, lastName, hashedPass);
        res.status( 201 ).send({"id": result.insertId} );
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send(err);
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
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

const logout = async (req: Request, res: Response): Promise<void> => {
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

const view = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET sinle user id: ${req.params.id}`)
    const id = req.params.id;
    try{
        const result = await user.getUserById( parseInt(id, 10) );
        if (result.length === 0) {
            res.status(404).send('No user with specified ID');
        } else {
            res.status( 200 ).send( result[0] );
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
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

export {register, login, logout, view, update}