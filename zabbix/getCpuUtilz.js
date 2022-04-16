const { getHistByKey } = require("./getHistByKey");
const getCpuUtilz = (token, hostId, timeFrom, done) => getHistByKey(token, hostId, "system.cpu.util", timeFrom, done);
module.exports.getCpuUtilz = getCpuUtilz;