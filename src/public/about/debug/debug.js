setTimeout(() => {
    localStorage.setItem("fumbledTheCatInTheBag", "false")
}, 3000)

document.getElementById("back").addEventListener("click", () => {
    document.location.href = "/app/chat"
})

document.getElementById("download").addEventListener("click", () => {
    const logData = localStorage.getItem("logDump") || "No log data found."
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'st-collab-debug.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
})

document.getElementById("clear").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the debug log? This action cannot be undone.")) {
        localStorage.setItem("debugLog", ""); // Clear the log
        alert("Debug log cleared.")
        document.getElementById("debugInfo").innerHTML = "Debug log cleared."
    }
})

document.getElementById("debugInfo").innerHTML = ""
for (const i in JSON.parse(localStorage.getItem("logDump"))) {
    const entry = JSON.parse(localStorage.getItem("logDump"))[i]
    document.getElementById("debugInfo").innerHTML = document.getElementById("debugInfo").innerHTML + "[" + entry.module + " " + entry.time + "]" + " " + entry.message + "<br>"
}

if (document.getElementById("lastError")) {
    document.getElementById("lastError").innerText = localStorage.getItem("lastError") || "No error details found."
}