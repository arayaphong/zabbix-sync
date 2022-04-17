const { synchronizer } = require("./synchronizer");
const sync = synchronizer();

sync.hosts((err, result) => {
    if (err) console.error(err);
    else {
        const updater = result.updater;
        const hosts = result.hosts;
        hosts.forEach(host => {
            const hostId = host.hostid;
            const done = (err, result) => err ? console.error(err) : console.log(result);
            const update = (res) => console.log(res);
            updater.cpu(hostId, update, done);
            updater.ram(hostId, update, done);
        });
    }
});