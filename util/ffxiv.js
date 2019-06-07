const axios = require('axios');

const secure = require('../secure.js');
const apiTag = secure.xivKey;

_averagePricePerUnit = function(arr) {
  var sumOfPrices = 0;
  arr.forEach(({PricePerUnit}) => sumOfPrices += PricePerUnit);

  return sumOfPrices / arr.length;
};

sendMarketAnalysisEmbed = function(marketAnalyses, msg) {
  // If worthid, print message to server
  // Item name, item ID
  // Average of lowest 10 prices + lowest price
  // Average of latest 10 sales
  // How many sales in the past 48 hours

  var replyMsg = `here's what I found:`;

  marketAnalyses.forEach((marketAnalysis) => {
    marketAnalysis.forEach((mA) => {
      if (mA.differential > 50) {
        var quality = mA.isHQ ? 'HQ' : 'LQ';

        replyMsg += `\n\n**Item**: ${mA.itemName} - ID: ${mA.itemID}\
        \n**Quality**: ${quality}\
        \n**Diff**: ${mA.differential}%\
        \n\n**Avg Lowest 10 Prices**: ${mA.avgPrice} gil\
        \n**Lowest Price**: ${mA.lowestPrices[0].PricePerUnit} gil - ${mA.lowestPrices[0].RetainerName}, ${mA.lowestPrices[0].World}\
        \n\n**Avg Sales in Coeurl**: ${mA.avgSale} gil\
        \n**Latest Sale in Coeurl**: ${mA.latestSales[0].PricePerUnit} gil - ${mA.latestSales[0].CharacterName}, *time wip*\
        \n**# of Sales in Past 48 Hrs**: *wip*\
        \n---------------------------------------------------------------`;
      }
    });
  });

  msg.reply(replyMsg);
}

marketSummariesGivenItemIDs = function(ids) {
  return axios.get(`https://xivapi.com/market/items`, {
    params: {
      dc: 'Crystal',
      ids: ids,
      private_key: apiTag
    }
  });
}

getItemIdsGivenCategoryId = function(cID) {
  return axios.get(`https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID=${cID}`, {
    params: {
      private_key: apiTag
    }
  });
}

_createMarketAnalysisGivenSummaries = function(data, isHQ) {

  var marketAnalysis = []

  // Iterate through each item
  data.forEach((item) => {
    // console.log(deal);

    var allPrices = [];
    var latestSales = null;
    var itemData = null;

    // Iterate through each world with that item
    Object.keys(item).forEach(function (world) {
      // console.log(world); // key
      // console.log(item[world]); // value

      var marketInfo = item[world];

      // Save latest 10 sales in Coeurl
      if (world === 'Coeurl') {
        //TODO Filter out based on quality
        latestSales = marketInfo.History.slice(0, 10);
        itemData = marketInfo.Item;
      }

      var prices = marketInfo.Prices;
      //TODO Filter out based on quality
      prices.forEach(function(element) { element.World = world; });
      allPrices = prices.concat();
    });

    // Sort prices in the Data Center
    var sortedPrices = allPrices.sort((a, b) => { return a.PricePerUnit - b.PricePerUnit });
    var lowestPrices = sortedPrices.slice(0, 10);

      // Calculate averages of prices and recent sales, then compute the differential
    var avgPrice = _averagePricePerUnit(lowestPrices);
    var avgSale = _averagePricePerUnit(latestSales);
    var differential = Math.round(((avgSale / avgPrice) * 100) - 100);

    // console.log(`Average Price: ${avgPrice}`);
    // console.log(`Average Sale: ${avgSale}`);
    // console.log(`Differential: ${differential}`);

    var result = {
      itemName: itemData.Name,
      itemID: itemData.ID,
      avgPrice: avgPrice,
      avgSale: avgSale,
      differential: differential,
      lowestPrices: lowestPrices,
      latestSales: latestSales,
      isHQ: isHQ
    }

    marketAnalysis.push(result);

  });

  return marketAnalysis;

}

bestDealsGivenCategoryID = async function(id, mgs) {
  const itemIDsResponse = await getItemIdsGivenCategoryId(id);
  // TODO Access pagination itemIDs.data
  const itemIDs = itemIDsResponse.data.Results.reduce((acc, result) => acc += `${result.ID},`, '');
  const marketSummariesResponse = await marketSummariesGivenItemIDs(itemIDs);
  const marketSummaries = marketSummariesResponse.data;

  const fullMarketAnalyses = [];

  fullMarketAnalyses.push(_createMarketAnalysisGivenSummaries(marketSummaries, true));

  // Look through each item
  sendMarketAnalysisEmbed(fullMarketAnalyses, msg);
}

module.exports = {
  bestDealsGivenCategoryID: bestDealsGivenCategoryID,
}