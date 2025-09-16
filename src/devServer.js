const e = require("express")
const app = e()
let listening = []
const Ably = require('ably');
const ably = new Ably.Realtime("bmNR6g.0jlirQ:NXb8iirOKUJehTMW3Pxb-hVPEFJfo2L2-8uPiMj140w")

ably.connection.on("connected", () => {
    console.log("Connection established to ably")
})

app.use(e.static("./public"))

app.get("/dev", (req, res) => {
    res.sendStatus(200).send("DevMode enabled")
})

app.get("/mode", (req, res) => {
    res.send("This server is in DevMode, DO NOT USE THIS FOR PRODUCTION")
})

app.get("/dev/listen", async (req, res) => {
    const channel = req.query["channel"]

    const ablyChannel = ably.channels.get("chat_" + channel)

    if (listening.find((val) => {return val == this}, channel)) {
        res.sendStatus(200)
        return
    } else {
        console.log("[Ably][Subscribe] Subscribing to", channel)
        ablyChannel.subscribe("chat", (msg) => {
            console.log("[Ably][Chat] " + msg)
        })
    
        ablyChannel.subscribe("connect", (msg) => {
            console.log("[Ably][Connect] " + msg)
        })
    
        ablyChannel.subscribe("disconnect", (msg) => {
            console.log("[Ably][Disconnect] " + msg)
        })
        ablyChannel.subscribe("ban", (msg) => {
            console.log("[Ably][BAN] " + msg + " has been banned!")
        })
    }

    res.sendStatus(200)
})

app.post("/dev/log", async (req, res) => {
    let body = []
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log("[Client Log] " + body)
        res.sendStatus(200)
    })
})

app.get("/adminConsole", (req, res) => {
    if (req.query.code != "1234") {
        res.sendStatus(403)
        return
    }

    res.send("<h1>Admin Panel</h1><p>This is the admin panel. You can do admin things here.</p>")
    /* 
    ToDo: Add Admin Panel
    */
})

app.post("/adminConsole", (req, res) => {
    if (req.query.code != "1234") {
        res.sendStatus(403)
        return
    }

    res.send("<h1>Admin Panel</h1><p>This is the admin panel. You can do admin things here.</p>")
    /* 
    ToDo: Add Admin Panel
    */
})

app.listen(3000, () => {
    console.log("Dev Server running on port", 3000)
})