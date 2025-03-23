export default function AboutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">About Our Application</h1>
        
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI Powered Portfolio Dashboard</h2>
            <p className="text-gray-600">
              This application combines an interactive stock portfolio dashboard with an AI assistant to help you
              monitor and analyze your investments. The dashboard displays real-time stock data, updates automatically
              every 15 seconds, and provides valuable financial metrics for your portfolio.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Key Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Real-time stock data refreshed every 15 seconds</li>
              <li>Portfolio performance metrics (gain/loss, percentages)</li>
              <li>Sector-based portfolio grouping and analysis</li>
              <li>Financial metrics including P/E ratios and earnings data</li>
              <li>AI assistant for portfolio insights and analysis</li>
              <li>Responsive dashboard design for all devices</li>
              <li>Multiple data sources (Yahoo Finance and Finnhub)</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Sources</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Yahoo Finance</h3>
                <p className="text-gray-600">
                  Used for real-time stock price data through the yahoo-finance2 npm package.
                  Provides core stock pricing information automatically.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Finnhub</h3>
                <p className="text-gray-600">
                  Used for financial metrics including P/E ratios and earnings data.
                  Requires a Finnhub API key (free tier available) for enhanced metrics.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <ul className="list-disc list-inside">
                  <li>Next.js 15.2+</li>
                  <li>React 19</li>
                  <li>Tailwind CSS</li>
                  <li>TanStack React Table</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data & APIs</h3>
                <ul className="list-disc list-inside">
                  <li>Yahoo Finance API</li>
                  <li>Finnhub Financial API</li>
                  <li>Vercel Edge Runtime</li>
                  <li>Next.js API Routes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Setup Instructions</h2>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Clone the repository to your local machine</li>
              <li>Install dependencies with <code className="bg-gray-100 px-2 py-1 rounded">npm install</code></li>
              <li>Copy <code className="bg-gray-100 px-2 py-1 rounded">.env.local.example</code> to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
              <li>Get a free Finnhub API key from <a href="https://finnhub.io" className="text-blue-600 hover:underline">finnhub.io</a></li>
              <li>Add your Finnhub API key to the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file</li>
              <li>Start the development server with <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
              <li>Access the app at <a href="http://localhost:3000" className="text-blue-600 hover:underline">http://localhost:3000</a></li>
            </ol>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Customization</h2>
            <p className="text-gray-600 mb-4">
              You can customize the portfolio by editing the <code className="bg-gray-100 px-2 py-1 rounded">portfolioData</code> array
              in <code className="bg-gray-100 px-2 py-1 rounded">src/app/components/StockWidget.jsx</code>. Add your own stocks,
              purchase prices, quantities, and sector information.
            </p>
            <p className="text-gray-600">
              The dashboard updates automatically every 15 seconds, but you can adjust this interval in the
              useEffect hook in the same file.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 