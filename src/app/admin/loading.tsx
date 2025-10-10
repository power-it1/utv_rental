export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pine-700 to-pine-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
        <p className="text-white text-lg">Loading admin panel...</p>
      </div>
    </div>
  );
}
