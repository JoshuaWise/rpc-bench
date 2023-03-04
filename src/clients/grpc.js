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

module.exports = (host) => {
	const protoASTRoot = Protobuf.parse(proto, undefined, protoOptions).root;
	const packageDefinition = ProtoLoader.fromJSON(protoASTRoot.toJSON(), protoOptions);
	const packageObject = GRPC.loadPackageDefinition(packageDefinition);

	const credentials = GRPC.ChannelCredentials.createInsecure();
	const client = new (packageObject.EchoService)(host, credentials);

	return {
		invoke(methodName, param) {
			return new Promise((resolve, reject) => {
				client[methodName](param, (err, result) => {
					if (err) reject(err);
					else resolve(result);
				});
			});
		},
	};
};
