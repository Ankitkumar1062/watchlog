import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUser({ username, bio, profilePicture });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="form-input h-24 resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isLoading}
            placeholder="Tell others about yourself..."
          />
        </div>
        
        <div className="mb-6">
          <label className="form-label" htmlFor="profilePicture">
            Profile Picture URL
          </label>
          <input
            id="profilePicture"
            type="url"
            className="form-input"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            disabled={isLoading}
            placeholder="https://example.com/your-image.jpg"
          />
          {profilePicture && (
            <div className="mt-2">
              <img
                src={profilePicture}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff`;
                }}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className={`btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;