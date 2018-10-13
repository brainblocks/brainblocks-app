/* @flow */
import models from '../models';

const User = models.models.User;

export function authenticate(req : Object, res : Object, next : Function) {
    let token = req.header('x-auth-token');

    User.findByToken(token).then((user) => {
        if (!user) {
            throw new Error('No user found under current session');
        }

        req.user = user;
        req.token = token;
        next();
    }).catch(() => {
        // unauthorized
        res.status(401).send({ error: 'Invalid or expired session' });
    });
}
