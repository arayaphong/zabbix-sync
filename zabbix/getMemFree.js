const { getHistByKey } = require("./getHistByKey");
const getMemFree = (token, hostId, timeFrom, done) => getHistByKey(token, hostId, "vm.memory.size[pavailable]", timeFrom, done);
module.exports.getMemFree = getMemFree;