'use client';

import { useState } from 'react';

export default function Counter() {
    console.log("Counter component rendered");
    const [count, setCount] = useState(0);
    return (
        <div className="p-4 bg-green-100 rounded-lg shadow-md">
            <p className="text-xl font-semibold text-green-800 mb-4">Count: {count}</p>
            <div className="flex gap-2">
                <button 
                    onClick={() => setCount(count - 1)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Decrement
                </button>
                <button 
                    onClick={() => setCount(count + 1)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Increment
                </button>
            </div>
        </div>
    );  
}