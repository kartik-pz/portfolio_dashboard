import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['yahooSurvey']);

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 60 * 5;

// Function to fetch stock data
const fetchStockData = async (symbols) => {
  try {
    // Use a single batch request for all symbols with a timeout
    const quotesResult = await yahooFinance.quote(symbols, {
      fields: ['regularMarketPrice', 'symbol'], // Request only the fields we need
      timeout: 5000 // Increase timeout to 5 seconds
    });
    
    // Format the results
    return quotesResult.map(quote => ({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
    }));
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    // Yahoo Finance might return partial results for batch requests
    if (error.result) {
      // Some symbols might have succeeded
      const validResults = Array.isArray(error.result) ? error.result : [error.result];
      
      return validResults.map(item => ({
        symbol: item.symbol,
        price: item.regularMarketPrice || null,
      }));
    }
    
    // Check for network-related errors
    if (error.cause && (
      error.cause.code === 'ETIMEDOUT' || 
      error.cause.code === 'ECONNRESET' ||
      error.cause.code === 'ENOTFOUND' ||
      error.cause.code === 'ECONNREFUSED'
    )) {
      console.log(`Network error: ${error.cause.code}`);
    }
    
    throw error; // Re-throw the error for handling in the main route
  }
};

// Create a cached version of the fetch function
const getCachedStockData = unstable_cache(
  async (symbolsKey) => {
    const symbols = symbolsKey.split(',');
    return await fetchStockData(symbols);
  },
  ['stock-prices'],
  { revalidate: CACHE_DURATION }
);

export async function GET(request) {
  // Get symbols from query parameters or use defaults
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  const symbols = symbolsParam ? symbolsParam.split(',') : [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX',
    'JPM', 'BAC', 'GS', 'NEE', 'DUK'
  ];

  try {
    // Try to get fresh data
    const results = await fetchStockData(symbols);
    
    try {
      
      const updateCache = unstable_cache(
        async (_, __, resultData) => resultData,
        ['stock-prices'],
        { revalidate: CACHE_DURATION }
      );
      
      // Call it with our already fetched results
      updateCache(symbols.join(','), null, results).catch(err => {
        console.error('Failed to update stock data cache, continuing anyway:', err.message);
      });
    } catch (cacheErr) {
      console.error('Failed to initiate cache update, continuing anyway:', cacheErr.message);
    }
    
    // Return successful response
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in stock API route:', error.message);
    
    if (error.cause) {
      console.error('Error cause:', error.cause.code || error.cause);
    }
    
    try {
      // Attempt to retrieve cached data
      console.log('API request failed, trying to retrieve cached data');
      const cachedData = await getCachedStockData(symbols.join(','));
      
      if (cachedData && cachedData.length > 0) {
        console.log('Using cached stock data');
        return NextResponse.json(cachedData, { 
          headers: { 'X-Data-Source': 'cache' }
        });
      }
    } catch (cacheError) {
      console.error('Error retrieving cached data:', cacheError.message);
    }
    
    // For timeout or connection errors where cache also failed, return a fallback response
    if (error.cause && (error.cause.code === 'ETIMEDOUT' || error.cause.code === 'ECONNRESET')) {
      console.log('API request timed out or connection reset, returning fallback data');
    }
    
    // If we have the requested symbols, create a fallback response with null prices
    return NextResponse.json(
      symbols.map(symbol => ({
        symbol,
        price: null
      })),
      { status: 503 } // Service Unavailable - better for temporary issues
    );
  }
} 