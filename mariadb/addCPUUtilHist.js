const config = require("../config");
const mariadb = require("mariadb");
const pool = mariadb.createPool(config.db);
const addCPUUtilHist = (data, hostId, done) => {
    pool.getConnection()
        .then(conn => {
            const values = data.map(d => "(" + d.clock + "," + hostId + "," + d.value + ")");
            const sql = "INSERT INTO cpu_utilizations VALUES " + values.join(",") + ";";
            conn.query(sql)
                .then((res) => {
                    done(null, { next: data[data.length - 1].clock });
                    conn.end();
                    console.log(res);
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

module.exports.addCPUUtilHist = addCPUUtilHist;