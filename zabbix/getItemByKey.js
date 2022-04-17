const config = require("../config");

const getItemByKeys = (token, hostId, key, sKey, done) => {
    const unirest = require("unirest");
    const body = {
        jsonrpc: "2.0",
        method: "item.get",
        params: {
            output: [
                "key_",
                "itemid",
                "name"
            ],
            hostids: hostId,
        },
        auth: token,
        id: 2
    };
    if (key) body.params.filter = { key_: key }
    if (sKey) body.params.search = { key_: sKey }
    const json = JSON.stringify(body);
    unirest("POST", config.zabbix.api)
        .headers(config.headers)
        .send(json)
        .end((res) => {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                if (json.error) done(json.error);
                else done(null, json.result);
            }
        });
}

const getItemByKey = (token, hostId, key, done) => getItemByKeys(token, hostId, key, null, done);
const getItemBySearchKey = (token, hostId, sKey, done) => getItemByKeys(token, hostId, null, sKey, done);

module.exports = {
    getItemByKey: getItemByKey,
    getItemBySearchKey: getItemBySearchKey
}