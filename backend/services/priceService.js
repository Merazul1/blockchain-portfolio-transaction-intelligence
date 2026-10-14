const axios = require('axios');
const cacheService = require('./cacheService');

// Static fallback prices in case external price feeds are unreachable or rate-limited
const FALLBACK_PRICES = {
  BNB: 585.50,
  ETH: 3420.00,
  BTC: 64500.00,
  BTCB: 64500.00,
  USDT: 1.00,
  USDC: 1.00,
  CAKE: 2.75,
  POL: 0.42,
  MATIC: 0.42,
  WBNB: 585.50,
};

class PriceService {
  async getLivePrices() {
    const cacheKey = 'crypto:live_prices';
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const prices = { ...FALLBACK_PRICES };

    try {
      // Binance public ticker is fast and does not require an API key
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: {
          symbols: JSON.stringify(['BNBUSDT', 'ETHUSDT', 'BTCUSDT', 'CAKEUSDT'])
        },
        timeout: 3500
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          const price = parseFloat(item.price);
          if (item.symbol === 'BNBUSDT') {
            prices.BNB = price;
            prices.WBNB = price;
          } else if (item.symbol === 'ETHUSDT') {
            prices.ETH = price;
          } else if (item.symbol === 'BTCUSDT') {
            prices.BTC = price;
            prices.BTCB = price;
          } else if (item.symbol === 'CAKEUSDT') {
            prices.CAKE = price;
          }
        }
      }
    } catch (err) {
      console.warn('[PriceService] Live price fetch warning:', err.message, '- Using robust cached/fallback prices');
    }

    // Cache for 60 seconds
    await cacheService.set(cacheKey, prices, 60);
    return prices;
  }

  async getPrice(symbol) {
    const sym = (symbol || '').toUpperCase().trim();
    const prices = await this.getLivePrices();
    return prices[sym] || FALLBACK_PRICES[sym] || 1.00;
  }
}

module.exports = new PriceService();
