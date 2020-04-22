require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const moment = require('moment-timezone');

const scripts = require('./calc/scripts');

const DEL_TIMEOUT = 12000;
const DEL_TIMEOUT_SHORT = 1000;
const STONKS_COOLDOWN = 1000000;
const CHANNEL_NAME = "turnip-prices";

var stonksTimer = 0;

bot.login(TOKEN);

/**
 * Running into limitations - querying the messages from 'channel' returns a max of 100 messages.
 * 
 * The issues we're running into aren't related to the limitation but made me realize the limitation.
 * The issues we're running into are probably un-resolved promise related -- we're only getting a single
 * message back when we should be getting multiple. But now there's the realization of the query limitation
 * so we need to find a better way to get messages back.
 * 
 * 
 * 
 */
bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.channel.name !== CHANNEL_NAME) return;
  if (!msg.content) return;
  if (msg.author !== bot.user) {
    let name = msg.member.displayName;
    let time = msg.createdTimestamp;
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
        if (!processStonks(msg, cmd, args, time)) {
          let stonksOffset = (stonksTimer - time) / 1000;
          delMsg(msg, `Can't use stonks command for another ${Math.round(stonksOffset)} seconds!`);
        }
        break;
      }
      case 'avg': {
        processAverage(msg, cmd, args, name).then(res => {
          if (res) {
            let message = args[0] === 'me' ? name.toUpperCase() + "'s average turnip buy price is `" + res + " bells` thus far." :
              "The channel's average buy price is `" + res + " bells` thus far.";
            msg.channel.send(message).then(res => {
              msg.delete(DEL_TIMEOUT);
            })
          } else {
            delMsg(msg, `Invalid Message Format. Try: '[avg] [me | all]`)
          }
        });
        break;
      }
      case 'best': {
        processBest(msg, cmd, args, name).then(res => {
          if (res) {
            let message = args[0] === 'me' ? name.toUpperCase() + "'s best turnip buy price is `" + res + " bells` thus far." :
              "The channel's best turnip buy price is `" + res + " bells` thus far.";
            msg.channel.send(message).then(res => {
              msg.delete(DEL_TIMEOUT);
            })
          } else {
            delMsg(msg, `Invalid Message Format. Try: '[best] [me | all]`)
          }
        });
        break;
      }
      case 'worst': {
        processWorst(msg, cmd, args, name).then(res => {
          if (res) {
            let message = args[0] === 'me' ? name.toUpperCase() + "'s worst turnip buy price is `" + res + " bells` thus far." :
              "The channel's worst turnip buy price is `" + res + " bells` thus far.";
            msg.channel.send(message).then(res => {
              msg.delete(DEL_TIMEOUT);
            })
          } else {
            delMsg(msg, `Invalid Message Format. Try: '[worst] [me | all]`)
          }
        });
        break;
      }
      case 'calc': {
        buildPricingArray(msg, name, args).then(res => {
          convertCalcOutput(scripts.calculateOutput(convertToUsablePricingArray(res), false, -1));
        })
      }
      default: {
        if (name.toUpperCase() !== 'BEANKONDUCTA') {
          if (!msg.content.startsWith('@here'))
            msg.delete(DEL_TIMEOUT_SHORT);
        }
      }
    }
  }
});

// [b] [##] [am | pm]
processBuy = (msg, cmd, args, min, max, name) => {
  if (args.length < 1) return false;
  if (!numberBetween(args[0], min, max)) return false;
  //if (args[1] !== 'am' && args[1] !== 'pm') return false;
  let zone = args.length === 2 ? args[1] : '';
  let time = toTimezone(msg.createdTimestamp, zone).time === 'am' ? 'morning' : 'afternoon';
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
    let count = 0;
    let total = 0;
    for (let m of messages) {
      if (m[1].content.includes('buying') && !m[1].content.includes('average')) {
        let split = m[1].content.split('`');
        let price = split[1].split(' ')[0];
        if (validNumber(price))
          total += +price;
        count++;
      }
    }
    return Math.round(total / count);
  });
  return avg;
}

// [best] [me | all]
processBest = async (msg, cmd, args, name) => {
  if (args.length < 1) return false;
  if (args[0] !== 'me' && args[0] !== 'all') return false;
  let best = await msg.channel.fetchMessages().then(res => {
    let messages = args[0] !== 'me' ? res : res.filter(m => m.content.includes(name.toUpperCase()));
    let bestSoFar = 0;
    for (let m of messages) {
      if (m[1].content.includes('buying') && !m[1].content.includes('average')) {
        let split = m[1].content.split('`');
        let price = split[1].split(' ')[0];
        if (validNumber(price))
          if (+price > bestSoFar)
            bestSoFar = +price;
      }
    }
    return Math.round(bestSoFar);
  });
  return best;
}

