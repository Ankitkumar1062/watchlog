// Content script that runs on each page

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractContent') {
    const contentInfo = extractContentInfo(message.contentType);
    sendResponse(contentInfo);
    return true;
  }
});

// Extract content information from the current page
function extractContentInfo(contentType) {
  // Default content info
  const info = {
    url: window.location.href,
    title: document.title,
    type: contentType || 'article',
    source: window.location.hostname.replace('www.', ''),
  };
  
  // Try to get a better title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    info.title = ogTitle.content;
  } else {
    // Find the most prominent heading
    const h1 = document.querySelector('h1');
    if (h1) info.title = h1.textContent.trim();
  }
  
  // Try to get thumbnail
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) {
    info.thumbnail = ogImage.content;
  } else if (contentType === 'video') {
    // For YouTube
    const ytImg = document.querySelector('.ytp-cued-thumbnail-overlay-image');
    if (ytImg && ytImg.style.backgroundImage) {
      info.thumbnail = ytImg.style.backgroundImage.slice(5, -2);
    }
  }
  
  // Extract content for summarization
  let content = '';
  
  if (contentType === 'article' || !contentType) {
    // Get article content
    const article = document.querySelector('article') || 
                   document.querySelector('div.post, div.article') || 
                   document.querySelector('main') || 
                   document.body;
    
    // Get all paragraphs
    const paragraphs = article.querySelectorAll('p');
    content = Array.from(paragraphs)
      .map(p => p.textContent.trim())
      .filter(text => text.length > 30) // Filter out short paragraphs
      .join('\n\n');
      
  } else if (contentType === 'video') {
    // For YouTube
    if (window.location.hostname.includes('youtube.com')) {
      info.title = document.querySelector('.title .ytd-video-primary-info-renderer')?.textContent.trim() || info.title;
      info.source = document.querySelector('.ytd-channel-name a')?.textContent.trim() || info.source;
      
      // Try to get description
      const description = document.querySelector('#description-text');
      if (description) {
        content = description.textContent.trim();
      }
    }
  }
  
  info.textContent = content.slice(0, 5000); // Limit content length
  
  return info;
}

// Listen for page visibility changes to detect when user has finished reading
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') {
    // User is leaving the page, check if we should analyze
    chrome.storage.local.get(['settings', 'user'], function(data) {
      if (data.settings?.autoAnalyze && data.user) {
        // Send message to background script to consider analyzing this page
        chrome.runtime.sendMessage({ 
          action: 'pageRead',
          url: window.location.href,
          title: document.title
        });
      }
    });
  }
});