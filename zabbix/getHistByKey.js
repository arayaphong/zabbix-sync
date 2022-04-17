const config = require("../config");
const { getItemByKey } = require("./getItemByKey");

const getItemId = (token, hostId, key, done) => {
    getItemByKey(token, hostId, key, (err, result) => {
        if (err) done(err);
        else {
            const itemId = (result.length > 0 ? result[0].itemid : 0);
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
                "output": ["clock", "value"],
                "history": 0,
                "itemids": itemId,
                "sortfield": "clock",
                "time_from": timeFrom,
                "limit": 101
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

const getHistByKey = (token, hostId, key, timeFrom, done) => {
    getItemId(token, hostId, key, (err, itemId) => {
        if (err) done(err);
        else getHistory(token, itemId, timeFrom, (err, data) => {
            if (err) done(err);
            else done(null, data);
        });
    });
}

module.exports.getHistByKey = getHistByKey;