// Load NodeJS process environment variables
require('dotenv').config();

// Load dependencies
const Discord = require('discord.js');
const client = new Discord.Client();

// Load event handlers
// Ready - Handles functionality tied to startup
const readyHandler = require('./events/ready.js');
// Message - Handles functioality tied to messages
const messageHandler = require('./events/message.js');

// Activate handlers
client.on('ready', () => readyHandler(client));
client.on('message', msg => messageHandler(client, msg));

// Activate bot
client.login(process.env.DISCORD_KEY);
