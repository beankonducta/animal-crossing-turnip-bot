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
  if (msg.channel.name !== CHANNEL_NAME) return;
  if (!msg.content) return;

  if (msg.author !== bot.user) {
    let cmdAndArgs = msg.content.toLowerCase().split(' ');
    let cmd = cmdAndArgs[0];
    let len = cmdAndArgs.length;
    if(len === 1) return;
    let args = cmdAndArgs.slice(1, len); // should it be 2, len?
    switch (cmd) {
      case 'b': {
        processBuy(msg, cmd, args);
        break;
      }
      case 's': {
        processSell(msg, cmd, args);
        break;
      }
      case 't': {
        console.log('testing!!');
        break;
      }
    }

  }
});

processBuy = (msg, cmd, args) => {
  let err = false;
  let name = msg.member.displayName;
  let min = 20;
  let max = 900;
  if (args.length !== 2) err = true;
  if (args[0].match(/^-{0,1}\d+$/) && +args[0] >= min && +args[0] <= max) err = true;
  if (args[1] !== 'am' && args[1] !== 'pm') err = true;
  if (!err) {
    let time = args[1] === 'am' ? 'morning' : 'afternoon';
    msg.channel.send(name.toUpperCase() + "'s " + nookName() + " are buying turnips for  `" + args[0] + " bells` this " + time + ".").then(res => {
      msg.delete(DEL_TIMEOUT);
    });
  } else {
    delMsg(msg, "Invalid Message Format. Try: '[b] [price as number, from " + min + " to " + max + " ] [am | pm]");
  }
}

processSell = (msg, cmd, args) => {
  let err = false;
  let name = msg.member.displayName;
  let min = 90;
  let max = 115;
  if (args.length !== 1) err = true;
  if (args[0].match(/^-{0,1}\d+$/) && +args[0] >= min && +args[0] <= max) err = true;
  if (!err) {
    msg.channel.send(name.toUpperCase() + "'s " + hogName() + " is selling turnips for `" + args[0] + " bells`.").then(res => {
      msg.delete(DEL_TIMEOUT);
    });
  } else {
    delMsg(msg, "Invalid Message Format. Try: '[s] [price as number, from " + min + " to " + max + " ]");
  }
}

// processMessage = (msg, content) => {
//   let name = msg.member.displayName;
//   if (content.length === 3) { // buying price msg
//     if (content[0] === 'b') {
//       if (content[2] === 'am' || content[2] === 'pm') {
//         let time = content[2] === 'am' ? 'morning' : 'afternoon';
//         if (content[1].match(/^-{0,1}\d+$/) && +content[1] >= 20 && +content[1] <= 900) {
//           msg.channel.send(name.toUpperCase() + "'s " + nookName() + " are buying turnips for  `" + content[1] + " bells` this " + time + ".").then(res => {
//             msg.delete(DEL_TIMEOUT);
//           });
//         } else delMsg(msg, "Second Value must be a numeric value between 20 and 900.");
//       } else delMsg(msg, "Third value must be [am | pm], only include this third value if you're listing a buy price.");
//     } else delMsg(msg, "First value must be [b | s], and must include a third value of [am | pm] if listing a buy price.");
// } else if (content.length === 2) { //selling price msg
//   if (content[0] === 's') {
//     if (content[1].match(/^-{0,1}\d+$/) && +content[1] >= 90 && +content[1] <= 115) {
//       msg.channel.send(name.toUpperCase() + "'s " + hogName() + " is selling turnips for `" + content[1] + " bells`.").then(res => {
//         msg.delete(DEL_TIMEOUT);
//       });
//     } else delMsg(msg, "Second Value must be a numeric value between 90 and 115.");
//   } else delMsg(msg, "First value must be [b | s], and must include a third value of [am | pm] if listing a buy price.");
// } else delMsg(msg, "Invalid Message Format. Try: '[b | s] [price as number] [am | pm (omit if listing sale price)]");
// }

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