import React from 'react';
import { Link } from 'react-router-dom';

const ExtensionInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ReadWatch Browser Extension</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <p className="text-gray-700 mb-4">
          The ReadWatch browser extension runs in the background while you browse the web, using a local AI model to identify and summarize valuable content you consume.
        </p>
        <p className="text-gray-700 mb-4">
          When you read an article or watch a video, the extension automatically:
        </p>
        <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
          <li>Detects when you're consuming educational or informative content</li>
          <li>Processes the content using a local LLM (Gemma-3-1b) that runs directly in your browser</li>
          <li>Creates a concise summary of what you've read or watched</li>
          <li>Adds the content to your ReadWatch profile (if you choose to share it)</li>
        </ol>
        <p className="text-gray-700">
          All processing happens on your device - your data never leaves your computer!
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Privacy-First Design</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">🔒 Local Processing</h3>
            <p className="text-gray-700">
              All content analysis happens on your device using WebLLM technology, ensuring your browsing data stays private.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">👁️ You Control What's Shared</h3>
            <p className="text-gray-700">
              Before anything is added to your profile, you can review and approve it. Make items private or skip them entirely.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">🧠 Lightweight AI</h3>
            <p className="text-gray-700">
              We use Gemma-3-1b, a 1GB model that runs efficiently on standard computers without requiring a GPU.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">🚫 No Tracking</h3>
            <p className="text-gray-700">
              We don't track your general browsing history or send data to third parties. Only content you approve is saved.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Download & Install</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <img src="/chrome-logo.png" alt="Chrome" className="w-16 h-16 mb-4" onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://cdn.worldvectorlogo.com/logos/chrome-5.svg';
            }} />
            <h3 className="font-medium text-lg mb-2">Chrome Extension</h3>
            <p className="text-gray-700 mb-4">
              Add ReadWatch to Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser.
            </p>
            <a
              href="https://chrome.google.com/webstore/category/extensions"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Download for Chrome
            </a>
          </div>
          <div className="flex flex-col items-center text-center">
            <img src="/firefox-logo.png" alt="Firefox" className="w-16 h-16 mb-4" onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://cdn.worldvectorlogo.com/logos/firefox-3.svg';
            }} />
            <h3 className="font-medium text-lg mb-2">Firefox Extension</h3>
            <p className="text-gray-700 mb-4">
              Add ReadWatch to Mozilla Firefox for the same great experience.
            </p>
            <a
              href="https://addons.mozilla.org/en-US/firefox/extensions/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Download for Firefox
            </a>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">Ready to Start?</h2>
        <p className="text-gray-700 mb-6">
          Install the extension and create an account to begin sharing your intellectual journey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a
            href="https://chrome.google.com/webstore/category/extensions"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Get the Extension
          </a>
          <Link to="/register" className="btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExtensionInfo;