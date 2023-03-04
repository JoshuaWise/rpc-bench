'use strict'
const { URL } = require('url');
const jayson = require('jayson/promise');

module.exports = (host) => {
	const client = jayson.Client.tcp({
		host: host.split(':')[0],
		port: Number(host.split(':')[1] || '80'),
	});

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
