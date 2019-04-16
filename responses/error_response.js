/* @flow */
export default class ErrorResponse {
    response : Object;
    status : number;

    constructor(response : Object, status : number = 500) {
        this.response = response;
        this.status = status;
    }

    badRequest(message : string = 'An error occurred') : void {
        this.status = 400;
        return this.send(message);
    }

    unauthorized(message : string = 'Unauthorized') : void {
        this.status = 401;
        return this.send(message);
    }

    forbidden(message : string = 'Invalid credentials') : void {
        this.status = 403;
        return this.send(message);
    }

    notFound(message : string = 'Resource not found') : void {
        this.status = 404;
        return this.send(message);
    }

    send(message : string, status? : number, payload? : Object = {}) : void {
        status = status || this.status;
        return this.response.status(status).send({
            status: 'error',
            error:  message || 'An error occurred',
            ...payload
        });
    }
}
