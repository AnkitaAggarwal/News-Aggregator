const NodeCache = require('node-cache');
const newsCache = new NodeCache();

// NewAPI 
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.newsapi_key);


 async function getCachedArticlesByPreferences(preferences) {
  const preferencesKey = JSON.stringify(preferences);

  // Check if articles for the given preferences exist in the cache
  const cachedArticles = newsCache.get(preferencesKey);

  if (cachedArticles) {
    // Articles found in the cache, return them
    console.log("cached response");
    return cachedArticles;
  }

  // Articles not found in the cache, fetch from news API
  let response = await newsapi.v2.topHeadlines({
    q : preferences.query,
    language: 'en',
    country: 'in'
   })

   console.log(response)

    if (response.status === 'ok') {
      // Store articles in the cache with a TTL
         const ttlInSeconds = 24*3600; // Set TTL to 24 hour
         newsCache.set(preferencesKey, response.articles, ttlInSeconds);

        return response.articles
    }
    return response.articles ?? []
}
module.exports = {getCachedArticlesByPreferences}
/*
const userId = 'Ankita';
const preferences = ['sports', 'US'];
const articles = await getCachedArticlesByPreferences(userId, preferences);
*/
  