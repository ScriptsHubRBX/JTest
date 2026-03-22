const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
let tiktok = null;
let messages = [];
let currentUsername = "";

// подключение к стриму
function connectToStream(username) {
    if (tiktok) {
        try { tiktok.disconnect(); } catch(e) {}
    }

    messages = [];
    currentUsername = username;

    tiktok = new WebcastPushConnection(username);

    tiktok.connect()
        .then(state => {
            console.log(`Connected to ${username}`);
        })
        .catch(err => {
            console.error("Connection failed:", err);
        });

    tiktok.on('chat', data => {
        messages.push({
            user: data.nickname,
            text: data.comment
        });

        if (messages.length > 100) messages.shift();
    });
}

// endpoint: установить стрим
app.get('/setStream', (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.send("No username provided");
    }

    connectToStream(username);
    res.send(`Connected to ${username}`);
});

// endpoint: получить сообщения
app.get('/messages', (req, res) => {
    res.json({
        streamer: currentUsername,
        messages: messages
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
