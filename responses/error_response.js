/* @flow */
export default class ErrorResponse {
	response;
	status;

	constructor(response, status = 500) {
		this.response = response;
		this.status = status;
	}

	badRequest(message = "An error occurred") {
		this.status = 400;
		return this.send(message);
	}

	unauthorized(message = "Unauthorized") {
		this.status = 401;
		return this.send(message)
	}

	forbidden(message = "Invalid credentials") {
		this.status = 403;
		return this.send(message);
	}

	send(message) {
		return this.response.status(this.status).send({
			error: message || "An error occurred"
		})
	}
}
