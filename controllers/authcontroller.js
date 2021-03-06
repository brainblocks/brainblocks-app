/* @flow */
import crypto from 'crypto';

import { Op } from 'sequelize';

import ErrorResponse from '../responses/error_response';
import SuccessResponse from '../responses/success_response';
import Recaptcha from '../services/recaptcha';
import db from '../models';

const { User, UserToken, LoginLog, AuthorizedIp } = db.models;

type LoginInfo = {
    userId : number,
    success : boolean,
    failReason : null | string,
    attemptCount : number,
    ip : string,
    requestData : string
};

export default class {
    // Checks the headers for an x-auth-token and returns the validate session + user data if one is found
    // Returns a 401 if no auth token is set, is invalid, or is expired
    // Depends on the authentication middleware
    static async fetch(req : Object, res : Object) : Object {
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);
        const { user, token } = req;

        if (!user || !token) {
            return error.unauthorized('Invalid or expired session');
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
            return error.unauthorized('Invalid or expired session');
        }

        return success.send({
            status:  'success',
            user:    await user.getPublicData(),
            token:   userToken.getJWT().toString(),
            expires: userToken.expires
        });
    }

    // Attempts to create a new session given username/email and password + twoFactorAuth
    // returns a 400 if the credentials are invalid
    // Will return the existing session information and the users public information if verified
    // eslint-disable-next-line complexity
    static async login(req : Object, res : Object) : Object {
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);
        const { password, username, email, recaptcha, token2fa } = req.body;
        let searchBy;

        // Defines template of information to store in loginInfo table
        let loginInfo : LoginInfo = {
            userId:       -1,
            success:      false,
            failReason:   null,
            attemptCount: 0,
            ip:           req.headers['x-real-ip'] || req.connection.remoteAddress,
            requestData:  JSON.stringify(req.body)
        };

        // If neither username nor email are provided with the request
        if (!username && !email) {
            return error.badRequest('Username or email must be provided');
        }

        // If password is not provided in request
        if (!password) {
            return error.badRequest('Password must be provided');
        }

        // Only enforce recaptcha if defined in env
        if (process.env.ENFORCE_RECAPTCHA === 'true') {
            if (!recaptcha) {
                return error.badRequest('Recaptcha must be provided');
            }

            if (!await Recaptcha.verify(recaptcha)) {
                return error.forbidden('Invalid Recaptcha');
            }
        }

        // Get user
        if (username) {
            searchBy = { username };
        } else {
            searchBy = { email };
        }

        const user = await User.findOne({
            where: searchBy
        });

        // If user not found
        if (!user) {
            loginInfo.failReason = 'User not found';
            LoginLog.create(loginInfo);
            return error.forbidden('Invalid Credentials');
        }

        loginInfo.userId = user.id;

        // Bad attempts throttling
        if (process.env.ENFORCE_BAD_ATTEMPTS_THROTTLE === 'true') {
            // Calulate amount of attempts and time since last attempt
            let lastSuccessId = (await LoginLog.max('id', { where: { 'userId': loginInfo.userId, 'success': true } })) || 0;
            loginInfo.attemptCount = (await LoginLog.count({ where: { 'userId': loginInfo.userId, 'success': false, 'id': { [Op.gt]: lastSuccessId } } }) + 1);

            let lastAttemptTime = await LoginLog.max('createdAt', { where: { 'userId': loginInfo.userId } });
            let minutesSinceLastAttempt = ((Date.now() - lastAttemptTime) / 60000);

            // Block attempts
            if (loginInfo.attemptCount > 3 && minutesSinceLastAttempt < 5) {
                loginInfo.failReason = 'Too many failed attempts';
                LoginLog.create(loginInfo);
                return error.forbidden('Too many bad attempts, please wait 5 minutes.');
            }
        }

        // Check if IP authorized
        if (process.env.ENFORCE_IP_AUTH === 'true') {
            const checkIp = await AuthorizedIp.findOne({
                where: { 'userId': loginInfo.userId, 'ip': loginInfo.ip, 'authorized': true }
            });

            // If IP not found
            if (!checkIp) {

                let authip = {
                    userId:       loginInfo.userId,
                    ip:           req.headers['x-real-ip'] || req.connection.remoteAddress,
                    randId:       crypto.randomBytes(20).toString('hex')
                };

                AuthorizedIp.create(authip);

                await user.sendIpAuthEmail(authip.randId);

                loginInfo.failReason = 'IP not authorized';
                LoginLog.create(loginInfo);
                return error.forbidden('Please authorize IP');
            }
        }

        // Check password
        const check = await user.checkPassword(password);

        // If password is incorrect
        if (!check) {
            loginInfo.failReason = 'Wrong password';
            LoginLog.create(loginInfo);
            return error.forbidden('Invalid Credentials');
        }

        // If 2FA is enabled but no 2FA token is provided in request
        if (user.is2FAEnabled && !token2fa) {
            loginInfo.failReason = 'No 2FA';
            LoginLog.create(loginInfo);
            return error.send('Please enter 2FA token', 401, {
                reason: '2FA_REQUIRED'
            });
        }

        // Check 2FA token
        if (user.is2FAEnabled && token2fa) {
            try {
                await user.check2fa(token2fa);
            } catch (err) {
                loginInfo.failReason = 'Wrong 2FA';
                LoginLog.create(loginInfo);
                return error.send('Incorrect 2FA Code', 403, {
                    reason: '2FA_INCORRECT'
                });
            }
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

        loginInfo.success = true;
        LoginLog.create(loginInfo);

        return success.send({
            status:  'success',
            user:    await user.getPublicData(),
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
            return error.badRequest('Token must be provided');
        }

        try {
            await userToken.destroy();
            return success.send('Successfully Logged out');
        } catch (err) {
            console.error(`Error logging out`, err);
            return error.send('Could not log out');
        }
    }

    static async validatepwd(req : Object, res : Object) : Object {
        const error = new ErrorResponse(res);
        const success = new SuccessResponse(res);

        const { password } = req.body;
        const { user } = req;

        // If password is not provided in request
        if (!password) {
            return error.badRequest('Password must be provided');
        }

        // Check password
        const check = await user.checkPassword(password);

        // If password is incorrect
        if (!check) {
            return error.forbidden('False');
        }

        // If correct
        return success.send('True');
    }

}
