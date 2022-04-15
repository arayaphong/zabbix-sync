const config = require("../config");
const getToken = (user, password, done) => {
    const unirest = require('unirest');
    unirest("POST", config.zabbix.api)
        .headers(config.headers)
        .send(JSON.stringify({
            "jsonrpc": "2.0",
            "method": "user.login",
            "params": {
                "user": user,
                "password": password
            },
            "auth": null,
            "id": 0
        }))
        .end((res) => {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                const token = json.result;
                done(null, token);
            }
        });
}

module.exports.getToken = getToken;