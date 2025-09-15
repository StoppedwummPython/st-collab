module.exports = async () => {
    const alog = await require("./logging/alog")()
    alog("Login", "Checking for user info in localStorage")
    const lcstg = localStorage.getItem("userInfo")
    if (lcstg) {
        alog("Login", "User info found, removing login button")
        document.getElementById("login").remove()
        const userInfo = JSON.parse(lcstg)
        return userInfo
    } else {
        alog("Login", "No user info found, binding login button")
        document.getElementById("login").addEventListener("click", () => {
            document.location.href = "https://st-collab-oauth.vercel.app/app/login"
        })
        return undefined
    }
}