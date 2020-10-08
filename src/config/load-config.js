const getAppConfig = require("./fetch-config");
/**
 * We use webpack's val-loader to run this file at build time so when
 * you require "load-config.js" it will be the value of the
 * config, not this file
 */
module.exports = async () => {
  const config = await getAppConfig(process.env.CONFIG_FILE);
  return {
    code: `module.exports = ${JSON.stringify(config)}`,
    // the value will be cached in development, not refetched on every build
    cacheable: true
  };
};
