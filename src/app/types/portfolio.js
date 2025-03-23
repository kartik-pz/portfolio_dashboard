/**
 * Data structure definitions for stock and portfolio
 */

/**
 * Represents a single stock in the portfolio
 * @typedef {Object} Stock
 * @property {string} symbol - Stock ticker symbol
 * @property {string} name - Full company name
 * @property {number} purchasePrice - Price at which the stock was purchased
 * @property {number} quantity - Number of shares owned
 * @property {number} investment - Total amount invested (purchasePrice * quantity)
 * @property {number} portfolioPercentage - Percentage of total portfolio value
 * @property {string} exchange - Stock exchange code (e.g., NSE, BSE, NASDAQ)
 * @property {string} sector - Industry sector (e.g., Technology, Financial, Power)
 * @property {number} cmp - Current market price
 * @property {number} presentValue - Current value of holdings (cmp * quantity)
 * @property {number} gainLoss - Absolute gain/loss (presentValue - investment)
 * @property {number} gainLossPercentage - Percentage gain/loss
 * @property {number|null} peRatio - Price to earnings ratio
 * @property {number|null} latestEarnings - Latest earnings per share
 */

/**
 * Represents the entire portfolio
 * @typedef {Object} Portfolio
 * @property {Stock[]} stocks - Array of stocks in the portfolio
 * @property {number} totalInvestment - Total amount invested across all stocks
 * @property {Object} sectorTotals - Investment totals grouped by sector
 * @property {number} totalValue - Current total value of the portfolio
 * @property {number} totalGainLoss - Absolute gain/loss across the portfolio
 * @property {number} totalGainLossPercentage - Percentage gain/loss of the portfolio
 */

/**
 * Creates a Stock object with default values
 * @param {Object} data - Initial stock data
 * @returns {Stock} - A stock object
 */
export function createStock(data = {}) {
  return {
    symbol: data.symbol || '',
    name: data.name || '',
    purchasePrice: data.purchasePrice || 0,
    quantity: data.quantity || 0,
    investment: data.investment || 0,
    portfolioPercentage: data.portfolioPercentage || 0,
    exchange: data.exchange || '',
    sector: data.sector || '',
    cmp: data.cmp || 0,
    presentValue: data.presentValue || 0,
    gainLoss: data.gainLoss || 0,
    gainLossPercentage: data.gainLossPercentage || 0,
    peRatio: data.peRatio || null,
    latestEarnings: data.latestEarnings || null,
  };
}

/**
 * Creates a Portfolio object with default values
 * @param {Object} data - Initial portfolio data
 * @returns {Portfolio} - A portfolio object
 */
export function createPortfolio(data = {}) {
  return {
    stocks: data.stocks || [],
    totalInvestment: data.totalInvestment || 0,
    totalValue: data.totalValue || 0,
    totalGainLoss: data.totalGainLoss || 0,
    totalGainLossPercentage: data.totalGainLossPercentage || 0,
    sectorTotals: data.sectorTotals || {},
  };
}

/**
 * Calculates derived values for a stock
 * @param {Stock} stock - Stock to calculate values for
 * @param {number} totalPortfolioValue - Total portfolio value for percentage calculation
 * @returns {Stock} - Updated stock with calculated values
 */
export function calculateStockValues(stock, totalPortfolioValue = 0) {
  const investment = stock.purchasePrice * stock.quantity;
  const presentValue = stock.cmp * stock.quantity;
  const gainLoss = presentValue - investment;
  const gainLossPercentage = investment > 0 ? (gainLoss / investment) * 100 : 0;
  const portfolioPercentage = totalPortfolioValue > 0 ? (presentValue / totalPortfolioValue) * 100 : 0;
  
  return {
    ...stock,
    investment,
    presentValue,
    gainLoss,
    gainLossPercentage,
    portfolioPercentage,
  };
}

/**
 * Calculates portfolio totals from an array of stocks
 * @param {Stock[]} stocks - Array of stocks
 * @returns {Portfolio} - Portfolio with calculated totals
 */
export function calculatePortfolioTotals(stocks) {
  const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
  const totalValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
  const totalGainLoss = totalValue - totalInvestment;
  const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
  
  // Recalculate portfolio percentages based on total value
  const updatedStocks = stocks.map(stock => ({
    ...stock,
    portfolioPercentage: totalValue > 0 ? (stock.presentValue / totalValue) * 100 : 0,
  }));
  
  // Calculate sector totals
  const sectorTotals = calculateSectorTotals(updatedStocks);
  
  return {
    stocks: updatedStocks,
    totalInvestment,
    totalValue,
    totalGainLoss,
    totalGainLossPercentage,
    sectorTotals,
  };
}

/**
 * Calculates investment totals grouped by sector
 * @param {Stock[]} stocks - Array of stocks
 * @returns {Object} - Object containing sector-wise totals
 */
export function calculateSectorTotals(stocks) {
  // Group stocks by sector
  const sectors = {};
  
  stocks.forEach(stock => {
    const { sector } = stock;
    if (!sector) return;
    
    if (!sectors[sector]) {
      sectors[sector] = {
        stocks: [],
        totalInvestment: 0,
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
      };
    }
    
    sectors[sector].stocks.push(stock);
    sectors[sector].totalInvestment += stock.investment;
    sectors[sector].totalValue += stock.presentValue;
  });
  
  // Calculate gain/loss for each sector
  Object.keys(sectors).forEach(sector => {
    const sectorData = sectors[sector];
    sectorData.totalGainLoss = sectorData.totalValue - sectorData.totalInvestment;
    sectorData.totalGainLossPercentage = sectorData.totalInvestment > 0 
      ? (sectorData.totalGainLoss / sectorData.totalInvestment) * 100 
      : 0;
  });
  
  return sectors;
} 