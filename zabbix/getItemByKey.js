const config = require("../config");

const getItemByKey = (token, hostId, key, done) => {
    const unirest = require("unirest");
    unirest("POST", config.zabbix.api)
        .headers(config.headers)
        .send(JSON.stringify({
            "jsonrpc": "2.0",
            "method": "item.get",
            "params": {
                "output": [
                    "key_",
                    "itemid",
                    "name"
                ],
                "hostids": hostId,
                "filter": {
                    "key_": key
                }
            },
            "auth": token,
            "id": 1
        }))
        .end((res) => {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                done(null, json.result);
            }
        });
}

module.exports.getItemByKey = getItemByKey;