const config = require("../config");

const getItemId = (token, hostId, done) => {
    const unirest = require("unirest");
    unirest("POST", config.zabbix.api)
        .headers(config.headers)
        .send(JSON.stringify({
            "jsonrpc": "2.0",
            "method": "item.get",
            "params": {
                "output": [
                    "itemid",
                    "type",
                    "name"
                ],
                "hostids": hostId,
                "filter": {
                    "type": "18"
                },
                "search": {
                    "key_": "system.cpu.util"
                },
                "sortfield": "name"
            },
            "auth": token,
            "id": 1
        }))
        .end((res) => {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                const itemId = (json.result.length > 0 ? json.result[0].itemid : 0);
                done(null, itemId);
            }
        });
}

const getHistory = (token, itemId, timeFrom, done) => {
    if (!itemId) return done(null, []);

    const unirest = require('unirest');
    unirest("POST", config.zabbix.api)
        .headers(config.headers)
        .send(JSON.stringify({
            "jsonrpc": "2.0",
            "method": "history.get",
            "params": {
                "output": "extend",
                "history": 0,
                "itemids": itemId,
                "sortfield": "clock",
                "sortorder": "DESC",
                "time_from": timeFrom,
                "limit": 100
            },
            "auth": token,
            "id": 1
        }))
        .end((res) => {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                const data = json.result;
                done(null, data);
            }
        });
}

const getCPUUtilHist = (token, hostId, timeFrom, done) => {
    getItemId(token, hostId, (err, itemId) => {
        if (err) done(err);
        else getHistory(token, itemId, timeFrom, (err, data) => {
            if (err) done(err);
            else done(null, data);
        });
    });
}

module.exports.getCPUUtilHist = getCPUUtilHist;