/* @flow */
import { Op } from 'sequelize';

import db from '../models';

const { User, UserToken } = db.models;

export default class {
    // Checks the headers for an x-auth-token and return sthe validate session + user data if one is found
    // Returns a 401 if no auth token is set, is invalid, or is expired
    // Depends on the authentication middleware
    static async fetch(req : Object, res : Object) : Object {
        const { user, token } = req;

        if (!user || !token) {
            return res.status(401).send({
                error: 'Invalid or expired session'
            });
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
            return res.status(401).send({
                error: 'Invalid or expired session'
            });
        }

        res.status(200).send({
            status:  'success',
            user:    user.getPublicData(),
            token:   userToken.getJWT().toString(),
            expires: userToken.expires
        });
    }

    // Attempts to create a new session given username/email and password + twoFactorAuth
    // returns a 400 if the credentials are invalid
    // Will return the existing session information and the users public information if verified
    static async login(req : Object, res : Object) : Object {
        const { password, username, email } = req.body;
        let searchBy;

        if (username) {
            searchBy = { username };
        } else if (email) {
            searchBy = { email };
        } else {
            return res.status(400).send({
                error: 'Malformed request'
            });
        }

        const user = await User.findOne({
            where: searchBy
        });

        if (!user) {
            return res.status(400).send({
                error: 'Invalid credentials'
            });
        }

        const check = await user.checkPassword(password);

        if (!check) {
            return res.status(400).send({
                error: 'Invalid credentials'
            });
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
