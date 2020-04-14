require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const DEL_TIMEOUT = 12000;
const DEL_TIMEOUT_SHORT = 1000;
const CHANNEL_NAME = "turnip-prices";

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.channel.name !== CHANNEL_NAME) return;
  if (!msg.content) return;

  if (msg.author !== bot.user) {
    let name = msg.member.displayName;
    let cmdAndArgs = msg.content.toLowerCase().split(' ');
    let cmd = cmdAndArgs[0];
    let len = cmdAndArgs.length;
    let args = cmdAndArgs.slice(1, len);
    switch (cmd) {
      case 'b': {
        let min = 20;
        let max = 900;
        if (!processBuy(msg, cmd, args, min, max, name))
          delMsg(msg, `Invalid Message Format. Try: '[b] [price as number, from ${min} to ${max}] [am | pm]`);
        break;
      }
      case 's': {
        let min = 90;
        let max = 115;
        if (!processSell(msg, cmd, args, min, max, name))
          delMsg(msg, `Invalid Message Format. Try: '[s] [price as number, from ${min} to ${max}]`);
        break;
      }
      case 'stonks': {
        processStonks(msg, cmd, args);
        break;
      }
      case 't': {
        console.log('testing!!');
        break;
      }
      case 'avg': {
        processAverage(msg, cmd, args, name).then(res => {
          if (res) {
            let message = args[0] === 'me' ? name.toUpperCase() + "'s turnip average buy price is `" + res + " bells` thus far." :
              "The channel's turnip average buy price is `" + res + " bells` thus far.";
            msg.channel.send(message).then(res => {
              msg.delete(DEL_TIMEOUT);
            })
          } else {
            delMsg(msg, `Invalid Message Format. Try: '[avg] [me | all]`)
          }
        })
        break;
      }
      default: {
        msg.delete(DEL_TIMEOUT_SHORT);
      }
    }
  }
});

// [b] [##] [am | pm]
processBuy = (msg, cmd, args, min, max, name) => {
  if (args.length !== 2) return false;
  if (!numberBetween(args[0], min, max)) return false;
  if (args[1] !== 'am' && args[1] !== 'pm') return false;
  let time = args[1] === 'am' ? 'morning' : 'afternoon';
  msg.channel.send(name.toUpperCase() + "'s " + nookName() + " are buying turnips for  `" + args[0] + " bells` this " + time + ".").then(res => {
    msg.delete(DEL_TIMEOUT);
  }).catch();
  return true;
}

// [s] [##]
processSell = (msg, cmd, args, min, max, name) => {
  if (args.length !== 1) return false;
  if (!numberBetween(args[0], min, max)) return false;
  msg.channel.send(name.toUpperCase() + "'s " + hogName() + " is selling turnips for `" + args[0] + " bells`.").then(res => {
    msg.delete(DEL_TIMEOUT);
  }).catch();
  return true;
}

// [avg] [me | all]
processAverage = async (msg, cmd, args, name) => {
  if (args.length < 1) return false;
  if (args[0] !== 'me' && args[0] !== 'all') return false;
  let avg = await msg.channel.fetchMessages().then(res => {
    let messages = args[0] !== 'me' ? res : res.filter(m => m.content.includes(name.toUpperCase()));
    let validMessages = messages.filter(m => m.content.includes('`'));
    let count = 0;
    let total = 0;
    for (let m of validMessages) {
      if (m[1].content.includes('buying') && !m[1].content.includes('average')) {
        let split = m[1].content.split('`');
        let price = split[1].split(' ')[0];
        if (validNumber(price))
          total += +price;
        count++;
      }
    }
    return (total / count);
  });
  return avg;
}

processStonks = (msg, cmd, args) => {
  msg.channel.send('https://i.redd.it/kh141vuquai41.png').then(res => {
    msg.delete(DEL_TIMEOUT_SHORT);
  });
}

delMsg = (msg, err) => {
  msg.reply(err).then(res => {
    res.delete(DEL_TIMEOUT - 100); // deletes the bots response
    msg.delete(DEL_TIMEOUT); // deletes the original message
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

numberBetween = (num, min, max) => {
  if (!validNumber(num)) return false;
  if (num < +min || num > +max) return false;
  return true;
}

validNumber = (num) => {
  return num.match(/^-{0,1}\d+$/);
}