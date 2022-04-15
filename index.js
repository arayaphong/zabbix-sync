const { getToken } = require("./zabbix/getToken");
const { getHosts } = require("./zabbix/getHosts");
getToken("Admin", "zabbix", (err, token) => {
    if (err) console.error(err);
    else {
        console.log(token);
        getHosts(token, (err, hosts) => {
            if (err) console.error(err);
            else console.log(hosts);
        });
    }
});