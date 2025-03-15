export default function AboutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">About Our Application</h1>
        
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Our App</h2>
            <p className="text-gray-600">
              This is a modern web application built with Next.js 13+, demonstrating the power of React Server Components
              and Client Components. We showcase various features including interactive counters and dynamic content.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Server-Side Rendering for optimal performance</li>
              <li>Client-Side Interactivity with React hooks</li>
              <li>Modern UI with Tailwind CSS</li>
              <li>Responsive design for all devices</li>
              <li>Component-based architecture</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <ul className="list-disc list-inside">
                  <li>Next.js 13+</li>
                  <li>React</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside">
                  <li>Server Components</li>
                  <li>Client Components</li>
                  <li>App Router</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 