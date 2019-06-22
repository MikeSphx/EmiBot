module.exports = (client, msg) => {

  const axios = require('axios');

  const apiTag = process.env.XIV_KEY;

  const ffxiv = require('../util/ffxiv.js');

  // Functions

  // General

  if (msg.content === 'ping') {
    msg.reply('Pong!');

  } else if (msg.content === 'andrew') {
    msg.reply('Andrew is a bot like me!');
  }

  // FFXIV tests

  // Flip checking:

  // Check all items from popular flipping item categories
  // Repeat next steps for LQ and HQ
  // Take average of lowest 10 prices in Crystal
  // Take average of last 10 sales in Coeurl
  // EXTRA Give a stat for how many sales in the past 48 hours
  // Post any sales with diffs above certain margin
  // EXTRA Post the lowest 10 prices in Crystal and where to get them

  // Single item check
  // Gives a summary of what items to look into

  else if (msg.content === 'emi test') {
    // var arr = [48, 57, 58];
    // Meals 45
    // Metal 48
    // Cloth 50
    // Materia 57
    // Crystals 58

    var arr = [45, 48, 50, 57, 58];
    // var arr = [48, 50, 57];
    arr.forEach((cID) => ffxiv.bestDealsGivenCategoryID(cID, msg));
  }

  else if (msg.content === 'emi ffxiv') {
    axios.get('https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID=58', {
      params: {
        private_key: apiTag
      }
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log('error');
    });
  }

}
