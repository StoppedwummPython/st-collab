if (localStorage.getItem("logDump") == null) {
    // create the log dump
    localStorage.setItem("logDump", "[]")
}

if (localStorage.getItem("fumbledTheCatInTheBag") == null) {
    localStorage.setItem("fumbledTheCatInTheBag", "false")
} 

async function getAError() {
    const devMode = (await (await fetch("/dev")).text()) == "DevMode enabled"
    console.log("DEVMODE:", devMode)

    let aerror = function () {
        return null
    }
    if (devMode) {
        console.log("Advanced Error enabled")
        aerror = (moduleName, critical, ...args) => {
            const time = new Date().toISOString()
            console.error(`[AE] [${moduleName}]`, ...args)
            if (critical) {
                fetch("/dev/error/critical", {
                    method: "POST",
                    body: `<${localStorage.getItem("username")}> [${moduleName}] ${args.join(" ")}`
                })
            } else {
                fetch("/dev/error", {
                    method: "POST",
                    body: `<${localStorage.getItem("username")}> [${moduleName}] ${args.join(" ")}`
                })
            }

            if (critical) {
                localStorage.setItem("fumbledTheCatInTheBag", "true")
                // redirect to error page
                localStorage.setItem("lastError", `[${moduleName} ${time}] ${args.join(" ")}`)
                document.location.pathname = "/about/error"
            }
        }
    } else {
        aerror = (moduleName, critical, ...args) => {
            if (localStorage.getItem("fumbledTheCatInTheBag") == "true") return
            const time = new Date().toISOString()
            const logEntry = {
                time: time,
                module: moduleName,
                message: args.join(" "),
                error: true,
                critical
            }
            const logDump = JSON.parse(localStorage.getItem("logDump"))
            logDump.push(logEntry)
            localStorage.setItem("logDump", JSON.stringify(logDump))

            if (critical) {
                localStorage.setItem("fumbledTheCatInTheBag", "true")
                const time = new Date().toISOString()
                // redirect to error page
                localStorage.setItem("lastError", `[${moduleName} ${time}] ${args.join(" ")}`)
                document.location.pathname = "/about/error"
            }
        }
    }
    return aerror
}

module.exports = getAError