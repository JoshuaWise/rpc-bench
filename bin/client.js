#!/usr/bin/env node
'use strict';

process.on('unhandledRejection', (err) => {
	throw err;
});

(async function main() {
	const prefix = '../src/clients/';
	const hostname = process.argv[2];

	if (!hostname) {
		throw new Error('Missing hostname argument');
	}

	for (const [moduleName, port] of require('../src/each-implementation')()) {
		const client = await require(prefix + moduleName)(`${hostname}:${port}`);
		console.log('benchmarking %s', moduleName);
		await benchmark(client);
	}

	process.exit(0);
})();

function benchmark(client) {
	return new Promise((resolve, reject) => {
		const data = {
			boolean: [...Array(32)].map(() => true),
			integer: [...Array(32)].map(() => 12345),
			float: [...Array(32)].map(() => 0.12345),
			string: '12345678'.repeat(128),
			binary: Buffer.from('12345678'.repeat(128)),
		};

		let count = 0;
		let pending = 0;
		let maxPending = 1;
		let error;

		function onResponse() {
			count += 1;
			pending -= 1;
			checkCleanup();
		}

		function onError(err) {
			pending -= 1;
			if (!done) {
				process.stdout.write(' ERROR');
				done = true;
				clearTimeout(timer);
				clearInterval(interval);
				if (bestHz === 0) {
					error = err;
				}
			}
			checkCleanup();
		}

		let timer = setTimeout(function loop() {
			while (pending < maxPending) {
				pending += 1;
				client.invoke('echo', data).then(onResponse, onError);
			}
			timer = setTimeout(loop);
		});

		let bestHz = 0;
		let startTime = Date.now();
		let fails = 0;
		let done = false;
		const interval = setInterval(() => {
			const endTime = Date.now();
			const hz = count / ((endTime - startTime) / 1000);

			maxPending *= 2;
			startTime = endTime;
			count = 0;

			if (hz > bestHz) {
				bestHz = hz;
				fails = 0;
				process.stdout.write(`\x1b[1G    calls/sec: ${Math.round(hz)} (concurrents: ${maxPending})`);
			} else if (++fails === 5) {
				done = true;
				clearTimeout(timer);
				clearInterval(interval);
				checkCleanup();
			}
		}, 1000);

		function checkCleanup() {
			if (done && pending === 0) {
				process.stdout.write('\n');
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			}
		}
	});
}
