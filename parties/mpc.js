/**
 * Global variables
 */
var config = require('./config.json');
var leader = null;
var clique = [];

var domains = config.domains;
var products = config.products;
var batch_size = 50;

var defaultOptions = {
  Zp: 251,
  sodium: false,
  hooks: {
    createSecretShare: [
      function (jiff, share) {
        share.refresh = function () {
          return share;
        };
        return share;
      }
    ]
  }
};

/**
 * Connect to the server and initialize the jiff instance
 */
var jiff_instance;
exports.connect = function (hostname, computation_id, options) {
  options = Object.assign({}, options, defaultOptions);
  var jiff = require('../jiff/lib/jiff-client');

  jiff_instance = jiff.make_jiff(hostname, computation_id, options);
};

/**
 * Computation code
 */
var shares = [];

var computeRange = function (person1, person2Start) {
    var promises = [];
    var i = person1;
    for (var j = person2Start; j < Math.min(shares.length, person2Start + batch_size); j++) {
      // Compute matching coefficient for persons i and j
      var matching = null;

      for (var f = 0; f < shares[i].length; f++) {
        var input1 = shares[i][f];
        var input2 = shares[j][f];
        var domain = domains[f];

        var result;
        if (domain === 1) {
          result = input1.sxor_bit(input2);
        } else {
          result = input1.ssub(input2);
          result = result.smult(result);
        }
        result = result.cmult(products[f]);

        if (matching == null) matching = result;
        else matching = matching.sadd(result);
      }

      var promise = jiff_instance.open(matching, [leader]);
      if (promise != null) promises.push(promise);
    }

  if (promises.length !== 0) return Promise.all(promises);
};

exports.compute = function () {
    console.log('Connected', jiff_instance.id);
    leader = jiff_instance.id % config.replicas;
    if (leader === 0) leader = config.replicas;

    for (var p = 0; p < config.parties; p++) {
        clique.push(p * config.replicas + leader);
    }

    // receive shares from server
    jiff_instance.listen('share', function (party_id, msg) {
        console.log('Share!', party_id, msg);

        if (party_id !== 's1') return;
        msg = JSON.parse(msg);

        var r = msg['rows'], c = msg['cols'];
        for (var i = 0; i < r; i++) {
            shares[i] = [];
            for (var j = 0; j < c; j++) {
                shares[i][j] = jiff_instance.share(null, null, clique, ['s1'])['s1'];
            }
        }
    });

    // start computing
    jiff_instance.listen('start', function (party_id, _) {
        console.log('Compute!', party_id);
        if (party_id !== 's1') return;

        var i = batch_size * (leader % config.replicas);
        // MPC
        (function batch(i, j) {
            // Barrier for memory optimization
            jiff_instance.start_barrier();

            // computation step
            var result = computeRange(i, j);
            if (result != null) {
                jiff_instance.add_to_barriers(result);
            }

            // End barrier
            jiff_instance.end_barrier(function () {
                var total = shares.length;
                console.log('Done', i, '/', total, ' --- ', j, '/', total);
                j += batch_size;
                if (j >= total) {
                    i += config.replicas;
                    j = i + 1;
                }

                if (i < shares.length) { // more to go
                    batch(i, j);
                } else { // done
                    console.log('Finished');
                    jiff_instance.emit('end', ['s1'], '', false);
                }
            });
        }(i, i+1));
    });
};
