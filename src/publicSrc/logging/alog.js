if (localStorage.getItem("logDump") == null) {
  // create the log dump
  localStorage.setItem("logDump", "[]")
}

async function getAlog(params) {
    const devMode = (await fetch("/dev")).ok
  console.log("DEVMODE:", devMode)
  let alog = function () {
    return null
  }
  if (devMode) {
    console.log("Advanced Logging enabled")
    alog = (moduleName, ...args) => {
      console.log(`[AL] [${moduleName}]`, ...args)
      fetch("/dev/log", {
        method: "POST",
        body: `<${localStorage.getItem("username")}> [${moduleName}] ${args.join(" ")}`
      })
    }
  } else {
    alog = (moduleName, ...args) => {
      const time = new Date().toISOString()
      const logEntry = {
        time: time,
        module: moduleName,
        message: args.join(" ")
      }
      const logDump = JSON.parse(localStorage.getItem("logDump"))
      logDump.push(logEntry)
      localStorage.setItem("logDump", JSON.stringify(logDump))
    }
  }
    return alog
}

module.exports = getAlog