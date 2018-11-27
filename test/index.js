/* @flow */
import request from 'supertest';

import app from '../app';
import models from '../models';

const User = models.models.User;
const Contact = models.models.Contact;

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

    // $FlowFixMe
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

    // $FlowFixMe
    describe('Session tests', () => {
        let sessionToken;
        before((done : Function) => {
            // login and keep session token for next tests
            request(app).post('/api/auth')
                .set('Content-Type', 'application/json')
                .send({ username: 'mochatest_sout', password: 'mochatestpassword' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    sessionToken = res.body.token;
                    done(err);
                });
        });

        it('Login test (email)', (done : Function) => {
            request(app).post('/api/auth')
                .set('Content-Type', 'application/json')
                .send({ email: 'mochatest@mochatest.fave', password: 'mochatestpassword' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    done(err);
                });
        });

        it('Login test (invalid credentials)', (done : Function) => {
            request(app).post('/api/auth')
                .set('Content-Type', 'application/json')
                .send({ email: 'mochatest@mochatest.fave', password: 'invalid password here' })
                .expect('Content-Type', /json/)
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        console.log(res.error.text);
                    }
                    done(err);
                });
        });

        it('Login test (unexisting user)', (done : Function) => {
            request(app).post('/api/auth')
                .set('Content-Type', 'application/json')
                .send({ email: 'unexisting@mochatest.fave', password: 'invalid password here' })
                .expect('Content-Type', /json/)
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        console.log(res.error.text);
                    }
                    done(err);
                });
        });

        it('Auth test (get user data without being logged in)', (done : Function) => {
            request(app).get('/api/users')
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err, res) => {
                    if (err) {
                        console.log(res.error.text);
                    }
                    done(err);
                });
        });

        it('Sign out test', (done : Function) => {
            request(app).delete('/api/auth')
                .set('x-auth-token', sessionToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(() => {
                    // session has been deleted after this suite, try to access restricted area with it
                    try {
                        request(app).get('/api/users')
                            .set('x-auth-token', sessionToken)
                            .expect(401)
                            .end(done);
                    } catch (err) {
                        console.error(err);
                        done(err);
                    }
                }).catch((err) => {
                    console.error(err);
                    done(err);
                });
        });
    });

    describe('Restricted methods test', () => {
        let sessionToken;
        before((done : Function) => {
            // delete all test contacts
            User.findOne({ where: { username: 'mochatest_login' } }).then((usr) => {
                Contact.destroy({ where: { userId: usr.id } });
            });

            // login and keep session token for next tests
            request(app).post('/api/auth')
                .set('Content-Type', 'application/json')
                .send({ username: 'mochatest_login', password: 'mochatestpassword' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    sessionToken = res.body.token;
                    done(err);
                });
        });

        it('Create User contact', (done : Function) => {
            request(app).post('/api/users/contacts')
                .set('Content-Type', 'application/json')
                .set('x-auth-token', sessionToken)
                .send({ label: 'testContact', address: 'xrb_3pczxuorp48td8645bs3m6c3xotxd3idskrenmi65rbrga5zmkemzhwkaznh' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    done(err);
                });
        });

        it('Delete User contact', (done : Function) => {
            request(app).post('/api/users/contacts/')
                .set('Content-Type', 'application/json')
                .set('x-auth-token', sessionToken)
                .send({ label: 'contactToDelete', address: 'xrb_3pczxuorp48td8645bs3m6c3xotxd3idskrenmi65rbrga5zmkemzhwkaznh' })
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    request(app).delete(`/api/users/contacts/${ JSON.parse(res.res.text).contact.id }`)
                        .set('Content-Type', 'application/json')
                        .set('x-auth-token', sessionToken)
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(done);
                });
        });

        function getUserContacts(expressApp : Object, token : string, callback : Function) {
            request(expressApp).get('/api/users/contacts')
                .set('Content-Type', 'application/json')
                .set('x-auth-token', token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    callback(err);
                });
        }

        it('List user contacts', (done : Function) => {
            // create another one
            request(app).post('/api/users/contacts')
                .set('Content-Type', 'application/json')
                .set('x-auth-token', sessionToken)
                .send({ label: 'testContact2', address: 'xrb_3pczxuorp48td8645bs3m6c3xotxd3idskrenmi65rbrga5zmkemzhwkaznh' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        console.error(res.error.text);
                    }
                    getUserContacts(app, sessionToken, done);
                });
        });
    });
});
