'use strict';
const { URL } = require('url');
const http = require('http');

module.exports = (host) => {
	return {
		invoke(methodName, param = null) {
			return new Promise((resolve, reject) => {
				const url = new URL(`/${methodName}`, `http://${host}`);
				const request = http.request(url.href, { method: 'POST', timeout: 1000 * 60 });

				request.on('error', reject);
				request.on('response', (response) => {
					if (response.statusCode !== 200) {
						return reject(new Error(`Response status code: ${response.statusCode}`));
					}

					const chunks = [];
					response.on('error', reject);
					response.on('data', (chunk) => {
						chunks.push(chunk);
					});
					response.on('end', () => {
						let body;
						try {
							body = JSON.parse(Buffer.concat(chunks).toString());
						} catch (err) {
							return reject(err);
						}

						if (body.error) {
							reject(Object.assign(new Error(body.error.message), body.error));
						} else {
							resolve(body.result);
						}
					});
				});

				request.write(JSON.stringify(param));
				request.end();
			});
		}
	};
};
