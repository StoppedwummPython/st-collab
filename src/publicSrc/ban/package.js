const extension = {}
const event = require("./Events")

extension.onChat = event.chat
extension.onMessage = event.message
extension.onConnect = event.connect
extension.onLocalUserJoin = event.join

module.exports = extension