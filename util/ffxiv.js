

const axios = require('axios');

const secure = require('../secure.js');
const apiTag = secure.xivKey;

_averagePricePerUnit = function(arr) {
var sumOfPrices = 0;
arr.forEach(({PricePerUnit}) => sumOfPrices += PricePerUnit);

return sumOfPrices / arr.length;
};

marketSummaryGivenItemID = function(id, isHQ) {
  axios.get(`https://xivapi.com/market/item/${id}`, {
    params: {
      dc: 'Crystal',
      private_key: apiTag
    }
  })
  .then((response) => {
    // Find lowest 10 prices in Crystal Data Center

    // console.log(response.data.Coeurl);
    var allPrices = [];
    // Check prices from each world, add World field to each
    for (var world in response.data) {
      var prices = response.data[world].Prices;

      //TODO Filter out based on quality

      prices.forEach(function(element) { element.World = world; });
      var allPrices = prices.concat();
    }
    // Sort prices from Data Center 
    var sortedPrices = allPrices.sort((a, b) => { return a.PricePerUnit - b.PricePerUnit });
    var lowestPrices = sortedPrices.slice(0, 10);
    // Find latest 10 sales in Coeurl
    var allCoeurlSales = response.data.Coeurl.History;

    //TODO Filter out based on quality

    var latestSales = allCoeurlSales.slice(0, 10);
    // console.log(latestSales);

    // Calculate averages of prices and recent sales, then compute the differential
    var avgPrice = _averagePricePerUnit(lowestPrices);
    var avgSale = _averagePricePerUnit(latestSales);
    var differential = Math.round(((avgSale / avgPrice) * 100) - 100);

    console.log(`Average Price: ${avgPrice}`);
    console.log(`Average Sale: ${avgSale}`);
    console.log(`Differential: ${differential}`);

    var coeurlItemData = response.data.Coeurl.Item;

    var result = {
      itemName: coeurlItemData.Name,
      itemID: coeurlItemData.ID,
      avgPrice: avgPrice,
      avgSale: avgSale,
      differential: differential,
      lowestPrices: lowestPrices,
      latestSales: latestSales,
      isHQ: isHQ
    }

    return result;
  })
  .catch((error) => {
    console.log('error');
  });
}

sendMarketSummaryEmbed = function(data, msg) {
  // If worthid, print message to server
  // Item name, item ID
  // Average of lowest 10 prices + lowest price
  // Average of latest 10 sales
  // How many sales in the past 48 hours

  var replyMsg = `here's what I found:`;

  for (var deal in data) {
    var quality = deal.isHQ ? 'HQ' : 'LQ';

    replyMsg += `\n\n**Item**: ${deal.itemName} - ID: ${deal.itemID}\
    \n**Quality**: ${quality}\
    \n**Diff**: ${deal.differential}%\
    \n\n**Avg Lowest 10 Prices**: ${deal.avgPrice} gil\
    \n**Lowest Price**: ${deal.lowestPrices[0].PricePerUnit} gil - ${deal.lowestPrices[0].RetainerName}, ${deal.lowestPrices[0].World}\
    \n\n**Avg Sales in Coeurl**: ${deal.avgSale} gil\
    \n**Latest Sale in Coeurl**: ${deal.latestSales[0].PricePerUnit} gil - ${deal.latestSales[0].CharacterName}, *time wip*\
    \n**# of Sales in Past 48 Hrs**: *wip*`;
  }

  msg.reply(replyMsg);
}

bestDealsGivenCategoryID = function(id, msg) {
  axios.get(`https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID=${id}`, {
    params: {
      private_key: apiTag
    }
  })
  .then((response) => {
    var marketSummaryList = [];
    var responseData = response.data.Results;

    responseData.forEach((item) => {

      // Compare averages, determine if worth adding to alert
      console.log(`Item ID: ${item.ID}`);

      var resultLQ = marketSummaryGivenItemID(item.ID, false);
      if (resultLQ.differential > 60) {
        marketSummaryList.append(resultLQ);
      }
      var resultHQ = marketSummaryGivenItemID(item.ID, true);
      if (resultHQ.differential > 60) {
        marketSummaryList.append(resultHQ);
      }
    })

    sendMarketSummaryEmbed(marketSummaryList, msg);
  })
  .catch((error) => {
    console.log(error);
  });
}

module.exports = {
  bestDealsGivenCategoryID: bestDealsGivenCategoryID,
}