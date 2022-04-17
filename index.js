const { synchronizer } = require("./synchronizer");
const sync = synchronizer();

sync.hosts((err, result) => {
    if (err) console.error(err);
    else {
        var doneCount = 0;
        const updater = result.updater;
        const hosts = result.hosts;
        hosts.forEach(host => {
            const hostId = host.hostid;
            const done = (err, result) => {
                doneCount++;
                if (err) console.error(err);
                else console.log(result);

                if (doneCount >= hosts.length * Object.keys(updater).length) process.exit();
            }
            const update = (res) => console.log(res);
            updater.cpu(hostId, update, done);
            updater.ram(hostId, update, done);
            updater.disk(hostId, update, done);
        });
    }
});