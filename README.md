This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stock Portfolio Dashboard

This project includes a stock portfolio dashboard that fetches real-time stock data every 15 seconds. The dashboard supports two data sources:

1. **Yahoo Finance** (default) - Uses the `yahoo-finance2` npm package to fetch stock data
2. **Alpha Vantage** - Uses the Alpha Vantage API to fetch stock data

### Configuration

You can configure the stock widget in the `src/app/config/stocks.js` file:

- Change the default data source
- Modify the list of default stock symbols
- Adjust the refresh interval

### Using Alpha Vantage API

To use the Alpha Vantage API:

1. Sign up for a free API key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Copy `.env.local.example` to `.env.local`
3. Add your API key to the `.env.local` file
4. Update the data source in `src/app/page.js` to use `DATA_SOURCES.ALPHA_VANTAGE`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
