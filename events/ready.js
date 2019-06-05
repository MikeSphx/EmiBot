module.exports = client => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.channels.get('577033907040419851').send('Online!');

  var CronJob = require('cron').CronJob;

  const onTheHour = new CronJob('00 00 * * * *', function() {
    client.channels.get('577033907040419851').send('On the hour!');
  });

  onTheHour.start();

    const onThe2ndMinute = new CronJob('00 02 * * * *', function() {
    client.channels.get('577033907040419851').send('On the hour + 2 minutes!');
  });

  onThe2ndMinute.start();
}

