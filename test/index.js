/* @flow */
import request from 'supertest';

import app from '../app';

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
});
