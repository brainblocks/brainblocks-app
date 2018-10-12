/* @flow */
import request from 'supertest';

import app from '../app';
import models from '../models';

const User = models.models.User;

// $FlowFixMe
describe('App', () => {

    // $FlowFixMe
    before((done : Function) => {
        app.listen(3000, (err) => {
            if (err) {
                throw new Error(err);
            }
            done();
        });
    });

    // tests
    // $FlowFixMe
    it('Should return a 200 response status. App responds', (done : Function) => {
        request(app).get('/')
            .expect(200, (err) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('Database responds', (done : Function) => {
        User.findOne({ where: {
            username: 'test'
        } }).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('Sign up test', (done : Function) => {
        User.destroy({
            where: {
                username: 'mochatest',
                email:    'mochatest@bb.io'
            },
            individualHooks: true
        }).then(() => {
            request(app).post('/api/users')
                .set('Content-Type', 'application/json')
                .send({ username: 'mochatest', email: 'mochatest@bb.io', password: 'Password.123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    done(err);
                });
        });
    });
});
