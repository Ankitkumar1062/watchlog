import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { API_URL } from '../config';

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
}

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

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos'>('all');

  useEffect(() => {
    const fetchUserAndContent = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/users/${username}`);
        setUser(userResponse.data);
        
        // Check if current user is following this user
        if (currentUser && userResponse.data.followers.includes(currentUser.id)) {
          setIsFollowing(true);
        }

        const contentResponse = await axios.get(`${API_URL}/content/user/${userResponse.data._id}`);
        setContent(contentResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchUserAndContent();
  }, [username, currentUser, token]);

  const handleFollow = async () => {
    if (!currentUser || !user) return;
    
    try {
      if (isFollowing) {
        await axios.post(
          `${API_URL}/users/unfollow/${user._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
      } else {
        await axios.post(
          `${API_URL}/users/follow/${user._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
      }
    } catch (err) {
      setError('Failed to update following status');
    }
  };

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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-center">
          <img
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`}
            alt={user.username}
            className="h-24 w-24 rounded-full mb-4 sm:mb-0 sm:mr-6"
          />
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.bio || 'No bio'}</p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                <span className="font-semibold">{content.length}</span> items shared
              </span>
              <span className="text-sm text-gray-500 mr-4">
                <span className="font-semibold">{user.followers.length}</span> followers
              </span>
              <span className="text-sm text-gray-500">
                <span className="font-semibold">{user.following.length}</span> following
              </span>
            </div>
          </div>
          {currentUser && currentUser.id !== user._id && (
            <button
              onClick={handleFollow}
              className={`mt-4 sm:mt-0 ${
                isFollowing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } font-semibold py-2 px-4 rounded-md transition-colors`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

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
          <p className="text-gray-600">No content has been shared by this user yet.</p>
        </div>
      ) : (
        filteredContent.map((item) => (
          <ContentCard key={item._id} content={item} showUser={false} />
        ))
      )}
    </div>
  );
};

export default UserProfile;