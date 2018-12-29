/* @flow */
export default class SuccessResponse {
	response;

	constructor(response) {
		this.response = response;
	}

	send(payload = {}) {
		return this.response.status(200).send(payload)
	}
}
