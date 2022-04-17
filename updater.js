const config = require("./config");
const { getHistByKey } = require("./zabbix/getHistByKey");
const updater = (db, token) => {
    const getCpuUtilz = (token, hostId, timeFrom, done) => getHistByKey(token, hostId, "system.cpu.util", timeFrom, done);
    const updateCpuUtils = (token, hostId, clock, update, done) => {
        const next = (err, res) => {
            if (res.next == null) return done(err, res);
            if (err) done(err);
            else getCpuUtilz(token, hostId, res.next, (err, data) => {
                if (err) done(err);
                else {
                    data = data.filter(d => parseInt(d.clock) != res.next);
                    if (data.length > 0) db.addCPUUtilHist(data, hostId, (err, res) => {
                        if (err) done(err);
                        else {
                            update(res);
                            updateCpuUtils(token, hostId, res.next, update, next);
                        }
                    });
                    else done(null, { hostId: hostId, key: "system.cpu.util", finished: true });
                }
            });
        }
        next(null, { next: clock });
    }
    const getMemFree = (token, hostId, timeFrom, done) => getHistByKey(token, hostId, "vm.memory.size[pavailable]", timeFrom, done);
    const updateMemories = (token, hostId, clock, update, done) => {
        const next = (err, res) => {
            if (res.next == null) return done(err, res);
            if (err) done(err);
            else getMemFree(token, hostId, res.next, (err, data) => {
                if (err) done(err);
                else {
                    data = data.filter(d => parseInt(d.clock) != res.next);
                    if (data.length > 0) db.addMemFreeHist(data, hostId, (err, res) => {
                        if (err) done(err);
                        else {
                            update(res);
                            updateMemories(token, hostId, res.next, update, next);
                        }
                    });
                    else done(null, { hostId: hostId, key: "vm.memory.size[pavailable]", finished: true });
                }
            });
        }

        next(null, { next: clock });
    }

    return {
        cpu: (hostId, update, done) => db.getLastClock(config.db.cpuUtilizations, hostId, (err, clock) => {
            if (err) done(err);
            else updateCpuUtils(token, hostId, clock, update, done);
        }),
        ram: (hostId, update, done) => db.getLastClock(config.db.memoryAvailable, hostId, (err, clock) => {
            if (err) done(err);
            else updateMemories(token, hostId, clock, update, done);
        })
    }
}

module.exports.updater = updater;