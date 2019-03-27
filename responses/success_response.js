/* @flow */

export default class SuccessResponse {
    response : Object;

    constructor(response : Object | string) {
        this.response = response;
    }

    send(payload : Object | string = {}) : Object {

        if (typeof payload === 'string') {
            payload = { message: payload };
        }

        payload = {
            ...payload,
            status: 'success'
        };

        return this.response.status(200).send(payload);
    }
}
