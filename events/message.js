module.exports = (client, msg) => {

  const axios = require('axios');

  const secure = require('../secure.js');
  const apiTag = secure.xivKey;


  // Functions

  _averagePricePerUnit = function(arr) {
    // var sum = arr.reduce((a, b) => {
    //   return a + b.PricePerUnit;
    // });
    var sumOfPrices = 0;
    arr.forEach(({PricePerUnit}) => sumOfPrices += PricePerUnit);

    return sumOfPrices / arr.length;
  }

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

    // Testing with Ice Shard, ID: 3
    axios.get('https://xivapi.com/market/item/3', {
      params: {
        dc: 'Crystal',
        private_key: apiTag
      }
    })
    .then((response) => {
      // HQ
      // Find lowest 10 prices in Crystal Data Center
      console.log(response.data.Coeurl);
      var allPrices = [];

      for (var world in response.data) {
        var prices = response.data[world].Prices;
        prices.forEach(function(element) { element.World = world; });
        var allPrices = prices.concat();
      }

      var sortedPrices = allPrices.sort((a, b) => { return a.PricePerUnit - b.PricePerUnit });
      var lowestPrices = sortedPrices.slice(0, 10);

      // Find latest 10 sales in Coeurl
      var allCoeurlSales = response.data.Coeurl.History;
      var latestSales = allCoeurlSales.slice(0, 10);

      var avgPrice = _averagePricePerUnit(lowestPrices);
      var avgSale = _averagePricePerUnit(latestSales);
      var differential = Math.round(((avgSale / avgPrice) * 100) - 100);
      
      console.log(avgPrice);
      console.log(avgSale);
      console.log(differential);

      var coeurlItemData = response.data.Coeurl.Item;

      var replyMsg = `here's what I found:\
        \n\n**Item**: ${coeurlItemData.Name} - ID: ${coeurlItemData.ID}\
        \n**Diff**: ${differential}%\
        \n\n**Avg Lowest 10 Prices**: ${avgPrice} gil\
        \n**Lowest Price**: ${lowestPrices[0].PricePerUnit} gil - ${lowestPrices[0].RetainerName}, ${lowestPrices[0].World}\
        \n\n**Avg Sales in Coeurl**: ${avgSale} gil\
        \n**Latest Sale in Coeurl**: ${latestSales[0].PricePerUnit} gil - ${latestSales[0].CharacterName}, *time wip*\
        \n**# of Sales in Past 48 Hrs**: *wip*`;

      msg.reply(replyMsg);

      // Compare averages, determine if worth making an alert for

      // If worthid, print message to server
      // Item name, item ID
      // Average of lowest 10 prices + lowest price
      // Average of latest 10 sales
      // How many sales in the past 48 hours

    })
    .catch((error) => {
      console.log(error);
    });

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




  // TODO, Check for highest GROSS profit (considering price * total units)

}
