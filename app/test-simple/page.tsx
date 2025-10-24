'use client';

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Simple Test Page</h1>
        <p className="text-gray-400 mb-8">
          If you can see this, the basic setup is working.
        </p>
        
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Test Card</h2>
            <p className="text-gray-400">This uses only standard Tailwind classes.</p>
          </div>
          
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
