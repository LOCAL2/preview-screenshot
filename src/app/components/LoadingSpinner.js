export default function LoadingSpinner({ message = "Generating screenshot..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Main spinner */}
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
      </div>

      {/* Loading text with animation */}
      <div className="mt-4 text-center">
        <p className="text-lg font-medium text-blue-600 animate-pulse">{message}</p>
        <p className="text-sm text-gray-500 mt-1">Usually takes 3-8 seconds...</p>
        <p className="text-xs text-gray-400 mt-1">Will timeout after 10 seconds if no response</p>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  );
}
