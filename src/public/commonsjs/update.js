fetch("/version.txt").then(res => res.text()).then(version => {
  if (localStorage.getItem("version") == null || localStorage.getItem("version") != version.split("!")[0]) {
    localStorage.setItem("version", version.split("!")[0])
    location.pathname = "/about/update"
  }
})