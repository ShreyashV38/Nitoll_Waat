const express = require('express');
const app = express();
const PORT = 3000;

let ledCommand = "OFF";

// automatically toggle the LED command every 10 seconds
setInterval(() => {
    if (ledCommand === "OFF") {
        ledCommand = "ON";
    } else {
        ledCommand = "OFF";
    }
    console.log(`[Server] Update: Next command will be ${ledCommand}`);
}, 10000); // 10 seconds

// The Endpoint the ESP8266 will call
app.get('/api/led', (req, res) => {
    console.log(`ESP requested status. Sending: ${ledCommand}`);
    // Send a simple JSON response
    res.json({ status: ledCommand });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});