#!/usr/bin/env node
'use strict';

process.on('unhandledRejection', (err) => {
	throw err;
});

(async function main() {
	const prefix = '../src/servers/';

	for (const [moduleName, port] of require('../src/each-implementation')()) {
		const server = await require(prefix + moduleName)(port);
		console.log('server "%s" listening on port %s', moduleName, port);
	}

	console.log('all servers listening!');
})();
