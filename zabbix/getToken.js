const getToken = (user, password, done) => {
    const unirest = require('unirest');
    const req = unirest('POST', process.env.API_ENDPOINT)
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
            else {
                const json = JSON.parse(res.raw_body);
                const token = json.result;
                done(null, token);
            }
        });
}

module.exports.getToken = getToken;