const { getToken } = require("./zabbix/getToken");
const { getHosts } = require("./zabbix/getHosts");
const { getCPUUtilHist } = require("./zabbix/getCPUUtilHist");
const { addHosts } = require("./mariadb/addHosts");


const updateCpuUtils = (hostid, done) => {

}

const config = require("./config");
const user = config.zabbix.user;
const password = config.zabbix.password;
getToken(user, password, (err, token) => {
    if (err) console.error(err);
    else getHosts(token, (err, hosts) => {
        if (err) console.error(err);
        else addHosts(hosts, (err, result) => {
            if (err) console.error(err);
            else {
                console.log("Update hosts status: " + result);
                hosts.forEach(host => {
                    const id = host.hostid;

                    getCPUUtilHist(token, id, 0, (err, data) => {
                        console.log("CPU (" + id + ") : " + data.length + " rows");
                    });
                });
            }
        });
    });
});