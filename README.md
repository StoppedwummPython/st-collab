# ST-Collab
## Source Index
```
root
-> src [Main source]
--> node_modules, package.json, package-lock.json, server.js [Only required for local testing]
---> publicSrc [Source code for ably]
----> ably.js [Ably Source Code]
----> package.json, package-lock.json [Node.js files]
----> webpack.config.js [Webpack Config]
---> public [Web Part]
----> app [Main App Directory]
-----> ably [Ably (webpack compiled) Code]
-----> chat [Chat HTML source]
-----> st-collab.my.canva.site [Landing Page Assets]
-----> index.html [Landing Page HTML]
-> README.md [The file that you are currently reading!]
```

## Explanation of the code
1. User gives an joinCode or thinks of one
2. The user joins, which tells the client to connect to Ably via websocket in this format
```js
// ...
currentChannel = ably.channels.get("chat_" + localStorage.getItem("joinCode"))
// ...
```
3. As soon as the user is connected, it sends an message so that every client knows that it connected
4. You can think how the rest works

## Build source/Start Development Server
Run `npm test` in `/src`

## Deploy
Run `npm run publish` in `/src`

## License
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
