"use strict";

const baseURL = "https://www.numbeo.com/api/city_prices";
const apiKey = "12umxiuvoeo7hs";
const city = "seattle";

async function getCityPrices(cityname) {
  function _getQueryURLWithApi(baseURL, queryObject) {
    function _makeQueryURL(baseURL = baseURL, queryObject) {
      // join the query into the string
      const query = Object.keys(queryObject)
        .map((k) => `${escape(k)}=${escape(queryObject[k])}`)
        .join("&");

      return `${baseURL}?${query}`;
    }
    queryObject.api_key = "12umxiuvoeo7hs";

    const requestURL = _makeQueryURL(baseURL, queryObject);

    return requestURL;
  }

  async function _getPricesJSON(requestURL) {
    const responseJSON = await fetch(requestURL)
      .then(_status)
      .then(_json)
      .catch((error) => {
        return null;
      });

    return responseJSON;
  }

  function _getPricesMap(responseJSON) {
    if ("error" in responseJSON) return null;

    const map = new Map();
    const cityFullName = responseJSON.name;
    const currency = responseJSON.currency;
    const pricesArray = responseJSON.prices;
    const priceMap = new Map();

    if (pricesArray !== undefined) {
      pricesArray.forEach((element) => {
        const id = element.item_id;
        const name = element.item_name;
        const averagePrice = element.average_price;
        const lowestPrice = element.lowest_price;
        const highestPrice = element.highest_price;

        priceMap.set(id, {
          name: name,
          averagePrice: averagePrice,
          lowestPrice: lowestPrice,
          highestPrice: highestPrice,
        });
      });
    }

    map.set("cityName", cityFullName);
    map.set("currency", currency);
    map.set("priceMap", priceMap);

    return map;
  }

  function _status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }

  function _json(response) {
    return response.json();
  }

  const requestURL = _getQueryURLWithApi(baseURL, {
    query: cityname,
    currency: "usd",
  });
  const responseJSON = await _getPricesJSON(requestURL);
  const responseMap = _getPricesMap(responseJSON);

  return responseMap;
}

async function findCommonKeys(city1, city2) {
  function _findCommonKeysHelper(keys1, keys2) {
    const commonKeyArray = [];
    let i = 0;
    let j = 0;
    while (i < keys1.length && j < keys2.length) {
      if (keys1[i] === keys2[j]) {
        commonKeyArray.push(keys1[i]);
        ++i;
        ++j;
      } else if (keys1[i] < keys2[j]) ++i;
      else ++j;
    }

    return commonKeyArray;
  }

  const cityMap1 = await city1;
  const cityMap2 = await city2;

  // If one of the city is not found
  if (cityMap1 === null || cityMap2 === null) return [];

  // We found both city, now find the common keys
  const keys1 = Array.from(cityMap1.get("priceMap").keys());
  const keys2 = Array.from(cityMap2.get("priceMap").keys());
  const commonKeyArray = _findCommonKeysHelper(keys1, keys2);

  return commonKeyArray;
}

async function searchCities(city1, city2) {
  function drawOnTable() {
    console.log("draw");
  }

  const cityPrice1 = await getCityPrices(city1);
  const cityPrice2 = await getCityPrices(city2);
  const commonCityKey = await findCommonKeys(cityPrice1, cityPrice2);

  console.log(commonCityKey);
  console.log(cityPrice1);

  commonCityKey.forEach((key) => {
    const itemName = cityPrice1.get("priceMap").get(key).name;
    const itemAveragePrice1 = cityPrice1.get("priceMap").get(key).averagePrice;
    const itemAveragePrice2 = cityPrice2.get("priceMap").get(key).averagePrice;
    console.log(`${itemName}: ${itemAveragePrice1} ||| ${itemAveragePrice2}`);
  });

  return {
    cityPrice1: cityPrice1,
    cityPrice2: cityPrice2,
    commonCityKey: commonCityKey,
  };
}

searchCities("seattle", "washington");
