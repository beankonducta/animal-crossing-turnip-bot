require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const moment = require('moment-timezone');

const scripts = require('./calc/scripts');

const DEL_TIMEOUT = 7500;

const TIME_ALLOWED = 7500000000;

var dgTimer = 0;

var gecTimer = 0;

var dgWords = ['deathgrips', 'death grips', 'thgr', 'th gr', 'd34thgr1ps', 'andy morin', 'zach hill', 'mc ride', 'spirg htaed', 'spirghtaed', 'захваты смерти', 'القبضات القاتلة', 'մահվան բռնակներ', 'ölüm tutur'];

var gecsWords = ['100 gecs', 'one hundred gecs', '100gecs', 'onehundredgecs', '100 geks', '100geks', 'onehundredgeks', 'one hundred geks', 'gecs', 'geks', 'gec'];

var oneOne = '1v1 me'

var mergeWords = dgWords.concat(gecsWords);

bot.login(TOKEN);

bot.on('ready', async () => {
    console.log('ready again');
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    if (!newMessage.content) return;
    if (newMessage.author !== bot.user) {
        for (let word of mergeWords) {
            if (newMessage.content.toLowerCase().includes(word.toLowerCase())) {
                delMsg(newMessage, `this fuckin freak tried to bypass me by editing his message! freak.`)
                return;
            }
        }
    }
});

bot.on('message', async msg => {
    // if (msg.channel.name !== channelName) return; // locks bot to specific channel.
    if (!msg.content) return;
    // }
    if (msg.author !== bot.user) {
        for (let word of dgWords) {
            if (msg.content.toLowerCase().includes(word.toLowerCase())) {
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
        for (let word of gecsWords) {
            if (msg.content.toLowerCase().includes(word.toLowerCase())) {
                let time = msg.createdTimestamp;
                if (+time < +gecTimer) {
                    let gecOffset = (+gecTimer - +time) / 1000;
                    delMsg(msg, `Can't type anything about 100 gecs for another ${Math.round(gecOffset)} seconds!`)
                } else {
                    gecTimer = time + TIME_ALLOWED;
                }
                return;
            }
        }
        if (msg.content.toLowerCase().includes(oneOne.toLowerCase())) {
            msg.reply(`yeah i'll 1v1 you fuckin freak`)
        }
    }
});

delMsg = (msg, err) => {
    msg.author.send('idk if u talkin about gecs or death grips but cmon man cut it out!!!!');
    msg.reply(err).then(res => {
        res.delete(DEL_TIMEOUT - 100); // deletes the bots response
        msg.delete(DEL_TIMEOUT); // deletes the original message
    });
}