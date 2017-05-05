const express = require('express');
const bodyParser = require('body-parser');
const bot = require("./bot");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res) {
    if (!req.body.group_id && !req.body.sender_id && !req.body.text) {
        res.json({
            status: "error",
            message: "No group_id or text or sender_id in request body. Is this a GroupMe message payload?"
        });
        return;
    }
    if (req.body.name && req.body.name === process.env.GROUPCHAT_BOT_NAME) {
        res.json({
            status: "success",
            action: "none",
            message: "No action taken, message was posted by the bot itself."
        });
        return;
    }
    // We need to work out if the message is from the registered group of the bot (so reply to the group), or a DM (reply directly to user)
    if (req.body.group_id === process.env.GROUPCHAT_BOT_GROUP_ID) {
        // It's a message on the group chat and it's not a message from the bot itself
        if (!req.body.text.match(/^erin/i) && !req.body.text.match(/erin\?$/i)) {
            // Don't respond to the group if we don't have a bot response - they might not be talking to us!
            res.json({
                status: "success",
                action: "none",
                message: "No action taken, we don't think we were the intended recipient of the message from the group."
            });
            return;
        }
        bot.processMessage(req.body.text)
            .then((responseParameters) => {
                return bot.generateResponse(responseParameters);
            })
            .then((reply) => {
                return bot.sendMessageToGroup(reply);
            })
            .then((result) => {
                res.json({
                    status: "success",
                    action: "groupMessageSent"
                });
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        bot.processMessage(req.body.text)
            .then((responseParameters) => {
                return bot.generateResponse(responseParameters);
            })
            .then((reply) => {
                return bot.sendDirectMessage(req.body.sender_id, reply);
            })
            .then((result) => {
                res.json({
                    status: "success",
                    action: "directMessageSent"
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }

});

app.listen(process.env.PORT);
console.log("started listening for messages");