const predictions = require('./predictions');

const isEmpty = function (arr) {
  const filtered = arr.filter(value => value !== null && value !== '' && !isNaN(value))
  return filtered.length == 0
}

const calculateOutput = function (data, first_buy, previous_pattern) {
  console.log(data);
  if (isEmpty(data)) {
    console.log('empty data.')
    return;
  }
  let output_possibilities = "";
  let predictor = new predictions.Predictor(data, first_buy, previous_pattern);
  let analyzed_possibilities = predictor.analyze_possibilities();
  return analyzed_possibilities;
}

const generatePermalink = function (buy_price, sell_prices, first_buy, previous_pattern) {
  let searchParams = new URLSearchParams();
  let pricesParam = buy_price ? buy_price.toString() : '';

  if (!isEmpty(sell_prices)) {
    const filtered = sell_prices.map(price => isNaN(price) ? '' : price).join('.');
    pricesParam = pricesParam.concat('.', filtered);
  }

  if (pricesParam) {
    searchParams.append('prices', pricesParam);
  }

  if (first_buy) {
    searchParams.append('first', true);
  }

  if (previous_pattern !== -1) {
    searchParams.append('pattern', previous_pattern);
  }

  return 'https://turnipprophet.io/?'+searchParams.toString();
}

module.exports = { calculateOutput, generatePermalink };