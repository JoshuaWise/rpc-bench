'use strict';
const GRPC = require('@grpc/grpc-js');
const ProtoLoader = require('@grpc/proto-loader');
const Protobuf = require('protobufjs');

const proto = `\
syntax = "proto3";

message Value {
	repeated bool boolean = 1;
	repeated sint32 integer = 2;
	repeated double float = 3;
	string string = 4;
	bytes binary = 5;
}

service EchoService {
	rpc echo (Value) returns (Value);
}
`;

const protoOptions = {
	keepCase: true,
};

const methods = {
	echo(call, callback) {
		callback(null, call.request);
	},
};

module.exports = async (port) => {
	const protoASTRoot = Protobuf.parse(proto, undefined, protoOptions).root;
	const packageDefinition = ProtoLoader.fromJSON(protoASTRoot.toJSON(), protoOptions);
	const packageObject = GRPC.loadPackageDefinition(packageDefinition);

	const server = new GRPC.Server();
	const credentials = GRPC.ServerCredentials.createInsecure();
	server.addService(packageObject.EchoService.service, methods);
	await new Promise((resolve, reject) => {
		server.bindAsync(`127.0.0.1:${port}`, credentials, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
	server.start();
};
