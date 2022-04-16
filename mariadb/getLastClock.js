const config = require("../config");
const mariadb = require("mariadb");
const pool = mariadb.createPool(config.db);
const getLastClock = (table, hostId, done) => {
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
}

module.exports.getLastClock = getLastClock;