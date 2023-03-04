'use strict';
const jayson = require('jayson/promise');

const methods = {
	async echo([param]) {
		return param;
	},
};

module.exports = async (port) => {
	const server = new jayson.Server(methods).http();

	await new Promise((resolve, reject) => {
		server.once('listening', resolve);
		server.once('error', reject);
		server.listen(port);
	});
};
