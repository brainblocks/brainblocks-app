/* @flow */
import { Op } from 'sequelize';
import ErrorResponse from "../responses/error_response";
import SuccessResponse from "../responses/success_response";
import Recaptcha from "../services/recaptcha";

import db from '../models';

const { User, UserToken, PasswordChange } = db.models;

export default class {
    // Checks the headers for an x-auth-token and return sthe validate session + user data if one is found
    // Returns a 401 if no auth token is set, is invalid, or is expired
    // Depends on the authentication middleware
    static async fetch(req : Object, res : Object) : Object {
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);
        const { user, token } = req;

        if (!user || !token) {
            return error.unauthorized('Invalid or expired session')
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
            return error.unauthorized('Invalid or expired session')
        }

        return success.send({
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
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);
        const { password, username, email, recaptcha } = req.body;
        let searchBy;

        if(!username && !email) {
            return error.badRequest("Username or email must be provided")
        }

        if(!password) {
            return error.badRequest("Password must be provided")
        }

        if(!recaptcha) {
            return error.badRequest("Recaptcha must be provided")
        }

        if(!await Recaptcha.verify(recaptcha)) {
            return error.forbidden("Invalid Recaptcha")
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
            return error.forbidden("Invalid Credentials");
        }

        const check = await user.checkPassword(password);

        if (!check) {
            return error.forbidden("Invalid Credentials");
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

        return success.send({
            status:  'success',
            user:    user.getPublicData(),
            token:   token.getJWT().toString(),
            expires: token.expires
        });
    }

    // Attempts to destroy the existing session. Acts as a logout
    // Returns a 400 if the session is invalid
    static async logout(req : Object, res : Object) : Object {
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);
        const userToken = await UserToken.fromRawToken(req.token);

        if (!userToken) {
            return error.badRequest("Token must be provided")
        }

        userToken.destroy();
        return success.send("Successfully Logged out");
    }

    // Attempts to change the user password, should be authenticated
    // Requires password and newPassword
    // Returns a 401 if password is incorrect, updates the password if it is correct and returns a 200
    // Should maybe pass through 2fa too?
    static async changePassword(req : Object, res : Object) : Object {
        if (!await req.user.checkPassword(req.body.password)) {
            return res.status(401).send({ error: 'Incorrect password' });
        }

        return await db.sequelize.transaction((t : Object) => {
            let oldHash = req.user.passHash;
            return req.user.update({ password: req.body.newPassword }, { transaction: t }).then((user) => {
                return PasswordChange.create({
                    userId:          user.id,
                    oldPasswordHash: oldHash,
                    ip:              req.ip
                }, { transaction: t });
            });
        }).then(() => {
            return res.status(200).send({ status: 'success' });
        }).catch((err) => {
            console.error(err);
            return res.status(500).send({ error: 'There was an error trying to process your request' });
        });
    }
}
