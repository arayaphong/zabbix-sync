const { getToken } = require("./getToken");
getToken("Admin", "zabbix", (err, res) => {
    if (err) console.error(err);
    else {
        const json = JSON.parse(res);
        const token = json.result;
        console.log(token);
    }
});