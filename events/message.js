module.exports = (client, msg) => {

  if (msg.content === 'ping') {
    msg.reply('Pong!');

  } else if (msg.content === 'andrew') {
    msg.reply('Andrew is a bot like me!');
  }

}
