'use strict';
const BlueRPC = require('blue-rpc-protocol');

module.exports = (host) => BlueRPC.createClient(`ws://${host}`);
