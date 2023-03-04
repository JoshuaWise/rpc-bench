'use strict'
const jayson = require('jayson/promise');

module.exports = async (host) => {
	const client = jayson.Client.websocket({ url: `ws://${host}` });

	await new Promise((resolve, reject) => {
		client.ws.on('open', resolve);
		client.ws.on('error', reject);
	});

	return {
		async invoke(methodName, param) {
			const response = await client.request(methodName, [param]);
			if (response.error) {
				throw Object.assign(new Error(response.error.message), response.error);
			}
			return response.result;
		},
	};
};
