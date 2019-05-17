// Load dependencies
const Discord = require('discord.js');
const client = new Discord.Client();

// Load event handlers
const readyHandler = require('./events/ready.js');
const messageHandler = require('./events/message.js');

client.on('ready', () => readyHandler(client));
client.on('message', msg => messageHandler(client, msg));

// Activate bot
const secure = require('./secure.js');
client.login(secure.discordKey);
