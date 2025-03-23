'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import './StockWidget.css';
import { createStock, calculateStockValues, calculatePortfolioTotals } from '../types/portfolio';

export default function StockWidget() {
  const [stockData, setStockData] = useState([]);
  const [portfolioTotals, setPortfolioTotals] = useState({
    totalInvestment: 0,
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    sectorTotals: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Define stock symbols to fetch
  const symbols = useMemo(() => [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX',
    'JPM', 'BAC', 'GS', 'NEE', 'DUK'
  ], []);

  // Sample portfolio data
  const portfolioData = useMemo(() => [
    { symbol: 'AAPL', purchasePrice: 150.25, quantity: 10, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'MSFT', purchasePrice: 240.50, quantity: 5, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'GOOGL', purchasePrice: 160.00, quantity: 2, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'AMZN', purchasePrice: 198.00, quantity: 3, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'META', purchasePrice: 330.00, quantity: 8, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'TSLA', purchasePrice: 300.00, quantity: 10, exchange: 'NASDAQ', sector: 'Technology' },
    { symbol: 'NFLX', purchasePrice: 550.00, quantity: 6, exchange: 'NASDAQ', sector: 'Technology' },
    //financial sector stocks
    { symbol: 'JPM', purchasePrice: 140.00, quantity: 5, exchange: 'NYSE', sector: 'Financial' },
    { symbol: 'BAC', purchasePrice: 35.50, quantity: 15, exchange: 'NYSE', sector: 'Financial' },
    { symbol: 'GS', purchasePrice: 320.00, quantity: 3, exchange: 'NYSE', sector: 'Financial' },
    //power sector stocks
    { symbol: 'NEE', purchasePrice: 75.00, quantity: 8, exchange: 'NYSE', sector: 'Power' },
    { symbol: 'DUK', purchasePrice: 95.00, quantity: 6, exchange: 'NYSE', sector: 'Power' },
  ], []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const symbolsParam = symbols.join(',');
      
      // Fetch basic stock data from Yahoo Finance
      const response = await fetch(`/api/stocks?symbols=${symbolsParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const data = await response.json();
      
      // Fetch financial data (P/E ratio and earnings) from Finnhub
      const financialResponse = await fetch(`/api/financial?symbols=${symbolsParam}`);
      
      if (!financialResponse.ok) {
        throw new Error('Failed to fetch financial data');
      }
      
      const financialData = await financialResponse.json();
      console.log(financialData);
      // Create stock objects with data from both APIs
      const stocks = portfolioData.map(portfolioItem => {
        // Get price data from Yahoo Finance
        const marketData = data.find(item => item.symbol === portfolioItem.symbol) || {
          price: null
        };
        
        // Get financial data from Finnhub
        const financialInfo = financialData.find(item => item.symbol === portfolioItem.symbol) || {
          peRatio: null,
          latestEarnings: null
        };
        
        return createStock({
          symbol: portfolioItem.symbol,
          name: getStockName(portfolioItem.symbol),
          purchasePrice: portfolioItem.purchasePrice,
          quantity: portfolioItem.quantity,
          exchange: portfolioItem.exchange,
          sector: portfolioItem.sector,
          cmp: marketData.price || 0,
          peRatio: financialInfo.peRatio,
          latestEarnings: financialInfo.latestEarnings,
        });
      });
      
      // Calculate initial values for each stock
      const stocksWithValues = stocks.map(stock => calculateStockValues(stock));
      
      // Calculate total portfolio value for percentage calculations
      const totalValue = stocksWithValues.reduce((sum, stock) => sum + stock.presentValue, 0);
      
      // Recalculate with correct portfolio percentages
      const finalStocks = stocksWithValues.map(stock => calculateStockValues(stock, totalValue));
      
      // Calculate portfolio totals
      const portfolio = calculatePortfolioTotals(finalStocks);
      
      setStockData(portfolio.stocks);
      setPortfolioTotals({
        totalInvestment: portfolio.totalInvestment,
        totalValue: portfolio.totalValue,
        totalGainLoss: portfolio.totalGainLoss,
        totalGainLossPercentage: portfolio.totalGainLossPercentage,
        sectorTotals: portfolio.sectorTotals,
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get stock names
  const getStockName = (symbol) => {
    const stockNames = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com, Inc.',
      'META': 'Meta Platforms, Inc.',
      'TSLA': 'Tesla, Inc.',
      'NFLX': 'Netflix, Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'BAC': 'Bank of America Corp.',
      'GS': 'Goldman Sachs Group Inc.',
      'NEE': 'NextEra Energy, Inc.',
      'DUK': 'Duke Energy Corporation',
    };
    return stockNames[symbol] || symbol;
  };

  useEffect(() => {
    // Initial load
    loadStockData();

    // Set up interval to refresh every 15 seconds
    const intervalId = setInterval(loadStockData, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [symbols]);

  // Define columns for react-table
  const columns = useMemo(() => [
    {
      header: 'Stock Name',
      accessorFn: row => row.name,
      id: 'name',
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.symbol}</div>
        </div>
      ),
    },
    {
      header: 'Purchase Price',
      accessorKey: 'purchasePrice',
      cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
    },
    {
      header: 'Investment',
      accessorKey: 'investment',
      cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
    },
    {
      header: 'Portfolio %',
      accessorKey: 'portfolioPercentage',
      cell: ({ getValue }) => `${getValue().toFixed(2)}%`,
    },
    {
      header: 'NSE/BSE',
      accessorKey: 'exchange',
    },
    {
      header: 'CMP',
      accessorKey: 'cmp',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? `$${value.toFixed(2)}` : 'N/A';
      },
    },
    {
      header: 'Present Value',
      accessorKey: 'presentValue',
      cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
    },
    {
      header: 'Gain/Loss',
      accessorFn: row => row.gainLoss,
      id: 'gainLoss',
      cell: ({ row }) => {
        const gainLoss = row.original.gainLoss;
        const percentage = row.original.gainLossPercentage;
        const className = gainLoss >= 0 ? 'positive-change' : 'negative-change';
        
        return (
          <div className={className}>
            ${Math.abs(gainLoss).toFixed(2)} ({gainLoss >= 0 ? '+' : '-'}{Math.abs(percentage).toFixed(2)}%)
          </div>
        );
      },
    },
    {
      header: 'P/E Ratio',
      accessorKey: 'peRatio',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? value.toFixed(2) : 'N/A';
      },
    },
    {
      header: 'Latest Earnings',
      accessorKey: 'latestEarnings',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? `$${value.toFixed(2)}` : 'N/A';
      },
    },
  ], []);

  // Initialize react-table
  const table = useReactTable({
    data: stockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Group stocks by sector
  const stocksByGroup = useMemo(() => {
    const groups = {};
    if (stockData.length) {
      stockData.forEach(stock => {
        const sector = stock.sector || 'Other';
        if (!groups[sector]) {
          groups[sector] = [];
        }
        groups[sector].push(stock);
      });
    }
    return groups;
  }, [stockData]);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Portfolio Dashboard</h2>
        <div className="text-sm text-gray-500 flex items-center">
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-500">Total Investment</div>
          <div className="text-xl font-bold">${portfolioTotals.totalInvestment.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-500">Current Value</div>
          <div className="text-xl font-bold">${portfolioTotals.totalValue.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-500">Total Gain/Loss</div>
          <div className={`text-xl font-bold ${portfolioTotals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(portfolioTotals.totalGainLoss).toFixed(2)} 
            ({portfolioTotals.totalGainLoss >= 0 ? '+' : '-'}{Math.abs(portfolioTotals.totalGainLossPercentage).toFixed(2)}%)
          </div>
        </div>
      </div>

      {loading && stockData.length === 0 ? (
        <div className="flex justify-center p-4">
          <div className="animate-pulse">Loading stock data...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="portfolio-table min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {table.getFlatHeaders().map((header, index) => (
                  <th key={header.id} className={index === 0 ? "sticky-column" : ""}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(stocksByGroup).map(([sector, sectorStocks]) => {
                const sectorData = portfolioTotals.sectorTotals[sector];
                
                return (
                  <React.Fragment key={sector}>
                    {/* Sector header row */}
                    <tr className="sector-row" data-sector={sector}>
                      <td colSpan="1" className="font-semibold bg-gray-300 sticky-column">
                        {sector} Sector
                      </td>
                      <td className="bg-gray-300 font-semibold">
                        ${sectorData?.totalInvestment.toFixed(2)}
                      </td>
                      <td className="bg-gray-300 font-semibold">
                        {((sectorData?.totalValue / portfolioTotals.totalValue) * 100).toFixed(2)}%
                      </td>
                      <td className="bg-gray-300"></td>
                      <td className="bg-gray-300"></td>
                      <td className="bg-gray-300 font-semibold">
                        ${sectorData?.totalValue.toFixed(2)}
                      </td>
                      <td className={`bg-gray-300 font-semibold ${sectorData?.totalGainLoss >= 0 ? 'positive-change' : 'negative-change'}`}>
                        ${Math.abs(sectorData?.totalGainLoss).toFixed(2)} 
                        ({sectorData?.totalGainLoss >= 0 ? '+' : '-'}{Math.abs(sectorData?.totalGainLossPercentage).toFixed(2)}%)
                      </td>
                      <td className="bg-gray-300"></td>
                      <td className="bg-gray-300"></td>
                      <td className="bg-gray-300"></td>
                      <td className="bg-gray-300"></td>
                    </tr>
                    
                    {/* Stock rows for this sector */}
                    {sectorStocks.map((stock) => {
                      const row = table.getRowModel().rows.find(r => r.original.symbol === stock.symbol);
                      if (!row) return null;
                      
                      return (
                        <tr key={stock.symbol} className="stock-row">
                          {row.getVisibleCells().map((cell, index) => (
                            <td key={cell.id} className={index === 0 ? "sticky-column" : ""}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              
              {/* Portfolio total row */}
              <tr className="portfolio-total">
                <td colSpan="1" className="font-bold bg-gray-300 sticky-column">
                  Portfolio Total
                </td>
                <td className="font-bold bg-gray-300">
                  ${portfolioTotals.totalInvestment.toFixed(2)}
                </td>
                <td className="font-bold bg-gray-300">
                  100.00%
                </td>
                <td className="bg-gray-300"></td>
                <td className="bg-gray-300"></td>
                <td className="font-bold bg-gray-300">
                  ${portfolioTotals.totalValue.toFixed(2)}
                </td>
                <td className={`font-bold bg-gray-300 ${portfolioTotals.totalGainLoss >= 0 ? 'positive-change' : 'negative-change'}`}>
                  ${Math.abs(portfolioTotals.totalGainLoss).toFixed(2)} 
                  ({portfolioTotals.totalGainLoss >= 0 ? '+' : '-'}{Math.abs(portfolioTotals.totalGainLossPercentage).toFixed(2)}%)
                </td>
                <td className="bg-gray-300"></td>
                <td className="bg-gray-300"></td>
                <td className="bg-gray-300"></td>
                <td className="bg-gray-300"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 