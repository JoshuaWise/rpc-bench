'use strict'
const jayson = require('jayson/promise');

module.exports = (host) => {
	const client = jayson.Client.http(`http://${host}`);

	return {
		async invoke(methodName, param) {
			const response = await client.request(methodName, [param]);
			if (response.error) {
				throw Object.assign(new Error(response.error.message), response.error);
			}
			return response.result;
		}
	};
};
