const snoowrap = require('snoowrap');

const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

getNewSales = function(client) {

  const _newSalesResultHandler = function(result) {
    var formattedResult = result.map(post => post.title).slice(0, 5).join('\n');
    client.channels.get('688815290942881804').send(formattedResult);
  }

  r.getSubreddit('buildapcsales').getNew().then(_newSalesResultHandler);
}

module.exports = {
  getNewSales: getNewSales,
}