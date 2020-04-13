require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const DEL_TIMEOUT = 12000;
const CHANNEL_NAME = "turnip-prices";

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  // locks response to our specified channel name
  if (msg.channel.name !== CHANNEL_NAME) return;

  if (msg.author !== bot.user) {
    let content = msg.content.toLowerCase().split(' ');
    if (content[0].startsWith('!')) { // enter the world of commands.
      processCommand(msg, content);
    } else {
      processMessage(msg, content);
    }
  }
});

processMessage = (msg, content) => {
  let name = msg.member.displayName;
  if (content.length === 3) { // buying price msg
    if (content[0] === 'b') {
      if (content[2] === 'am' || content[2] === 'pm') {
        let time = content[2] === 'am' ? 'morning' : 'afternoon';
        if (content[1].match(/^-{0,1}\d+$/) && +content[1] >= 20 && +content[1] <= 900) {
          msg.channel.send(name.toUpperCase() + "'s " + nookName() + " are buying turnips for  `" + content[1] + " bells` this " + time + ".").then(res => {
            msg.delete(DEL_TIMEOUT);
          });
        } else delMsg(msg, "Second Value must be a numeric value between 20 and 900.");
      } else delMsg(msg, "Third value must be [am | pm], only include this third value if you're listing a buy price.");
    } else delMsg(msg, "First value must be [b | s], and must include a third value of [am | pm] if listing a buy price.");
  } else if (content.length === 2) { //selling price msg
    if (content[0] === 's') {
      if (content[1].match(/^-{0,1}\d+$/) && +content[1] >= 90 && +content[1] <= 115) {
        msg.channel.send(name.toUpperCase() + "'s " + hogName() + " is selling turnips for `" + content[1] + " bells`.").then(res => {
          msg.delete(DEL_TIMEOUT);
        });
      } else delMsg(msg, "Second Value must be a numeric value between 90 and 115.");
    } else delMsg(msg, "First value must be [b | s], and must include a third value of [am | pm] if listing a buy price.");
  } else delMsg(msg, "Invalid Message Format. Try: '[b | s] [price as number] [am | pm (omit if listing sale price)]");
}

processCommand = (msg, content) => {
  switch (content[0]) {
    case '!average':
      break;
    default: break;
  }
}

delMsg = (msg, err) => {
  msg.reply(err).then(res => {
    res.delete(DEL_TIMEOUT); // deletes the bots response
    msg.delete(DEL_TIMEOUT); // deletes the original method 
  });
}

nookName = () => {
  let ran = randomNumber(1, 5);
  switch (ran) {
    case 1: return 'trashlings';
    case 2: return 'lil nooks';
    case 3: return 'garbage rats';
    case 4: return 'brown creatures';
    default: return 'tanuki twins';
  }
}

hogName = () => {
  let ran = randomNumber(1, 3);
  switch (ran) {
    case 1: return 'turnip hog';
    case 2: return 'lil babby';
    default: return 'parsnip lady';
  }
}

randomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}