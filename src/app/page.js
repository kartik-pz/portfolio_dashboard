import React from 'react';
import ChatWithAgent from './components/ChatWithAgent';
import './App.css';
import StockWidget from "./components/StockWidget";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col md:flex-row gap-0 row-start-2 items-start w-full max-w-7xl">
        
        {/* Stock Widget */}
        <div className="w-full md:w-3/5">
          <h2 className="text-2xl font-bold mb-4">AI Powered Portfolio Dashboard</h2>
          <StockWidget />
        </div>
        
        {/* Chat Component */}
        <div className="App w-full md:w-2/5">
          <header className="App-header">
            <h1>AI Assistant</h1>
          </header>
          <main>
            <ChatWithAgent />
          </main>
          <footer>
            <p>Powered by Dify</p>
          </footer>
        </div>
      </main> 
    </div>
  );
}
