module.exports = async (currentChannel, messages) => {
    const alog = await require("./logging/alog")()
    const his = await currentChannel.history({ limit: 10000 })
    for (const msg of his.items.reverse()) {
        alog("History", msg)
        console.log(msg)
        if (msg.name == "chat") {
            const content = new String(msg.data)
            let item = document.createElement('li');
            item.innerHTML = content;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
        if (msg.name == "chat_image") {
            const content = JSON.parse(new String(msg.data))
            let item = document.createElement('li');
            console.log(content)
            item.innerHTML = "<p>" + content[0] + ": </p>" + "<img src='" + content[1] + "'>"
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
        if (msg.name == "connect") {
            const content = new String(msg.data)
            let item = document.createElement('li');
            item.innerHTML = content + " joined!";
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
}