if (localStorage.getItem("logDump") == null) {
  // create the log dump
  localStorage.setItem("logDump", "[]")
}

if (localStorage.getItem("fumbledTheCatInTheBag") == null) {
    localStorage.setItem("fumbledTheCatInTheBag", "false")
}

async function getAlog() {
    const devMode = (await (await fetch("/dev")).text()) == "DevMode enabled"
  console.log("DEVMODE:", devMode)

  let alog = function () {
    return null
  }
  if (devMode) {
    console.log("Advanced Logging enabled")
    alog = (moduleName, ...args) => {
      if (localStorage.getItem("fumbledTheCatInTheBag") == "true") return
      console.log(`[AL] [${moduleName}]`, ...args)
      fetch("/dev/log", {
        method: "POST",
        body: `<${localStorage.getItem("username")}> [${moduleName}] ${args.join(" ")}`
      })
    }
  } else {
    alog = (moduleName, ...args) => {
      if (localStorage.getItem("fumbledTheCatInTheBag") == "true") return
      const time = new Date().toISOString()
      const logEntry = {
        time: time,
        module: moduleName,
        message: args.join(" "),
        error: false,
        critical: false
      }
      const logDump = JSON.parse(localStorage.getItem("logDump"))
      logDump.push(logEntry)
      localStorage.setItem("logDump", JSON.stringify(logDump))
    }
  }
    return alog
}

module.exports = getAlog