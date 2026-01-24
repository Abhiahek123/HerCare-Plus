"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 mb-2">
          We are sorry, but something unexpected happened.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Your data is safe. This is just a temporary issue.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="block text-purple-600 font-medium hover:underline"
          >
            Go Back Home
          </a>
        </div>
      </div>
    </div>
  );
}
