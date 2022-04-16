const { getToken } = require("./zabbix/getToken");
const { getHosts } = require("./zabbix/getHosts");
const { getCPUUtilHist } = require("./zabbix/getCPUUtilHist");
const { addHosts } = require("./mariadb/addHosts");
const { getLastClock } = require("./mariadb/getLastClock");
const { addCPUUtilHist } = require("./mariadb/addCPUUtilHist");

const updateCpuUtils = (token, hostId, clock, done) => {
    const next = (err, res) => {
        if (res.next == null) return done(err, res);
        if (err) done(err);
        else getCPUUtilHist(token, hostId, res.next, (err, data) => {
            if (err) done(err);
            else {
                data = data.filter(d => parseInt(d.clock) != res.next);
                if (data.length > 0) addCPUUtilHist(data, hostId, (err, res) => {
                    if (err) done(err);
                    else updateCpuUtils(token, hostId, res.next, next);
                });
                else done(null, { status: "Ok - No data" });
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
        else addHosts(hosts, (err, result) => {
            console.info(result);
            if (err) console.error(err);
            else hosts.forEach(host => {
                const hostId = host.hostid;
                getLastClock(config.cpu.utilizations, hostId, (err, clock) => {
                    if (err) console.error(err);
                    else updateCpuUtils(token, hostId, clock, (err, result) => {
                        if (err) console.error(err);
                        else console.log(result);
                    });
                });
            });
        });
    });
});