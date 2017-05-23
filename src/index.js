const express = require('express');
const bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
const pa = require("./pa");
const draftWatcher = require("./draftWatcher");

draftWatcher();
setInterval(() => {
    console.log("Checking for new draft picks");
    draftWatcher()
}, 60000
);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/talk", (req, res) => {
    if (!req.body.text) {
        res.json({
            status: "error",
            error: "No 'text' key in request"
        });
    } else {
        const conversationId = uuidV1();
        pa.receiveMessage(req.body.text, conversationId)
            .then((erinResponse) => {
                res.json(erinResponse);
            })
    }
});

app.post("/talk/group", (req, res) => {
    if (!req.body.group_id && !req.body.sender_id && !req.body.text) {
        res.json({
            status: "error",
            error: "No group_id or text or sender_id in request body. Is this a GroupMe message payload?"
        });
    } else {
        const conversationId = uuidV1();
        pa.receiveGroupMessage(req.body, conversationId);
        res.json({
            status: "success",
            conversationId: conversationId
        });
    }
});

app.post("/talk/directmessage", (req, res) => {
    if (!req.body.sender_id && !req.body.text) {
        res.json({
            status: "error",
            error: "No text or sender_id in request body. Is this a GroupMe direct message payload?"
        });
        res.end();
    } else {
        const conversationId = uuidV1();
        pa.receiveDirectMessage(req.body, conversationId);
        res.json({
            status: "success",
            conversationId: conversationId
        });
    }
});

app.listen(process.env.PORT);
console.log("started listening for messages");