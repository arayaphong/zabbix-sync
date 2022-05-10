const fs = require('fs');
const rawdata = fs.readFileSync('./config.json');
const config = JSON.parse(rawdata);
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
            console.log(hosts);
            console.log("Now I got hosts");
            pool.getConnection()
                .then(conn => {
                    console.log("Now I got DB connection");
                    conn.query("SELECT host_id FROM hosts;")
                        .then((res) => {
                            console.log("Now I got DB query results", res);
                            const dbHostIds = res.map(host => host.host_id);
                            hosts = hosts.filter(host => !dbHostIds.includes(parseInt(host.hostid)));
                            if (hosts.length < 1) return done(null, { affectedRows: 0, insertId: 0, warningStatus: 0 });

                            const values = hosts.map(host => "(" + host.hostid + ", '" + host.name + "', NOW())");
                            const sql = "INSERT INTO hosts VALUES" + values.join(",") + ";"
                            console.log(sql);
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