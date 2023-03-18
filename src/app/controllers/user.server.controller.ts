import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import * as argon2 from "argon2";
import * as user from '../models/user.server.model';
import * as Validator from "../validator";
import {uid, suid} from "rand-token";

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
        if (testEmail.length !== 0) {
            res.status(403).send("Forbidden. Email already in use.")
            return
        }
        const hashedPass = await argon2.hash(password);
        const result = await user.insert( email, firstName, lastName, hashedPass);
        res.status( 201 ).send({"userId": result.insertId} );
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST login user: ${req.body.email}`)
    const validation = await Validator.validate(schemas.user_login, req.body);

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
    const email = req.body.email;
    const password = req.body.password;
    try{
        const userLoggingIn = await user.getOneByEmail(email);
        if (await argon2.verify(userLoggingIn[0].password, password)) {
            const token = uid(10);
            const result = await user.login(email, token);
            if (result.affectedRows === 1) {
                res.status( 200 ).send({"userId": userLoggingIn[0].id, "token": token} );
            }
        } else {
            res.statusMessage = `Not Authorised`
            res.status(401).send(`Incorrect email/password`)
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST Logging out user`)
    try{
        const token = req.header("X-Authorization")
        const result = await user.logout(token);
        if (result.changedRows === 0) {
            res.statusMessage = `Not Authorised`;
            res.status(401).send(`Cannot log out if you are not authenticated`);
        } else {
            res.status(200).send(`Logged out successfully`);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = req.params.id;
    const token = req.header("X-Authorization")
    try{
        const result = await user.getUserById( parseInt(id, 10) );
        if (result.length === 0) {
            res.status(404).send('No user with specified ID');
        } else {
            if (result[0].auth_token === token) {
                // Current user is authenticated and viewing their details
                res.status( 200 ).send( {"email":result[0].email, "firstName": result[0].first_name, "lastName": result[0].last_name} );
            } else {
                // User not logged in or viewing other user
                res.status( 200 ).send( {"firstName": result[0].first_name, "lastName": result[0].last_name} );
            }
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`PATCH editing user: ${req.body.email}`)
    const validation = await Validator.validate(schemas.user_edit, req.body);

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`
        res.status(400).send(`Bad Request: ${validation.toString()}`)
        return
    }
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