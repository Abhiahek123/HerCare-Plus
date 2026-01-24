export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-6">
      <div className="text-center">
        <div className="text-8xl mb-4">🌸</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          We could not find what you were looking for.
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}