// [worst] [me | all]
processWorst = async (msg, cmd, args, name) => {
  if (args.length < 1) return false;
  if (args[0] !== 'me' && args[0] !== 'all') return false;
  let worst = await msg.channel.fetchMessages().then(res => {
    let messages = args[0] !== 'me' ? res : res.filter(m => m.content.includes(name.toUpperCase()));
    let worstSoFar = 10000;
    for (let m of messages) {
      if (m[1].content.includes('buying') && !m[1].content.includes('average')) {
        let split = m[1].content.split('`');
        let price = split[1].split(' ')[0];
        if (validNumber(price))
          if (+price < worstSoFar)
            worstSoFar = +price;
      }
    }
    return Math.round(worstSoFar);
  });
  return worst;
}

// [stonks]
processStonks = (msg, cmd, args, time) => {
  if (+time < +stonksTimer) return false;
  stonksTimer = +time + STONKS_COOLDOWN;
  msg.channel.send('https://i.redd.it/kh141vuquai41.png').then(res => {
    msg.delete(DEL_TIMEOUT_SHORT);
  });
  return true;
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

/**
 * Exports the message timestamp as {day, time(am or pm)}
 * [sun: 0, mon: 1, tues: 2, wed: 3, etc]
 */
toTimezone = (timestamp, timezone) => {
  let days = ['Sunday', 'monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let str;
  switch (timezone.toLowerCase()) {
    case 'm': // mountain
      str = moment(timestamp).tz('America/Denver').format('dddd HH');
      break;
    case 'e': // eastern
      str = moment(timestamp).tz('America/New_York').format('dddd HH');
      break;
    case 'p': // pacific
      str = moment(timestamp).tz('America/Los_Angeles').format('dddd HH');
      break;
    case 'c': // central
      str = moment(timestamp).tz('America/Chicago').format('dddd HH');
      break;
    default: // default to mountain
      str = moment(timestamp).tz('America/Denver').format('dddd HH');
      break;
  }
  if (!str) return;
  let split = str.split(' ');
  let time = +split[1] >= 12 ? 'pm' : 'am';
  let day = days.indexOf(split[0]);
  return { day, time };
}

// this is working on test server but not real one
buildPricingArray = async (msg, name, args) => {
  let startDate = moment().clone().weekday(0).valueOf();
  let endDate = moment().clone().weekday(6).valueOf();
  let pricingArray = [];
  let timezone = args.length < 1 ? 'm' : args[0];
  // console.log(endDate);
  // console.log(startDate);
  let msgs = await msg.channel.fetchMessages({limit: 100}).then(res => {
    let messages = res.filter(m => m.content.includes(name.toUpperCase()));
    console.log(res.size);
    for (let m of messages) {
      // console.log(m[1].createdTimestamp);
      if (m[1].content.includes('buying') && !m[1].content.includes('average')) {
        if (+m[1].createdTimestamp <= +endDate && m[1].createdTimestamp >= +startDate) {
          let split = m[1].content.split('`');
          let price = split[1].split(' ')[0];
          pricingArray.push({ ...toTimezone(m.createdTimestamp, timezone), price });
        }
      }
      if (m[1].content.includes('selling') && !m[1].content.includes('average')) {
        if (+m[1].createdTimestamp <= +endDate && m[1].createdTimestamp >= +startDate) {
          let split = m[1].content.split('`');
          let price = split[1].split(' ')[0];
          pricingArray.push({ day: 'selling', price });
        }
      }
    }
  });
  return pricingArray;
}

// this works! might run into issues with arrays with duplicates tho
convertToUsablePricingArray = (arr) => {
  let usableArray = arr.sort((a, b) => a.day - b.day); // basic sort by day
  let newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let item of usableArray) {
    if (item.day === 'selling') {
      newArray[0] = item.price;
    }
    else {
      let dayMod = item.time === 'am' ? item.day - 1 : item.day;
      newArray[item.day + dayMod] = item.price;
    }
  }
  console.log(newArray);
  return newArray;
}

convertCalcOutput = (output) => {
  console.log(output);
}