/*
Copyright 2024 Stoppedwumm
@Stoppedwumm
@StoppedwummPython

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// ping: document.dispatchEvent(new Event("ping")) 

/**
 * @async
 * @returns {Promise<void>}
 * Initializes and manages the main chat functionality using Ably for real-time messaging.
 * 
 * - Redirects to the app main page if the join code or username is missing.
 * - Displays system messages in the chat.
 * - Checks if the user is banned and redirects to the ban page if necessary.
 * - Migrates badges and displays them in the chat.
 * - Sets up Ably real-time connection and subscribes to various events such as chat messages, 
 *   user connections, disconnections, image messages, and bans/unbans.
 * - Handles sending messages, uploading images, and manages user interactions.
 * - Publishes user connection message and listens for server pings to respond with "PONG".
 */
async function ablyMain() {

  localStorage.setItem("logDump", "[]")
  const alog = await require("./logging/alog")()
  const aerror = await require("./logging/aerror")()

  aerror("test", true, "dementia")

  alog("Load", "Starting main function")
  alog("Device Info (User Agent)", navigator.userAgent)
  alog("Device Info (Language)", navigator.language)
  alog("Device Info (Platform)", navigator.platform)
  alog("Device Info (Vendor)", navigator.vendor)
  alog("Device Info (Online)", navigator.onLine)
  alog("Device Info (Cookies Enabled)", navigator.cookieEnabled)
  alog("Device Info (Hardware Concurrency)", navigator.hardwareConcurrency)
  alog("Device Info (Max Touch Points)", navigator.maxTouchPoints)
  alog("Device Info (Do Not Track)", navigator.doNotTrack)
  alog("Device Info (Screen Width)", screen.width)
  alog("Device Info (Screen Height)", screen.height)
  alog("Device Info (Color Depth)", screen.colorDepth)
  alog("Device Info (Pixel Depth)", screen.pixelDepth)
  alog("Device Info (Timezone)", Intl.DateTimeFormat().resolvedOptions().timeZone)

  const devMode = (await (await fetch("/dev")).text()) == "DevMode enabled"
  if (localStorage.getItem("joinCode") == undefined || localStorage.getItem("username") == undefined) {
    document.location.href = "/app/"
  }
  const sysM = ["Eine native Windows App ist nun verfügbar. Klicke <a href='https://drive.google.com/file/d/1VL-dlHUPc1oMNSTZ5LBxgoxufSI3p57s/view?usp=sharing'>hier</a> um sie herunterzuladen.", "btw opensource <a href='https://github.com/StoppedwummPython/st-collab'>github</a>", "Another project (eaglergrab): <a href='https://github.com/Stoppedwumm-Studios/eaglerGrab/releases/tag/v1.2.3'>here</a>", "Read about apps <a href='/about/apps'>here</a>", "If you encounter any errors, please report them with the debug log, which you can find <a href='/about/debug/'>here</a>"]
  const Ably = require('ably');
  const upload = require("./upload")
  const badge = require("./badge")
  const ext = require("./ban/package")
  const Ck = require('js-cookie')
  const em = require("node-emoji")
  const login = require("./login")
  const showdown = require('showdown');
  const converter = new showdown.Converter({
    openLinksInNewWindow: true
  });
  const { injectSpeedInsights } = require('@vercel/speed-insights')
  const $ = require("jquery")
  alog("Speed Insights", "Initializing")
  try {
    injectSpeedInsights({ route: "/app/chat/", framework: "webpack" })
  } catch (e) {
    console.log("Speed Insights failed:", e, ", running anyways")
  }

  alog("Name", "Checking if only spaces")
  let isOnlySpace = true
  for (const char of localStorage.getItem("username")) {
    if (char != " ") {
      alog("Name", "Not only spaces:", char)
      isOnlySpace = false
    }
  }
  alog("Name", "Only spaces:", isOnlySpace)
  if (isOnlySpace) {
    aerror("Name", false, "Name is only spaces, redirecting to /app")
    alert("Your name is only consisting out of spaces")
    document.location.href = "/app"
  }


  alog("Unban channel", localStorage.getItem("joinCode").startsWith("unban_"))

  if (Ck.get("ban") == "1" && !localStorage.getItem("joinCode").startsWith("unban_")) {
    alog("Banned", "Redirecting to ban page")
    document.location.href = "/app/ban"
    throw new Error("Banned")
  }

  alog("Badge", "Migrating")
  badge.migrateBadge()

  alog("System", "Loading system messages")
  const messages = document.getElementById('messages');
  for (const m of sysM) {
    const content = "System <img src='/app/chat/verified-icon.png' width='10'>: " + m
    let item = document.createElement('li');
    item.innerHTML = content;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    alog("System", m)
  }

  const badgeList = await badge.grabBadgeList()
  alog("Badge List", badgeList)
  alog("Chat", "Setting up chat")
  document.title = "Chat Room " + localStorage.getItem("joinCode")
  alog("Extension", "Setting up extension")
  ext.onLocalUserJoin(localStorage.getItem("joinCode"))

  alog("Login", "Logging in")
  await login()

  alog("Ably", "Setting up Ably")
  const ably = new Ably.Realtime("bmNR6g.0jlirQ:NXb8iirOKUJehTMW3Pxb-hVPEFJfo2L2-8uPiMj140w")
  let currentChannel

  let ready = false

  ably.connection.once("connected", () => {
    alog("Ably", "Connected")
    ready = true
  })

  alog("Ably", "Waiting for connection")
  while (!ready) {
    await (() => { return new Promise((res, rej) => { setTimeout(() => { res(250) }, 250) }) })()
  }

  alog("Ably", "Setting up channel")
  currentChannel = ably.channels.get("chat_" + localStorage.getItem("joinCode"))

  alog("Ably", "Setting up ping")
  document.addEventListener("ping", () => {
    currentChannel.publish("ping", "")
  })

  alog("Ably", "Setting up history")
  await require("./history")(currentChannel, messages)

  alog("Ably", "Setting up listeners")
  if (devMode) {
    fetch("/dev/listen?channel=" + localStorage.getItem("joinCode"))
  }

  await currentChannel.subscribe("chat", async (msg) => {
    const content = new String(msg.data)
    ext.onMessage(content)
    let item = document.createElement('li');
    item.innerHTML = converter.makeHtml(content).replace("<p>", "").replace("</p>", "");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  })

  await currentChannel.subscribe("connect", async (msg) => {
    const content = new String(msg.data)
    ext.onConnect(content)
    let item = document.createElement('li');
    item.innerHTML = content + " joined!";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  })

  await currentChannel.subscribe("disconnect", async (msg) => {
    const content = new String(msg.data)
    let item = document.createElement('li');
    item.innerHTML = content + " left!";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  })

  await currentChannel.subscribe("chat_image", (msg) => {
    const content = JSON.parse(new String(msg.data))
    ext.onMessage(content)
    let item = document.createElement('li');
    console.log(content)
    item.innerHTML = "<p>" + content[0] + ": </p>" + "<img src='" + content[1] + "'>"
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  })

  await currentChannel.subscribe("ban", async (username) => {
    console.log(username.data)
    if (localStorage.getItem("username") == username.data) {
      Ck.set("ban", "1", { expires: 365 })
      document.location.href = "/app/ban"
    }
  })

  await currentChannel.subscribe("unban", async (username) => {
    console.log(username.data)
    if (localStorage.getItem("username") == username.data) {
      Ck.set("ban", "0", { expires: 365 })
    }
  })

  await currentChannel.subscribe("ping", (msg) => {
    currentChannel.publish("chat", localStorage.getItem("username") + ": PONG")
  })

  await currentChannel.subscribe("forceRefresh", (msg) => {
    location.reload()
  })

  alog("Ably", "Publishing connect")
  await currentChannel.publish("connect", localStorage.getItem("username"))

  alog("Ably", "Setting up form")
  let form = document.getElementById('form');
  let input = document.getElementById('input');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ext.onChat(input.value, async (username) => {
      await currentChannel.publish("ban", username)
      return username
    }, async (username) => {
      await currentChannel.publish("unban", username)
      return username
    }, async (msg, appName) => {
      if (badge.hasBadge()) {
        await currentChannel.publish("chat", localStorage.getItem("username") + " (" + appName + ") <img src='" + badge.hasBadge() + "' width='10'> : " + msg)
      } else {
        await currentChannel.publish("chat", localStorage.getItem("username") + " (" + appName + "): " + msg)
      }
    })
    if (input.value) {
      if (input.value.startsWith("/code")) {
        const code = prompt("Code?")
        alog("Ably", "Code: " + code, "Is badge" + badge.isBadgeCode(badgeList, code))
        if (code && (badge.isBadgeCode(badgeList, code) != "undefined" || badge.isBadgeCode(badgeList, code) != undefined)) {
          badge.giveBadge(badge.isBadgeCode(badgeList, code))
          input.value = 'Erfolgreich!';
          await (() => { return new Promise((res, rej) => { setTimeout(() => { res(1) }, 5000) }) })()
          input.value = '';
        }
        return
      }
      if (input.value.startsWith("/r")) {
        const code = input.value.split(" ")[1]
        if (code == "2435") {
          await currentChannel.publish("forceRefresh", "")
        }
        input.value = '';
        return
      }

      if (input.value == "/report") {
        //document.location.href = "/report"

        aerror("Commands", false, "/report is not implemented yet")
      } else {
        if (badge.hasBadge()) {
          await currentChannel.publish("chat", localStorage.getItem("username") + " <img src='" + badge.hasBadge() + "' width='10'> : " + em.emojify(input.value))
        } else {
          await currentChannel.publish("chat", localStorage.getItem("username") + ": " + em.emojify(input.value))
        }
        input.value = '';
      }
    }
  });


  alog("Ably", "Setting up image upload")
  document.getElementById("image_upload").addEventListener("click", async () => {
    try {
      const image = await upload()
      await currentChannel.publish("chat_image", JSON.stringify([localStorage.getItem("username"), image]))
    } catch (e) {
      console.log(e)
    }
  })
  alog("Load", "Last checks, hang tight!")

  // check if variables are their expected type
  if (typeof localStorage.getItem("joinCode") != "string" || typeof localStorage.getItem("username") != "string") {
    aerror("Load", true, "Variables not their expected type")
  }
}

