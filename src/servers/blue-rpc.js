'use strict';
const http = require('http');
const BlueRPC = require('blue-rpc-protocol');

const methods = {
	echo(param) {
		return param;
	},
};

module.exports = async (port) => {
	await BlueRPC.listen({
		server: http.createServer(),
		methods,
		port,
	});
};
