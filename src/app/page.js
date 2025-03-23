import Image from "next/image";
import StockWidget from "./components/StockWidget";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-5xl">
        
        {/* Stock Widget */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">AI Powered Portfolio Dashboard</h2>
          <StockWidget />
        </div>
      </main> 
    </div>
  );
}
