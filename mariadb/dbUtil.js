const config = require("../config");
const mariadb = require("mariadb");
const addRecord = (pool, data, hostId, table, done) => {
    pool.getConnection()
        .then(conn => {
            const values = data.map(d => "(" + d.clock + "," + hostId + "," + d.value + ")");
            const sql = "INSERT INTO " + table + " VALUES " + values.join(",") + ";";
            conn.query(sql)
                .then((res) => {
                    conn.end();
                    done(null, { res: res, next: data[data.length - 1].clock });
                })
                .catch(err => {
                    conn.end();
                    done(err);
                })
        })
        .catch(err => {
            done(err);
        });
}
const dbUtil = () => {
    const pool = mariadb.createPool(config.db);
    return ({
        getLastClock: (table, hostId, done) => {
            pool.getConnection()
                .then(conn => {
                    const sql = "SELECT clock FROM " + table + " WHERE host_id = " + hostId + " ORDER BY clock DESC LIMIT 1;";
                    conn.query(sql)
                        .then((rows) => {
                            done(null, (rows.length > 0 ? rows[0].clock : 0));
                            conn.end();
                        })
                        .catch(err => {
                            conn.end();
                            done(err);
                        })
                })
                .catch(err => done(err));
        },
        addHosts: (hosts, done) => {
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
        },
        addCPUUtilHist: (data, hostId, done) => addRecord(pool, data, hostId, config.db.cpuUtilizations, done),
        addMemFreeHist: (data, hostId, done) => addRecord(pool, data, hostId, config.db.memoryAvailable, done),
        addSpaceUtilHist: (data, hostId, done) => addRecord(pool, data, hostId, config.db.spaceUtilizations, done)
    });
}

module.exports.dbUtil = dbUtil;