const config = {};

config.zabbix = {
    user: "Admin",
    password: "zabbix"
}
config.zabbix.api = "http://home49171.thddns.net:7979/api_jsonrpc.php";
config.headers = { "Content-Type": "application/json" }
config.db = {
    host: "home49171.thddns.net",
    port: 7977,
    user: "admin",
    password: "admin",
    database: "monitordb",
    connectionLimit: 5
}

module.exports = config;