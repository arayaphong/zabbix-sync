const addHosts = (hosts, done) => {
    const mariadb = require('mariadb');
    const pool = mariadb.createPool({
        host: "home49171.thddns.net",
        port: 7977,
        user: 'admin',
        password: 'admin',
        database: "monitordb",
        connectionLimit: 5
    });
    async function sqlInsert(conn, done) {
        const dbHosts = await conn.query("SELECT host_id FROM hosts;");
        const dbHodtIds = dbHosts.map(host => host.host_id);
        hosts = hosts.filter(host => !dbHodtIds.includes(parseInt(host.hostid)));
        if (hosts.length <= 0) return done(null, "Nothing new hosts")

        const values = hosts.map(host => "(" + host.hostid + ", '" + host.name + "', NOW())");
        const sql = "INSERT INTO hosts VALUES" + values.join(",") + ";"
        const res = await conn.query(sql);
        done(null, res);
    }

    async function createTable(conn) {
        const sql = "CREATE TABLE `hosts` (\
            `host_id` int(11) NOT NULL,\
            `host_name` varchar(255) DEFAULT NULL,\
            `create_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),\
            PRIMARY KEY (`host_id`)\
          );"
        return await conn.query(sql);
    }
    async function asyncFetch() {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query("SHOW TABLES LIKE 'hosts';");
            const existing = (rows.length > 0);
            if (!existing) await createTable(conn, done);
            await sqlInsert(conn, done);
        } catch (err) {
            done(err);
        } finally {
            if (conn) return conn.end();
        }
    }

    asyncFetch();
}

module.exports.addHosts = addHosts;