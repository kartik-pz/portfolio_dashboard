import { NextResponse } from 'next/server';

// Cache to store results
let cachedResults = null;
let cacheTimestamp = null;

// Separate cache for earnings data that changes quarterly
let earningsCache = {};
let earningsCacheTimestamp = null;

// Cache duration for earnings data (7 days in milliseconds)
const EARNINGS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function GET(request) {
  try {
    // Get symbols from query parameters
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',') : [];
    
    console.log(`[Financial API] Processing request for symbols: ${symbols.join(', ')}`);
    
    if (symbols.length === 0) {
      console.log('[Financial API] Error: No symbols provided');
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }
    
    const API_KEY = process.env.FINNHUB_API_KEY;
    const BASE_URL = 'https://finnhub.io/api/v1';
    
    console.log(`[Financial API] Using API key: ${API_KEY ? '✓ Available' : '✗ Missing'}`);
    
    // Check if earnings cache needs refresh (older than 7 days)
    const isEarningsCacheValid = earningsCacheTimestamp && 
      (Date.now() - earningsCacheTimestamp < EARNINGS_CACHE_DURATION) &&
      Object.keys(earningsCache).length > 0;
    
    if (isEarningsCacheValid) {
      console.log(`[Financial API] Using existing earnings cache (age: ${Math.round((Date.now() - earningsCacheTimestamp) / (1000 * 60 * 60))} hours)`);
    } else {
      console.log(`[Financial API] Earnings cache is empty or expired, will refresh earnings data`);
    }
    
    const results = [];
    let usedCacheForSomeSymbols = false;
    
    // Process all symbols in parallel with Promise.all
    const promiseResults = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          console.log(`[Financial API] Processing symbol: ${symbol}`);
          
          // Fetch basic financials (P/E ratio) - this changes frequently
          const basicFinancialsUrl = `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`;
          console.log(`[Financial API] Fetching basic financials for ${symbol}`);
          const basicFinancialsResponse = fetch(basicFinancialsUrl);
          
          // For earnings, check if we have cached data first
          let earningsPromise;
          if (isEarningsCacheValid && earningsCache[symbol]) {
            console.log(`[Financial API] Using cached earnings data for ${symbol}`);
            // Use cached earnings data
            earningsPromise = Promise.resolve({ 
              json: () => Promise.resolve(earningsCache[symbol]),
              status: 200
            });
          } else {
            // Fetch earnings data (only if cache is invalid or missing for this symbol)
            const earningsUrl = `${BASE_URL}/stock/earnings?symbol=${symbol}&limit=1&token=${API_KEY}`;
            console.log(`[Financial API] Fetching fresh earnings for ${symbol}`);
            earningsPromise = fetch(earningsUrl);
          }
          
          // Wait for both requests to complete for this symbol
          const [basicFinancialsResult, earningsResult] = await Promise.all([
            basicFinancialsResponse,
            earningsPromise
          ]);
          
          // Check for rate limiting or other error responses for basic financials
          if (!basicFinancialsResult.ok) {
            console.log(`[Financial API] Error for basic financials of ${symbol}: ${basicFinancialsResult.status}, using cached data if available`);
            
            // Find cached result for this symbol
            const cachedSymbolResult = cachedResults?.find(item => item.symbol === symbol);
            
            // If we have cached data for this symbol, use it
            if (cachedSymbolResult) {
              usedCacheForSomeSymbols = true;
              return cachedSymbolResult;
            }
            
            throw new Error(`API error for ${symbol}: ${basicFinancialsResult.status}`);
          }
          
          console.log(`[Financial API] Status code for ${symbol} - Basic financials: ${basicFinancialsResult.status}`);
          
          // Also check for errors in earnings results
          if (!earningsResult.ok) {
            console.log(`[Financial API] Error for earnings of ${symbol}: ${earningsResult.status}, using cached data if available`);
            
            // Use cached earnings data if available
            if (earningsCache[symbol]) {
              console.log(`[Financial API] Using cached earnings data for ${symbol} as fallback`);
              // Use cached earnings
              const earnings = earningsCache[symbol];
              const basicFinancials = await basicFinancialsResult.json();
              
              // Extract relevant data
              const peRatio = basicFinancials?.metric?.peTTM || null;
              const latestEarnings = earnings?.[0]?.actual || null;
              
              console.log(`[Financial API] Extracted data for ${symbol} - P/E Ratio: ${peRatio}, Latest Earnings: ${latestEarnings}`);
              
              // Return the result for this symbol
              return {
                symbol,
                peRatio,
                latestEarnings
              };
            } else {
              // No cached earnings data, return what we can with null earnings
              const basicFinancials = await basicFinancialsResult.json();
              return {
                symbol,
                peRatio: basicFinancials?.metric?.peTTM || null,
                latestEarnings: null
              };
            }
          }
          
          // If both responses are good, parse the JSON
          const basicFinancials = await basicFinancialsResult.json();
          const earnings = await earningsResult.json();
          
          // If we fetched fresh earnings data, update the earnings cache
          if (!isEarningsCacheValid || !earningsCache[symbol]) {
            earningsCache[symbol] = earnings;
            earningsCacheTimestamp = Date.now();
          }
          
          // Extract relevant data
          const peRatio = basicFinancials?.metric?.peTTM || null;
          const latestEarnings = earnings?.[0]?.actual || null;
          
          console.log(`[Financial API] Extracted data for ${symbol} - P/E Ratio: ${peRatio}, Latest Earnings: ${latestEarnings}`);
          
          // Return the result for this symbol
          return {
            symbol,
            peRatio,
            latestEarnings
          };
        } catch (error) {
          console.error(`[Financial API] Error fetching data for ${symbol}:`, error);
          
          // Check for timeout error
          if (error.cause?.code === 'ETIMEDOUT' || error.code === 'ETIMEDOUT') {
            console.log(`[Financial API] Network timeout detected for ${symbol}`);
          }
          
          // Try to use cached data as fallback
          const cachedSymbolResult = cachedResults?.find(item => item.symbol === symbol);
          if (cachedSymbolResult) {
            console.log(`[Financial API] Using cached data for ${symbol} as fallback`);
            usedCacheForSomeSymbols = true;
            return cachedSymbolResult;
          }
          
          // Return error result for this symbol if no cache available
          return {
            symbol,
            peRatio: null,
            latestEarnings: null,
            error: error.message || 'Unknown error'
          };
        }
      })
    );
    
    // Add all results to the results array
    results.push(...promiseResults);
    
    console.log(`[Financial API] Final results (${results.length} symbols processed)`);
    
    // Update cache with new results
    cachedResults = results;
    cacheTimestamp = Date.now();
    
    return NextResponse.json(results, {
      headers: {
        'X-Cache-Used': usedCacheForSomeSymbols ? 'partial' : 'none',
        'X-Earnings-Cache': isEarningsCacheValid ? 'used' : 'refreshed'
      }
    });
  } catch (error) {
    console.error('[Financial API] Error in financial API route:', error);
    
    // If we have a cache, return it as a fallback for complete API failure
    if (cachedResults) {
      console.log('[Financial API] Returning cached results due to complete API failure');
      return NextResponse.json(cachedResults, {
        headers: {
          'X-Cache-Used': 'complete-fallback'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch financial data', message: error.message },
      { status: 500 }
    );
  }
} 