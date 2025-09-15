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
  }
    return alog
}

module.exports = getAlog