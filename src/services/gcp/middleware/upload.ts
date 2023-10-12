const util = require("util");
const Multer = require("multer");

const processFile = Multer({
  storage: Multer.memoryStorage(),
}).single("file");

const processFileMiddleware = util.promisify(processFile);
export default processFileMiddleware;