/*
async function reportMain() {
  const mysql = require('mysql');
  let connection = mysql.createConnection({
    host: 'sql8.freesqldatabase.com:3306',
    user: 'sql8730334',
    password: 'akfDVpcrts',
    database: 'sql8730334'
  });

  await (() => {return new Promise((res, rej) => {
    connection.connect((err) => {
      if (err) {
        rej(err)
      } else {
        res(connection)
      }
    })
  })})()

  connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
  });

  connection.close()
}
*/
if (document.location.href == "http://localhost:3000/report" || document.location.href == "http://localhost:3000/report/" || document.location.href == "https://st-collab.vercel.app/report" || document.location.href == "https://st-collab.vercel.app/report/") {
  // reportMain()
} else {
  ablyMain()
}

//       .,,::,.
//     .:;i;;ii;:.,,::ii::::.
//    ,::::::::;ii;::::,,,:;1t:.
//   .,..,::,,::;i;,:i;, .,:;fCL,
//   ,,,,:::::;;:::;1ff1,:;;;ifGf.
//   :ti;:,::;;i;,:;tft1::;::;1LL.
//    ;i;:..,,:::.,1ffff::ti:,;tf;,
//     ,ii,,,:,,.  ;LLCC1;;,:;tC0GCfi.
//    .,:;,.....  .,1LGCff1.,;i1ffCGGL1,
//    .::.. ...  ...:fLCf1:.,:;;;itffLGCt,
//     it;;,...  ..,:i1fi,.,:::::;i11ttfGCi
//    ;Lt;:;:,,::;:::,,,...,:::,,:::;;ifCLf.
//   .ff1;,::;ii;;:,,,,,.,,,:,,,,,,,,;11tt1.
//  .ittt111i;;:,,,,,,...,,,,,,,.,,,,:::,:i.
// :i;itt11;,,:,,,,,,...,,,,,,:,..,:,,,,,,:.
// ,;i11i;:,,,,,,,,.. .,,::::::,,..,:,,,,,,
//  ,i1;::,,,,,,,.,,...,::,,,,,,,,...,:,,,,
//   .;;::,,,,:........,::,,,,,,,,,...,,,,,
//     ,:::,,.:;,,,....,:,,,,,,,,,,....,,,,
//        .   .1;:,...,,,,,,:::,,,,,...,:,,
//             ..        ,:;;:.         .
//                     .tCGGGCL1,
//                    .ffitCfi1ft.
//                    :GLtfCfiiif:
//                   .fC11;::itLL:
//                  .:ti:i;::,,1ti.
//                ,;i;:.........:,.,,.
//              .;fLf;;i,.   .,,,:,..,,.
//            .:tf1i:.,;;:,,.,,,:t;..,;:
//         ,;1LCf;::,..::::,,.,:i1ii::;i
//       .;fCLfti::,,i;;;:::,,:::::iiii:
//      ,fGLfti:::,.1G0GCLLLL;,,.,:;iiii;,
//     ;CCftLL1i1i:,L0888888f:,,,,i1i;;i11:
//   .1GGfifLfttt1i;f0888880tii;1tfi:::;;ii.
//   tCff1;tffiiiii;t08GC88CfftfLf1::;;:;;;.
// .1GLti;:ifftt111;10LiC88t1ttttffi;;:;;;:
// fCf1i;;:iCttffft;iLCCCCG;;iitLLLti;:iii:
// ft1;;;::1Lftt1i;:1C000GG;;;,:ff1;:iti;;:
// ti::::::1fttti;,:tCG00GC;::::,,,,,;tt1i;
// fi:,,,,iCf111ii:;iCG00GL:::,::,,,:;i1i1i

