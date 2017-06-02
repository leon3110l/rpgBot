const Discord = require("discord.js");
const client = new Discord.Client();
const tokens = require("./tokens");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(tokens.discord);
