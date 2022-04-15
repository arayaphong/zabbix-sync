const getHosts = (token, done) => {
    const unirest = require('unirest');
    const req = unirest('POST', process.env.API_ENDPOINT)
        .headers({
            'Content-Type': 'application/json'
        })
        .send(JSON.stringify({
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
        }))
        .end(function (res) {
            if (res.error) done(res.error);
            else {
                const json = JSON.parse(res.raw_body);
                const result = json.result;
                done(result);
            }
        });

}

module.exports.getHosts = getHosts;