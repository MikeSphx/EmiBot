module.exports = client => {
  console.log(`Logged in as ${client.user.tag}!`);

  const ffxiv = require('../util/ffxiv.js');

  client.channels.get(process.env.EMI_CHANNEL).send('Online!');

  var CronJob = require('cron').CronJob;

  // const onTheHour = new CronJob('00 00 * * * *', function() {
  //   client.channels.get('577033907040419851').send('On the hour!');
  // });

  // onTheHour.start();

  // ffxiv.testFunction();

}

