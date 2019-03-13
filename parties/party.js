/**
 * Do not change this unless you have to.
 * This code parses input command line arguments,
 * and calls the appropriate initialization and MPC protocol from ./mpc.js
 */

console.log('Command line arguments: [<computation id>]');

var mpc = require('./mpc');
var config = require('./config.json');

// Parse configurations
var party_count = config.parties * config.replicas;

// Read Command line arguments
var computation_id = process.argv[2];
if (computation_id == null) {
  computation_id = 'bench';
}
computation_id += '-' + config.parties + '-' + config.replicas

console.log('Computation id:', computation_id);

// JIFF options
var options = {party_count: party_count};
options.onConnect = function () {
  mpc.compute();
};

// Connect
mpc.connect(config.hostname, computation_id, options);
