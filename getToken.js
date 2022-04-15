const getToken = (user, password, done) => {
    if (done == null) throw Error("callback not provided!");

    const unirest = require('unirest');
    const req = unirest('POST', 'http://home49171.thddns.net:7979/api_jsonrpc.php')
        .headers({
            'Content-Type': 'application/json'
        })
        .send(JSON.stringify({
            "jsonrpc": "2.0",
            "method": "user.login",
            "params": {
                "user": "Admin",
                "password": "zabbix"
            },
            "auth": null,
            "id": 0
        }))
        .end((res) => {
            if (res.error) done(res.error);
            else done(null, res.raw_body);
        });
}

module.exports.getToken = getToken;