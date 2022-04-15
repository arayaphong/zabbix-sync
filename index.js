const { getToken } = require("./zabbix/getToken");
const { getHosts } = require("./zabbix/getHosts");
const { addHosts } = require("./mariadb/addHosts");
getToken("Admin", "zabbix", (err, token) => {
    if (err) console.error(err);
    else {
        //console.log(token);
        getHosts(token, (err, hosts) => {
            if (err) console.error(err);
            else {
                //console.log(hosts);
                addHosts(hosts, (err, result) => {
                    if (err) console.error(err);
                    else {
                        console.log(result);
                    }
                });
            }
        });
    }
});