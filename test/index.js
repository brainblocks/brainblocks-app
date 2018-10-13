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

    it('Login test (username)', (done : Function) => {
        request(app).post('/api/users/login')
            .set('Content-Type', 'application/json')
            .send({ username: 'mochatest_login', password: 'mochatestpassword' })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(res.error.text);
                }
                done(err);
            });
    });

    it('Login test (email)', (done : Function) => {
        let token;
        request(app).post('/api/users/login')
            .set('Content-Type', 'application/json')
            .send({ email: 'mochatest@mochatest.fave', password: 'mochatestpassword' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                // try to access restricted page
                token = res.body.session;
                request(app).get('/api/users')
                    .set('Content-Type', 'application/json')
                    .set('x-auth-token', token)
                    .expect(200)
                    .end((err, res2) => {
                        if (err) {
                            console.log(res2.error.text);
                        }

                        if (res2.body.user.email !== 'mochatest@mochatest.fave') {
                            err = new Error('User email does not match the one which should.');
                        }

                        done(err);
                    });
            }).catch((err) => {
                console.log(err);
                done(err);
            });
    });

    it('Login test (invalid credentials)', (done : Function) => {
        request(app).post('/api/users/login')
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
        request(app).post('/api/users/login')
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
     
});
