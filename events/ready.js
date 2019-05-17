module.exports = client => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.channels.get('577033907040419851').send('Online!');

  var CronJob = require('cron').CronJob;

  const job = new CronJob('00 00 * * * *', function() {
    client.channels.get('577033907040419851').send('On the hour!');
  });

  job.start();
}

