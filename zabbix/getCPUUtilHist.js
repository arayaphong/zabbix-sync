const { getHistByKey } = require("./getHistByKey");
const getCPUUtilHist = (token, hostId, timeFrom, done) => getHistByKey(token, hostId, "system.cpu.util", timeFrom, done);
module.exports.getCPUUtilHist = getCPUUtilHist;