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
        // CHANGED: Use "logDump" to match the rest of the script
        localStorage.removeItem("logDump"); 
        localStorage.removeItem("lastError");
        alert("Debug log cleared.")
        location.reload(); // Refresh page to show empty state
    }
})

// --- FIX FOR THE LOADING ISSUE ---
const debugContainer = document.getElementById("debugInfo");
const rawLogs = localStorage.getItem("logDump");

if (!rawLogs) {
    debugContainer.innerHTML = "No log entries found.";
} else {
    try {
        const logs = JSON.parse(rawLogs);
        let logHTML = "";
        
        // Loop through the array/object
        for (const i in logs) {
            const entry = logs[i];
            logHTML += `[${entry.module || 'Unknown'} ${entry.time || ''}] ${entry.message || ''}<br>`;
        }
        
        debugContainer.innerHTML = logHTML || "Log is empty.";
    } catch (e) {
        debugContainer.innerHTML = "Error parsing log data.";
        console.error(e);
    }
}

// Populate the error field
if (document.getElementById("lastError")) {
    document.getElementById("lastError").innerText = localStorage.getItem("lastError") || "No error details found.";
}
