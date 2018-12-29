/* @flow */
import { Op } from 'sequelize';
import ErrorResponse from "../responses/error_response";
import SuccessResponse from "../responses/success_response";
import Recaptcha from "../services/recaptcha";

import db from '../models';

const { User, UserToken } = db.models;

export default class {
    // Checks the headers for an x-auth-token and return sthe validate session + user data if one is found
    // Returns a 401 if no auth token is set, is invalid, or is expired
    // Depends on the authentication middleware
    static async fetch(req : Object, res : Object) : Object {
        const { user, token } = req;

        if (!user || !token) {
            return new ErrorResponse(res).unauthorized('Invalid or expired session')
        }

        let userToken = await UserToken.findOne({
            where: {
                userId:  user.id,
                expires: {
                    [Op.gt]: new Date(Date.now())
                }
            }
        });

        if (!userToken) {
            return new ErrorResponse(res).unauthorized('Invalid or expired session')
        }

        new SuccessResponse(res).send({
            status:  'success',
            user:    user.getPublicData(),
            token:   userToken.getJWT().toString(),
            expires: userToken.expires
        })
    }

    // Attempts to create a new session given username/email and password + twoFactorAuth
    // returns a 400 if the credentials are invalid
    // Will return the existing session information and the users public information if verified
    static async login(req : Object, res : Object) : Object {
        const { password, username, email, recaptcha } = req.body;
        let searchBy;

        if(!username && !email) {
            return new ErrorResponse(res).badRequest("Username or email must be provided")
        }

        if(!password) {
            return new ErrorResponse(res).badRequest("Password must be provided")
        }

        if(!recaptcha) {
            return new ErrorResponse(res).badRequest("Recaptcha must be provided")
        }

        if(!await Recaptcha.verify(recaptcha)) {
            return new ErrorResponse(res).forbidden("Invalid Recaptcha")
        }

        if (username) {
            searchBy = { username };
        } else {
            searchBy = { email };
        }

        const user = await User.findOne({
            where: searchBy
        });

        if (!user) {
            return new ErrorResponse(res).forbidden("Invalid Credentials");
        }

        const check = await user.checkPassword(password);

        if (!check) {
            return new ErrorResponse(res).forbidden("Invalid Credentials");
        }

        let token = await UserToken.findOne({
            where: {
                userId:  user.id,
                expires: {
                    [Op.gt]: new Date(Date.now())
                }
            }
        });

        if (!token) {
            token = await user.generateAuthToken();
        }

        res.status(200).send({
            status:  'success',
            user:    user.getPublicData(),
            token:   token.getJWT().toString(),
            expires: token.expires
        });
    }

    // Attempts to destroy the existing session. Acts as a logout
    // Returns a 400 if the session is invalid
    static async logout(req : Object, res : Object) : Object {
        const userToken = await UserToken.fromRawToken(req.token);

        if (!userToken) {
            return req.status(400).send({
                error: 'Token not found'
            });
        }

        userToken.destroy();
        return res.status(200).send({
            status: 'success'
        });
    }
}