//                                                            ,1,
//                               ......                     .ifL1
//                            .;1ttttLLf1,                 ;fffff,
//                           :LCLfttfLLLLL:              ,tffffffi
//                          ,CCCLf11ff1tff;            ,1Lffffffff.
//                          iLttt11ifLLLfft.           :iitffffffLi
//                          ;t1111ii1fffff1               ffffft;i1.
//                          ,1iiiiii1tt1it,              ifffff,
//                           ;1i;;;;i1tff:              .fffff1
//                           ,t1ii;:::;i;               ifffff,
//                          .,;11iii;:                 .fffff1
//                     ..,,.,,.,iftitGi...             ifffff,
//                 .,,,::::,,,,..;LLLGt::::,,,.       .fffff1
//                 ;,,,,,,,,,,,,,.,;tfi,::,,::::,     ;fffff,
//                 ::,,,,,,,,..,:,,.:ft,::,,:,,::.   .fffff1
//                 ,i:,,,,,,,,..,,,,,,;,:::,:,,,::   ;fffff,
//                 .1:,,,,,,,,..,,,:,,,::,,,:,,,,:, .fffff1
//                  ;;:,,,,,:, ..,,,::,,,:,,:,,,,::.,1tfff:
//                  ,1;:,,,,;f:.,,,,,,:,..,,:,..,,::,  ..,
//                   ;i::,,,,,:,,:,,:,:::,,,;1:,.,,,:,
//                   .;;;:,,,,,,,,,::::::::::LGC;,,,,:.
//                    .;;:,,.,,,,,,,,,,,,,,:::;;:,,,,,:
//                     ,:::,.....,,,,,,,,,,,:,,,,,,,,,:.
//                     ....,....,,,,,,.....,,,,,,,,,,,,.
//                     ,,..     .,::;:........,,,,,...
//                     :,,......      ............
//                     :,...........   ....:,...,.
//                     ,,............. ...,1;,,,,.
//                                         ..

