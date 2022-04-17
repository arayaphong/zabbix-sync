const config = require("./config");
const unirest = require('unirest');
const { dbUtil } = require("./mariadb/dbUtil");
const { updater } = require("./updater");
const synchronizer = () => {
    const db = dbUtil();
    const user = config.zabbix.user;
    const password = config.zabbix.password;
    const getToken = (user, password, done) => {
        const body = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "user.login",
            "params": {
                "user": user,
                "password": password
            },
            "auth": null,
            "id": 0
        });
        unirest("POST", config.zabbix.api)
            .headers(config.headers)
            .send(body)
            .end((res) => {
                if (res.error) done(res.error);
                else {
                    const json = JSON.parse(res.raw_body);
                    if (json.error) done(json.error);
                    else done(null, json.result);
                }
            });
    }
    const getHosts = (token, done) => {
        const body = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "host.get",
            "params": {
                "output": [
                    "hostid",
                    "name"
                ]
            },
            "auth": token,
            "id": 1
        });
        unirest("POST", config.zabbix.api)
            .headers(config.headers)
            .send(body)
            .end(function (res) {
                if (res.error) done(res.error);
                else {
                    const json = JSON.parse(res.raw_body);
                    if (json.error) done(json.error);
                    else done(null, json.result);
                }
            });
    }

    return {
        hosts: (done) => getToken(user, password, (err, token) => {
            if (err) done(err);
            else getHosts(token, (err, hosts) => {
                if (err) done(err);
                else db.addHosts(hosts, (err, _) => {
                    if (err) done(err);
                    else {
                        done(null, {
                            updater: updater(db, token),
                            hosts: hosts
                        });
                    }
                });
            });
        }),
    }
}

module.exports.synchronizer = synchronizer;