'use strict';

const implementations = [
	'blue-rpc',
	'rest',
	'json-rpc-http',
	'json-rpc-tcp',
	'json-rpc-ws',
	'grpc',
];

module.exports = function* eachImplementation() {
	let port = 8080;
	for (const moduleName of implementations) {
		yield [moduleName, port++];
	}
};
