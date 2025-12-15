import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SkillSwap</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Trade Skills, Not Money
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with people who have skills you want to learn, 
            and share your own expertise in return. No money needed!
          </p>
          
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700"
            >
              Start Trading Skills
            </Link>
            <Link
              href="/login"
              className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
            >
              Login to Your Account
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3">🤝 Skill Trading</h3>
            <p>Offer your skills and request skills you want to learn from others.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3">💬 Built-in Chat</h3>
            <p>Message other users directly to arrange skill swap sessions.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3">⭐ Rating System</h3>
            <p>Rate your skill swap experiences to build trust in the community.</p>
          </div>
        </div>
      </main>
    </div>
  );
}