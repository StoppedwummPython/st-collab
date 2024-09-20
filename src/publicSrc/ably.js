/*
Copyright 2024 Stoppedwumm

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

/**
 * The main function of the Ably chat application.
 * It handles user authentication, sets up the chat channel, and listens for messages.
 * 
 * @async
 * @return {Promise<void>}
 */
async function ablyMain() {
  if (localStorage.getItem("joinCode") == undefined || localStorage.getItem("username") == undefined) {
    document.location.href = "/app/"
  }
  const sysM = ["Eine native Windows App ist nun verfügbar. Klicke <a href='https://www.mediafire.com/file/o1evkgljhmnu5ak/st-collab-native+Setup+1.0.0.exe/file'>hier</a> um sie herunterzuladen.", "btw opensource <a href='https://github.com/StoppedwummPython/st-collab'>github</a>"]
  const Ably = require('ably');
  const upload = require("./upload")
  const badge = require("./badge")
  const ext = require("./ban/package")
  const Ck = require('js-cookie')
  const em = require("node-emoji")
  const login = require("./login")

  console.log(localStorage.getItem("joinCode").startsWith("unban_"))

  if (Ck.get("ban") == "1" && !localStorage.getItem("joinCode").startsWith("unban_")) {
    document.location.href = "/app/ban"
    throw new Error("Banned")
  }

  badge.migrateBadge()

  const messages = document.getElementById('messages');
  for (const m of sysM) {
    const content = "System <img src='/app/chat/verified-icon.png' width='10'>: " + m
    let item = document.createElement('li');
    item.innerHTML = content;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }

  const badgeList = await badge.grabBadgeList()

  document.title = "Chat Room " + localStorage.getItem("joinCode")
  ext.onLocalUserJoin(localStorage.getItem("joinCode"))

  await login()
  
  const ably = new Ably.Realtime("bmNR6g.0jlirQ:NXb8iirOKUJehTMW3Pxb-hVPEFJfo2L2-8uPiMj140w")
  let currentChannel

  let ready = false

  ably.connection.once("connected", () => {
    ready = true
  })

  while (!ready) {
    await (() => { return new Promise((res, rej) => { setTimeout(() => { res(250) }, 250) }) })()
  }

  currentChannel = ably.channels.get("chat_" + localStorage.getItem("joinCode"))
  const devMode = await fetch("/dev")

  await require("./history")(currentChannel, messages)

  if (devMode.ok) {
    fetch("/dev/listen?channel=" + localStorage.getItem("joinCode"))
  }

  await currentChannel.subscribe("chat", async (msg) => {
    const content = new String(msg.data)
    ext.onMessage(content)
    let item = document.createElement('li');
    item.innerHTML = content;
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
      Ck.set("ban", "0", {expires:365})
    }
  })

  await currentChannel.publish("connect", localStorage.getItem("username"))

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
    })
    if (input.value) {
      if (badge.isBadgeCode(badgeList, input.value) != undefined) {
        badge.giveBadge(badge.isBadgeCode(badgeList, input.value))
        input.value = 'Erfolgreich!';
        await (() => { return new Promise((res, rej) => { setTimeout(() => { res(1) }, 5000) }) })()
        input.value = '';
        return
      }
      if (input.value == "/report") {
        document.location.href = "/report"
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

  document.getElementById("image_upload").addEventListener("click", async () => {
    console.log("Upload button pressed")
    const image = await upload()
    try {
      await currentChannel.publish("chat_image", JSON.stringify([localStorage.getItem("username"), image]))
    } catch (e) {
      alert("Datei wurde von ably verweigert, wahrscheinlich zu groß")
    }
  })
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

