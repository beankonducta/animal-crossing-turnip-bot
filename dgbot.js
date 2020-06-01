require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const moment = require('moment-timezone');

const scripts = require('./calc/scripts');

const DEL_TIMEOUT = 7500;

const TIME_ALLOWED = 7500000;

var dgTimer = 0;

var dgWords = ['deathgrips', 'death grips', 'grips', 'death'];

bot.login(TOKEN);

bot.on('ready', async () => {
});

bot.on('message', async msg => {
    // if (msg.channel.name !== channelName) return; // locks bot to specific channel.
    if (!msg.content) return;
    if (msg.author !== bot.user) {
        let splitString = msg.content.toLowerCase().split(' ');
        for (let word of dgWords) {
            for (let str of splitString) {
                if (str.toLowerCase() === word.toLowerCase()) {
                    let time = msg.createdTimestamp;
                    if (+time < +dgTimer) {
                        let dgOffset = (+dgTimer - +time) / 1000;
                        delMsg(msg, `Can't type anything about death grips for another ${Math.round(dgOffset)} seconds!`)
                    } else {
                        dgTimer = time + TIME_ALLOWED;
                    }
                    return;
                }
            }
        }
    }
});

delMsg = (msg, err) => {
    msg.reply(err).then(res => {
        res.delete(DEL_TIMEOUT - 100); // deletes the bots response
        msg.delete(DEL_TIMEOUT); // deletes the original message
    });
}