import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-sky-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pine-700 to-pine-800 text-white">
  <div className="site-container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Adventure Awaits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Rent motorcycles, UTVs, and join guided tours for unforgettable experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

              <Link href="/listings" className="btn-primary">
                Explore Rentals
              </Link>
              <Link href="/listings?type=guided_tour" className="btn-secondary">
                Guided Tours
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sky-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-sky-50">
  <div className="site-container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-pine-700 mb-12">
            Choose Your Adventure
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">🏍️</span>
              </div>
              <h3 className="text-2xl font-semibold text-pine-700 mb-2">Motorcycles</h3>
              <p className="text-rock-600 mb-4">
                High-performance motorcycles for the ultimate road adventure
              </p>
              <Link href="/listings?type=motorcycle" className="text-orange-500 hover:text-orange-600 font-medium">
                Browse Motorcycles →
              </Link>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">🚛</span>
              </div>
              <h3 className="text-2xl font-semibold text-pine-700 mb-2">UTVs</h3>
              <p className="text-rock-600 mb-4">
                Off-road utility vehicles perfect for exploring rugged terrain
              </p>
              <Link href="/listings?type=utv" className="text-orange-500 hover:text-orange-600 font-medium">
                Browse UTVs →
              </Link>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">🗺️</span>
              </div>
              <h3 className="text-2xl font-semibold text-pine-700 mb-2">Guided Tours</h3>
              <p className="text-rock-600 mb-4">
                Expert-led tours to discover the best routes and hidden gems
              </p>
              <Link href="/listings?type=guided_tour" className="text-orange-500 hover:text-orange-600 font-medium">
                View Tours →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sand-700 to-sand-400">
  <div className="site-container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-pine-700 mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-pine-700 mb-8">
            Join thousands of adventurers who trust us for their next journey
          </p>
          <Link href="/auth/signup" className="btn-primary inline-flex items-center justify-center">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}