import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Share Your Intellectual Journey
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Automatically track and share what you read and watch online. Let our browser extension do the work while you focus on learning.
        </p>
        
        {!user ? (
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/extension"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
            >
              Learn About the Extension
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 text-3xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">Track What You Read</h2>
          <p className="text-gray-600">
            Our extension automatically identifies meaningful articles and blog posts you read, summarizes them, and adds them to your profile.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 text-3xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold mb-2">Save Your Watched Videos</h2>
          <p className="text-gray-600">
            Educational videos and tutorials you watch are summarized and added to your profile, creating a comprehensive learning history.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 text-3xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold mb-2">AI-Powered Summaries</h2>
          <p className="text-gray-600">
            Our local LLM processes content right in your browser, creating concise summaries without sending your data to external servers.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 text-3xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">Follow Others</h2>
          <p className="text-gray-600">
            Discover what others are learning. Follow friends, colleagues, or thought leaders to see their intellectual journey.
          </p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex flex-col items-center">
            <div className="bg-primary-100 text-primary-800 rounded-full w-10 h-10 flex items-center justify-center mb-2">1</div>
            <p className="text-gray-700">Install the browser extension</p>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="mb-6 md:mb-0 flex flex-col items-center">
            <div className="bg-primary-100 text-primary-800 rounded-full w-10 h-10 flex items-center justify-center mb-2">2</div>
            <p className="text-gray-700">Browse the web as usual</p>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="mb-6 md:mb-0 flex flex-col items-center">
            <div className="bg-primary-100 text-primary-800 rounded-full w-10 h-10 flex items-center justify-center mb-2">3</div>
            <p className="text-gray-700">Our AI identifies valuable content</p>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="flex flex-col items-center">
            <div className="bg-primary-100 text-primary-800 rounded-full w-10 h-10 flex items-center justify-center mb-2">4</div>
            <p className="text-gray-700">Your profile updates automatically</p>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-700 mb-6">
          Join thousands of learners who are already sharing their intellectual journey.
        </p>
        {!user ? (
          <Link
            to="/register"
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
          >
            Create Your Account
          </Link>
        ) : (
          <Link
            to="/extension"
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
          >
            Install the Extension
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;