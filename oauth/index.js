const app = require("express")()
const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: '55c4da442f2bdd330342681b34d33852becd59fba5b240af91d7abae045b2d00',
  baseURL: 'https://st-collab-oauth.vercel.app',
  clientID: '8Q83Ai93H6MDxQNlbBXRIgeLSxTH7BX6',
  issuerBaseURL: 'https://dev-q7dxok6qny7atrjj.us.auth0.com'
};

let running = {}

function CheckForValue(array, value) {
    let found = false
    array.forEach((val) => {
        if (value == val) {
            found = true
        }
    })
    return found
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/app/login', requiresAuth(), (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    const code = randomIntFromInterval(10000000,99999999)
    running[new String(code)] = JSON.stringify(req.oidc.user)
    res.redirect("https://st-collab.vercel.app/login/after?code=" + code)
    return
});

app.get("/app/api/check", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    if (running[req.query["code"]]) {
        res.send(running[req.query["code"]])
    } else {
        res.sendStatus(404)
    }
})

app.listen(3000)