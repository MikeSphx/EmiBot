const axios = require('axios');

const apiTag = process.env.XIV_KEY;

_averagePricePerUnit = function(arr) {
  var sumOfPrices = 0;
  arr.forEach(({PricePerUnit}) => sumOfPrices += PricePerUnit);

  return sumOfPrices / arr.length;
};

_countRecentSales = function(arr) {
  var ts = Math.round((new Date()).getTime() / 1000);
  var twoDaysAgo = ts - 172800;

  var result = 0;
  arr.forEach((sale) => {
    if (sale.PurchaseDate > twoDaysAgo) {
      result += 1;
    }
  })
  return result;
}

_isGoodDeal = function(marketAnalysis, msg) {
  // If meets criteria designated in msg, return true
  // Else return false
  // if (marketAnalysis.differential > 150)
}

sendMarketAnalysisEmbed = function(marketAnalysis, msg) {
  // If worthid, print message to server
  // Item name, item ID
  // Average of lowest 10 prices + lowest price
  // Average of latest 10 sales
  // How many sales in the past 48 hours

  // Per item category
  var fields = [];

  // Per item in a category
  marketAnalysis.forEach((mA) => {

    var replyMsg = `here's what I found:`;

    if (mA.differential > 600 && mA.numRecentSales > 0) {
      var quality = mA.isHQ ? 'HQ' : 'LQ';

      var field = {
        name: `${mA.itemName} (${quality})`,
        value: `**Diff** - ${mA.differential}%\
                \n**Avg Unit Sale in Coeurl** - ${mA.avgSale} gil\
                \n**# of Sales in Past 48 Hrs** - ${mA.numRecentSales}`
      };

      fields.push(field);

      // replyMsg += `\n\n**Item**: ${mA.itemName} - ID: ${mA.itemID}\
      // \n**Quality**: ${quality}\
      // \n**Diff**: ${mA.differential}%\
      // \n**Avg Unit Sale in Coeurl**: ${mA.avgSale} gil\
      // \n**# of Sales in Past 48 Hrs**: ${mA.numRecentSales}\
      // \n---------------------------------------------------------------`;

      // replyMsg += `\n\n**Item**: ${mA.itemName} - ID: ${mA.itemID}\
      // \n**Quality**: ${quality}\
      // \n**Diff**: ${mA.differential}%\
      // \n\n**Avg Lowest 10 Prices**: ${mA.avgPrice} gil\
      // \n**Lowest Price**: ${mA.lowestPrices[0].PricePerUnit} gil - ${mA.lowestPrices[0].RetainerName}, ${mA.lowestPrices[0].World}\
      // \n\n**Avg Sales in Coeurl**: ${mA.avgSale} gil\
      // \n**Latest Sale in Coeurl**: ${mA.latestSales[0].PricePerUnit} gil - ${mA.latestSales[0].CharacterName}, *time wip*\
      // \n**# of Sales in Past 48 Hrs**: *wip*\
      // \n---------------------------------------------------------------`;

      // msg.reply(replyMsg);
    }
  });

  if (fields.length !== 0) {
    var marketAnalysisEmbed = {
      color: 0xCC0849,
      author: {
        name: 'FFXIV Market Analysis',
        // Maybe use these for later
        // icon_url: 'https://i.imgur.com/wSTFkRM.png',
        // url: 'https://discord.js.org',
      },
      fields: fields
    };
    msg.channel.send({embed: marketAnalysisEmbed});
  }
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

getItemIdsGivenCategoryId = function(cID, page) {
  return axios.get(`https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID=${cID}`, {
    params: {
      page: page,
      private_key: apiTag
    }
  });
}

getItemIdsGivenCategoryIdPage2 = function(cID) {
  return axios.get(`https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID=${cID}`, {
    params: {
      page: 2,
      private_key: apiTag
    }
  });
}

_createMarketAnalysisGivenSummaries = function(data) {

  var marketAnalysis = []

  try {
    // Iterate through each item
    data.forEach((item) => {

      var allPricesLQ = [];
      var allPricesHQ = [];
      var latestSalesLQ = null;
      var latestSalesHQ = null;
      var numRecentSalesLQ = 0;
      var numRecentSalesHQ = 0;
      var itemData = null;

      // Edge case, some items are null and not worth looking at
      if (item == null || item.Coeurl.Item == null) {
        return;
      }

      // Iterate through each world with that item
      Object.keys(item).forEach(function (world) {
        // console.log(world); // key
        // console.log(item[world]); // value

        var marketInfo = item[world];

        // Save latest 10 sales in Coeurl
        if (world === 'Coeurl') {

          var salesLQ = marketInfo.History.filter((h) => h.IsHQ === false);
          var salesHQ = marketInfo.History.filter((h) => h.IsHQ === true);

          numRecentSalesLQ = _countRecentSales(salesLQ);
          numRecentSalesHQ = _countRecentSales(salesHQ);

          latestSalesLQ = salesLQ.slice(0, 5);
          latestSalesHQ = salesHQ.slice(0, 5);

          itemData = marketInfo.Item;
          buggedMarketInfo = marketInfo;
        }

        var prices = marketInfo.Prices;

        prices.forEach(function(element) { element.World = world; });

        var pricesLQ = prices.filter((p) => p.IsHQ === false);
        var pricesHQ = prices.filter((p) => p.IsHQ === true);

        allPricesLQ = allPricesLQ.concat(pricesLQ);
        allPricesHQ = allPricesHQ.concat(pricesHQ);
      });

      // Sort prices in the Data Center
      if (allPricesHQ.length !== 0 && latestSalesHQ.length !== 0) {
        var sortedPricesHQ = allPricesHQ.sort((a, b) => { return a.PricePerUnit - b.PricePerUnit });
        var lowestPricesHQ = sortedPricesHQ.slice(0, 10);

        var avgPriceHQ = _averagePricePerUnit(lowestPricesHQ);
        var avgSaleHQ = _averagePricePerUnit(latestSalesHQ);
        var differentialHQ = Math.round(((avgSaleHQ / avgPriceHQ) * 100) - 100);

        var resultHQ = {

          itemName: itemData.Name,
          itemID: itemData.ID,
          avgPrice: avgPriceHQ,
          avgSale: avgSaleHQ,
          differential: differentialHQ,
          lowestPrices: lowestPricesHQ,
          latestSales: latestSalesHQ,
          numRecentSales: numRecentSalesHQ,
          isHQ: true
        }
        marketAnalysis.push(resultHQ);
      }

      var sortedPricesLQ = allPricesLQ.sort((a, b) => { return a.PricePerUnit - b.PricePerUnit });
      var lowestPricesLQ = sortedPricesLQ.slice(0, 10);

        // Calculate averages of prices and recent sales, then compute the differential
      var avgPriceLQ = _averagePricePerUnit(lowestPricesLQ);

      if (latestSalesLQ == null) {
        console.log(item);
        return;
      }
      var avgSaleLQ = _averagePricePerUnit(latestSalesLQ);
      var differentialLQ = Math.round(((avgSaleLQ / avgPriceLQ) * 100) - 100);

      // console.log(`Average Price: ${avgPrice}`);
      // console.log(`Average Sale: ${avgSale}`);
      // console.log(`Differential: ${differential}`);

      var resultLQ = {
        itemName: itemData.Name,
        itemID: itemData.ID,
        avgPrice: avgPriceLQ,
        avgSale: avgSaleLQ,
        differential: differentialLQ,
        lowestPrices: lowestPricesLQ,
        latestSales: latestSalesLQ,
        numRecentSales: numRecentSalesLQ,
        isHQ: false
      }

      marketAnalysis.push(resultLQ);
    });
  }
  catch (error) {
    console.log(error);
  }

  return marketAnalysis;
}

bestDealsGivenCategoryID = async function(id, msg) {
  var donePagination = true;
  var currentPage = 1;
  var allMarketSummaries = [];

  while (donePagination) {
    const itemIDsResponse = await getItemIdsGivenCategoryId(id, currentPage);
    const itemIDs = itemIDsResponse.data.Results.reduce((acc, result) => acc += `${result.ID},`, '');
    const marketSummariesResponse = await marketSummariesGivenItemIDs(itemIDs);
    allMarketSummaries = allMarketSummaries.concat(marketSummariesResponse.data);

    currentPage += 1;
    donePagination = itemIDsResponse.data.Pagination.Page !== itemIDsResponse.data.Pagination.PageTotal;
  }

  const fullMarketAnalysis = _createMarketAnalysisGivenSummaries(allMarketSummaries);
  sendMarketAnalysisEmbed(fullMarketAnalysis, msg);
}

// Called on startup, usable for testing purposes
testFunction = async function() {
  // var donePagination = true;
  // var currentPage = 1;
  // var allMarketSummaries = [];
  // while (donePagination) {
  //   const itemIDsResponse = await getItemIdsGivenCategoryId(57, currentPage);
  //   const itemIDs = itemIDsResponse.data.Results.reduce((acc, result) => acc += `${result.ID},`, '');
  //   const marketSummariesResponse = await marketSummariesGivenItemIDs(itemIDs);
  //   allMarketSummaries = allMarketSummaries.concat(marketSummariesResponse.data);

  //   currentPage += 1;
  //   donePagination = itemIDsResponse.data.Pagination.Page !== itemIDsResponse.data.Pagination.PageTotal;
  // }

  // console.log(allMarketSummaries.length);

  // const marketSummariesResponse = await marketSummariesGivenItemIDs('12526');
  // _createMarketAnalysisGivenSummaries(marketSummariesResponse.data);
  // const itemIDsResponse = await getItemIdsGivenCategoryId(id);
  // console.log(itemIDsResponse);
}

module.exports = {
  bestDealsGivenCategoryID: bestDealsGivenCategoryID,
  testFunction: testFunction
}
