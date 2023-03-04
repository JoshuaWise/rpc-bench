'use strict';
const { URL } = require('url');
const http = require('http');

const methods = {
	echo(param) {
		return param;
	},
};

module.exports = async (port) => {
	const server = http.createServer((req, res) => {
		if (req.method !== 'POST') {
			return res.writeHead(405).end();
		}
		if (!req.headers.host) {
			return res.writeHead(400).end();
		}

		let url;
		try {
			url = new URL(req.url, `http://${req.headers.host}`);
		} catch (err) {
			return res.writeHead(400).end();
		}

		const methodName = url.pathname.replace(/^\//, '')
		if (!methods.hasOwnProperty(methodName)) {
			return res.writeHead(404).end();
		}

		const chunks = [];
		req.on('data', (chunk) => {
			chunks.push(chunk);
		});
		req.on('end', () => {
			let param;
			try {
				param = JSON.parse(Buffer.concat(chunks).toString());
			} catch (err) {
				return res.writeHead(400).end();
			}

			const method = methods[methodName];
			new Promise(resolve => resolve(method(param)))
				.then((result) => {
					res.writeHead(200).end(JSON.stringify({ result }));
				}, (err) => {
					const error = Object.assign({ message: err.message }, err);
					res.writeHead(200).end(JSON.stringify({ error }));
				});
		});
	});

	await new Promise((resolve, reject) => {
		server.once('listening', resolve);
		server.once('error', reject);
		server.listen(port);
	});
};
