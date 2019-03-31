/* @flow */
import models from '../models';

const User = models.models.User;

export function authenticate(req : Object, res : Object, next : Function) {
    let token = req.header('x-auth-token');

    User.findByToken(token).then((ret) => {
        let user = ret[0];
        let tokenObject = ret[1];
        if (!user) {
            throw new Error('No user found under current session');
        }

        req.user = user;
        req.token = tokenObject;
        next();
    }).catch(err => {
        // unauthorized
        console.error('Auth error', err);
        res.status(401).send({ error: 'Invalid or expired session' });
    });
}
