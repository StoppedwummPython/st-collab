const ck = require('js-cookie')
let m = {}
const { GoogleGenerativeAI } = require("@google/generative-ai");
const showdown  = require('showdown');
const badge = require('../badge');
const converter = new showdown.Converter();
const key = "AIzaSyAzxjzh5HGYlKwadlxUtC3R2-hELvmWS1g"

/**
 * Sends a message to the chat
 * @param {string} msg The message to be sent
 */
m.chat = async (msg, ban, unban, respond) => {
    console.log(msg)
    if (msg.startsWith("/ban")) {
        console.log("Is ban")
        if (ck.get("admin") == "1") {
            console.log("Valid")
            let uname = msg.replace("/ban ", "")
            console.log(uname)
            await ban(uname)
            await respond("Banned " + uname, "Ban system")
        } else {
            await respond("You are not an admin", "Ban system")
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
            await respond("Unbanned " + uname, "Ban system")
        } else {
            await respond("You are not an admin", "Ban system")
        }
        return
    }
    if (msg.startsWith("/apps ai")) {
        console.log("Is admin")
        console.log("Valid")
        
        let aiPrompt = msg.replace("/apps ai ", "")
        console.log(aiPrompt)
        const genAI = new GoogleGenerativeAI(key);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const modelResponse = await model.generateContent([aiPrompt]);
        await respond(converter.makeHtml(modelResponse.response.text()), "Gemini AI")
        return
    }
    if (msg.startsWith("/apps yt")) {
        const ytPrompt = msg.replace("/apps yt ", "")
        const video_id = ytPrompt.split('v=')[1];
        const url = `https://ably-yt.vercel.app/?channel=${localStorage.getItem("joinCode")}_${video_id}&videoId=${video_id}`
        await respond(`<a href='${url}'>${localStorage.getItem("username")} hat ein Video geteilt, klicke hier um es anzusehen</a>`, "YouTube")
        return
    }
    if (msg.startsWith("/apps script")) {
        const script = msg.replace("/apps script ", "")
        if (ck.get("admin") == "1") {
            try {
                console.log("Valid")
                await respond(eval(script), "Script Return")
            } catch (e) {
                await respond(e, "Script Error")
            }
        } else {
            await respond("You are not an admin", "Script")
        }
        return
    }
    if (msg == "/apps") {
        await respond("Read about apps <a href='/about/apps'>here</a>", "Apps")
        return
    }

    if (msg == "/testerror") {
        const aerror = await require('../logging/aerror')();
        await respond("ich hab mir selber in den fuß geschossen", "Test error command")
        aerror("Events.js", true, "This is a test error")
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
    console.log(connectmessage)
}

/**
 * This function is called when a user joins a room
 * @param {string} code The join code of the room that the user joined
 */
m.join = async (code) => {
    console.log(`User joined room with code ${code}`)
}


module.exports = m