import { isString } from "util";

/* @flow */
export default class SuccessResponse {
	response;

	constructor(response) {
		this.response = response;
	}

	send(payload = {}) {
		if(isString(payload)) {
			payload = {message: payload};
		}

		payload = Object.assign(payload, {
			status: "success"
		})
		return this.response.status(200).send(payload)
	}
}
