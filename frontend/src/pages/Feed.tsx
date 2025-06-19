import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { API_URL } from '../config';

interface ContentItem {
  _id: string;
  title: string;
  url: string;
  type: 'article' | 'video';
  source: string;
  summary: string;
  thumbnail?: string;
  tags: string[];
  createdAt: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
}

const Feed: React.FC = () => {
  const { token } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos'>('all');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get(`${API_URL}/content/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load feed');
        setLoading(false);
      }
    };

    fetchFeed();
  }, [token]);

  const filteredContent = content.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'articles') return item.type === 'article';
    if (activeTab === 'videos') return item.type === 'video';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Feed</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'articles'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'videos'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {filteredContent.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">
            Your feed is empty. Follow some users to see their shared content here.
          </p>
        </div>
      ) : (
        filteredContent.map((item) => (
          <ContentCard key={item._id} content={item} showUser={true} />
        ))
      )}
    </div>
  );
};

export default Feed;