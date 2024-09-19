const ck = require('js-cookie')
let m = {}

/**
 * Sends a message to the chat
 * @param {string} msg The message to be sent
 */
m.chat = async (msg, ban, unban) => {
    console.log(msg)
    if (msg.startsWith("/ban")) {
        console.log("Is ban")
        if (ck.get("admin") == "1") {
            console.log("Valid")
            let uname = msg.replace("/ban ", "")
            console.log(uname)
            await ban(uname)
        }
        return
    }
    if (msg.startsWith("/unban")) {
        console.log("Is unban")
        if (ck.get("admin") == "1") {
            console.log("Valid")
            let uname = msg.replace("/unban ", "")
            console.log(uname)
            await unban(uname)
        }
        return
    }
}

/**
 * Sends a message to the chat
 * @param {string} msg The message to be sent
 */
m.message = async (msg) => {
    console.log(msg)
}

/**
 * This function is called when a user connects to the chat
 * @param {string} connectmessage The username of the user that connected
 */
m.connect = async (connectmessage) => {
    console.log(`${connectmessage} joined!`)
}

/**
 * This function is called when a user joins a room
 * @param {string} code The join code of the room that the user joined
 */
m.join = async (code) => {
    console.log(`User joined room with code ${code}`)
}


module.exports = m