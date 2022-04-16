const { getToken } = require("./zabbix/getToken");
const { getHosts } = require("./zabbix/getHosts");
const { getCpuUtilz } = require("./zabbix/getCpuUtilz");
const { getMemFree } = require("./zabbix/getMemFree");
const { dbUtil } = require("./mariadb/dbUtil");
const db = dbUtil();

const updateCpuUtils = (token, hostId, clock, done) => {
    const next = (err, res) => {
        if (res.next == null) return done(err, res);
        if (err) done(err);
        else getCpuUtilz(token, hostId, res.next, (err, data) => {
            if (err) done(err);
            else {
                data = data.filter(d => parseInt(d.clock) != res.next);
                if (data.length > 0) db.addCPUUtilHist(data, hostId, (err, res) => {
                    if (err) done(err);
                    else updateCpuUtils(token, hostId, res.next, next);
                });
                else done(null, { status: "Ok - No more cpu data" });
            }
        });
    }

    next(null, { next: clock });
}

const updateMemories = (token, hostId, clock, done) => {
    const next = (err, res) => {
        if (res.next == null) return done(err, res);
        if (err) done(err);
        else getMemFree(token, hostId, res.next, (err, data) => {
            if (err) done(err);
            else {
                data = data.filter(d => parseInt(d.clock) != res.next);
                if (data.length > 0) db.addMemFreeHist(data, hostId, (err, res) => {
                    if (err) done(err);
                    else updateMemories(token, hostId, res.next, next);
                });
                else done(null, { status: "Ok - No more memory data" });
            }
        });
    }

    next(null, { next: clock });
}

const config = require("./config");
const user = config.zabbix.user;
const password = config.zabbix.password;
getToken(user, password, (err, token) => {
    if (err) console.error(err);
    else getHosts(token, (err, hosts) => {
        if (err) console.error(err);
        else db.addHosts(hosts, (err, result) => {
            console.info(result);
            if (err) console.error(err);
            else hosts.forEach(host => {
                const hostId = host.hostid;
                db.getLastClock(config.db.cpuUtilizations, hostId, (err, clock) => {
                    if (err) console.error(err);
                    else updateCpuUtils(token, hostId, clock, (err, result) => {
                        if (err) console.error(err);
                        else console.log(result);
                    });
                });
                db.getLastClock(config.db.memoryAvailable, hostId, (err, clock) => {
                    if (err) console.error(err);
                    else updateMemories(token, hostId, clock, (err, result) => {
                        if (err) console.error(err);
                        else console.log(result);
                    });
                });
            });
        });
    });
});