module.exports = async () => {
    const lcstg = localStorage.getItem("userInfo")
    if (lcstg) {
        console.log("USER INFO FOUND!")
        document.getElementById("login").remove()
        const userInfo = JSON.parse(lcstg)
        return userInfo
    } else {
        document.getElementById("login").addEventListener("click", () => {
            document.location.href = "https://st-collab-oauth.vercel.app/app/login"
        })
        return undefined
    }
}