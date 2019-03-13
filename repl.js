var fs = require('fs');
var readLine = require('readline');

var statusMap = {}; // Keeps status and start/end times

// Help message
var help = function () {
    console.log('commands:');
    console.log('\tlist - List computations and status.');
    console.log('\tshare <computation id> <filename> - shares the content of data/<filename>.csv with all parties in the computation.');
    console.log('\tstart <computation id> - begins the computation and benchmarking of the computation.');
    console.log('\tstatus <computation id> - displays the status of the given computation');
};

// reading from command line for interactive benchmarking
var scanf = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

module.exports = function (server_instance) {
    // print status
    var printStatus = function (computation_id) {
        var status = statusMap[computation_id];
        if (status == null) {
            var total = server_instance.totalparty_map[computation_id];
            var current = server_instance.client_map[computation_id];
            current = current != null ? current.length : 0;

            if (total === current && total != null) {
                console.log(computation_id, ':', 'initialized');
            } else {
                console.log(computation_id, ':', 'waiting for', total - current);
            }
        } else {
            var msg = '';
            if (status.start_ts != null) {
                var end_ts = status.end_ts != null ? status.end_ts : Date.now();
                var elapsed = end_ts - status.start_ts;
                elapsed = Math.floor(elapsed / 1000); // seconds

                var minutes = Math.floor(elapsed / 60);
                var seconds = elapsed % 60;
                msg = minutes + '::' + seconds + '  (' + elapsed + ')';
            }

            console.log(computation_id, ':', status.status, msg);
        }
    };

    // list all computations with status
    var list = function () {
        for (var computation_id in server_instance.totalparty_map) {
            if (server_instance.totalparty_map.hasOwnProperty(computation_id)) {
                printStatus(computation_id);
            }
        }
    };

    // read and share csv data
    var share = function (computation_id, file) {
        // Figure setting out
        var tmp = computation_id.split('-');
        var parties = parseInt(tmp[1]), replicas = parseInt(tmp[2]);
        var cliques = [];
        for (var i = 0; i < replicas; i++) {
            var tmp = [];
            for (var j = 0; j < parties; j++) {
                tmp.push(1 + j * replicas + i);
            }
            cliques.push(tmp);
        }

        // Start sharing
        var computation_instance = server_instance.compute(computation_id, { sodium: false, Zp: 251 });
        computation_instance.connect();

        var lineReader = readLine.createInterface({
            input: fs.createReadStream('./data/'+file+'.csv')
        });

        var colCount = 0, rowCount = 0;
        var processLine = function (line) {
            if (line == null) return;
            line = line.trim();
            if (line === '') return;

            line = line.split(',');
            colCount = line.length;
            rowCount++;
            for (var i = 0; i < line.length; i++) {
                for (var c = 0; c < cliques.length; c++) {
                    computation_instance.share(parseInt(line[i].trim()), null, cliques[c], ['s1']);
                }
            }
        };

        lineReader.on('line', processLine);
        lineReader.on('close', function (line) {
            processLine(line);
            computation_instance.emit('share', null, JSON.stringify({ rows: rowCount, cols: colCount }), false);
            console.log('done parsing');

            statusMap[computation_id] = {
                status: 'Parsed: ' + file
            };
        });

        statusMap[computation_id] = {
            status: 'Parsing: ' + file
        };
    };

    // start the computation and monitor progress
    var start = function (computation_id) {
        var computation_instance = server_instance.compute(computation_id, { sodium: false, Zp: 251 });
        computation_instance.emit('start', null, 'start', false);

        statusMap[computation_id] = {
            start_ts: Date.now(),
            count: computation_instance.party_count,
            status: 'Started'
        };

        computation_instance.listen('end', function () {
            var status = statusMap[computation_id];
            status.count--;
            if (status.count === 0) {
                status.end_ts = Date.now();
                status.status = 'Finished';
                printStatus(computation_id);
            }
        });
    };

    scanf.on('line', function (line) {
        try {
            line = line.trim();
            if (line === '') return;

            if (line === 'list') list();
            else if (line.startsWith('status')) printStatus(line.substring('status'.length + 1).trim());
            else if (line.startsWith('start')) start(line.substring('start'.length + 1).trim());
            else if (line.startsWith('share')) {
                line = line.substring('share'.length + 1).trim();
                line = line.split(' ');
                share(line[0].trim(), line[1].trim());
            }
        } catch(exception) {
            console.log('Error!', exception);
        }
    });

    help();
};