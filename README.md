# AI Powered Stock Portfolio Dashboard

A modern Next.js application that combines a real-time stock portfolio dashboard with an AI assistant to help you monitor and analyze your investments.

![Stock Portfolio Dashboard](https://example.com/screenshot.png)

## Features

- **Real-time Stock Data**: Fetches and displays stock data with automatic 15-second refresh
- **Portfolio Performance Metrics**: Shows investment values, current values, gain/loss amounts and percentages
- **Sector-based Analysis**: Groups stocks by sector for better portfolio analysis
- **Financial Metrics**: Displays P/E ratios and latest earnings data
- **AI Assistant**: Built-in chat interface for portfolio insights and analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Data Sources**: Uses Yahoo Finance for price data and Finnhub for financial metrics

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Finnhub API key (free tier available at [finnhub.io](https://finnhub.io))

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stock-portfolio-dashboard.git
   cd stock-portfolio-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` and add your Finnhub API key:
   ```
   FINNHUB_API_KEY=your_finnhub_api_key_here
   ```

## Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/app/components/StockWidget.jsx`: Main stock dashboard component
- `/src/app/api/stocks/route.js`: API route for fetching Yahoo Finance stock data
- `/src/app/api/financial/route.js`: API route for fetching Finnhub financial data
- `/src/app/types/portfolio.js`: Types and utility functions for portfolio calculations

## Customizing Your Portfolio

You can customize the portfolio by editing the `portfolioData` array in `src/app/components/StockWidget.jsx`. For each stock, you can specify:

```javascript
{ 
  symbol: 'AAPL', 
  purchasePrice: 150.25, 
  quantity: 10, 
  exchange: 'NASDAQ', 
  sector: 'Technology' 
}
```

## Data Sources

### Yahoo Finance

The application uses the `yahoo-finance2` npm package to fetch real-time stock prices. No API key is required for this data source.

### Finnhub

Financial metrics like P/E ratios and earnings data are fetched from Finnhub. You'll need to:

1. Sign up for a free API key at [finnhub.io](https://finnhub.io)
2. Add your API key to the `.env.local` file

## Caching

The application includes built-in caching mechanisms to:
- Reduce API calls to external services
- Provide fallback data during API outages
- Optimize performance

## Performance Considerations

- Stock data is automatically refreshed every 15 seconds
- Financial data (P/E ratios, earnings) is cached for longer periods
- The application uses Next.js server components for optimal performance

## Troubleshooting

If you encounter issues with the API:

1. Check your Finnhub API key is correct in `.env.local`
2. Ensure you have a stable internet connection
3. Check the Finnhub API status at [status.finnhub.io](https://status.finnhub.io)
4. Check the browser console for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
