import React from 'react';
import { Link } from 'react-router-dom';

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

interface ContentCardProps {
  content: ContentItem;
  showUser?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, showUser = true }) => {
  const formattedDate = new Date(content.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="content-card">
      <div className="flex items-start">
        {content.thumbnail && (
          <div className="flex-shrink-0 mr-4">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="h-24 w-24 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex items-center">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 mr-2">
              {content.type === 'article' ? '📄 Article' : '🎬 Video'}
            </span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-semibold mt-1">
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 hover:text-primary-900"
            >
              {content.title}
            </a>
          </h3>
          <p className="text-sm text-gray-600 mb-2">From: {content.source}</p>
          <p className="text-gray-700">{content.summary}</p>
          {content.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {showUser && content.user && (
            <div className="mt-3 flex items-center">
              <Link to={`/profile/${content.user.username}`} className="flex items-center">
                <img
                  src={content.user.profilePicture || `https://ui-avatars.com/api/?name=${content.user.username}&background=0D8ABC&color=fff`}
                  alt={content.user.username}
                  className="h-6 w-6 rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">
                  Shared by <span className="font-medium text-primary-700">{content.user.username}</span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;