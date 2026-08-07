const logger = {
  info: (msg, ...args) => console.log(`ℹ️ [INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`⚠️ [WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`❌ [ERROR] ${msg}`, ...args),
};

module.exports = logger;
