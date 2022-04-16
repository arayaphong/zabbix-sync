const config = require("../config");
const mariadb = require("mariadb");
const pool = mariadb.createPool(config.db);
const addHosts = (hosts, done) => {
    pool.getConnection()
        .then(conn => {
            conn.query("SELECT host_id FROM hosts;")
                .then((res) => {
                    const dbHodtIds = res.map(host => host.host_id);
                    hosts = hosts.filter(host => !dbHodtIds.includes(parseInt(host.hostid)));
                    if (hosts.length < 1) return done(null, { affectedRows: 0, insertId: 0, warningStatus: 0 });

                    const values = hosts.map(host => "(" + host.hostid + ", '" + host.name + "', NOW())");
                    const sql = "INSERT INTO hosts VALUES" + values.join(",") + ";"
                    return conn.query(sql);
                })
                .then((res) => {
                    if (res != null) done(null, res);
                    conn.end();
                })
                .catch(err => {
                    conn.end();
                    done(err);
                })
        })
        .catch(err => done(err));
}

module.exports.addHosts = addHosts;