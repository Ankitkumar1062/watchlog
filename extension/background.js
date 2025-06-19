// Background script for the ReadWatch extension

// Global state
let isModelReady = false;
const pendingAnalysis = new Set();

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('ReadWatch extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pageRead') {
    // Add page to pending analysis
    pendingAnalysis.add(message.url);
    
    // Check if we should analyze now or wait
    checkPendingAnalysis();
  }
  
  return false; // Don't keep the message channel open
});

// Check tabs when updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // New page loaded, check if it's worth analyzing later
    detectContentType(tabId, tab.url);
  }
});

// Detect content type (article or video)
async function detectContentType(tabId, url) {
  // Skip extension pages, settings pages, etc.
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  
  try {
    // Check if user is logged in
    const data = await chrome.storage.local.get(['token', 'settings']);
    if (!data.token || data.settings?.autoAnalyze === false) {
      return; // Skip if not logged in or auto-analyze is off
    }
    
    // Execute content script to check page type
    const [isArticle] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Check for article indicators
        const hasArticleTag = document.querySelector('article') !== null;
        const hasArticlePattern = document.querySelector('div.post, div.article, div.blog-post') !== null;
        const ogType = document.querySelector('meta[property="og:type"]');
        const isOgArticle = ogType && ogType.content.includes('article');
        const paragraphs = document.querySelectorAll('p');
        const hasManyParagraphs = paragraphs.length > 5;
        
        return hasArticleTag || hasArticlePattern || isOgArticle || hasManyParagraphs;
      }
    });
    
    const [isVideo] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Check for video indicators
        const hasVideoElement = document.querySelector('video') !== null;
        const isYouTube = window.location.hostname.includes('youtube.com') && window.location.pathname.includes('watch');
        const isVimeo = window.location.hostname.includes('vimeo.com');
        const isTwitch = window.location.hostname.includes('twitch.tv');
        const ogType = document.querySelector('meta[property="og:type"]');
        const isOgVideo = ogType && ogType.content.includes('video');
        
        return hasVideoElement || isYouTube || isVimeo || isTwitch || isOgVideo;
      }
    });
    
    // If it's interesting content, mark for potential analysis
    if (isArticle.result || isVideo.result) {
      // Show a badge on the extension icon
      chrome.action.setBadgeText({ text: '📌', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#0ea5e9', tabId });
    }
    
  } catch (error) {
    console.error('Error detecting content type:', error);
  }
}

// Check pending analysis queue
async function checkPendingAnalysis() {
  // Only process if there are items and the model is ready
  if (pendingAnalysis.size === 0 || !isModelReady) {
    return;
  }
  
  try {
    // Get user and settings
    const data = await chrome.storage.local.get(['token', 'user', 'settings']);
    if (!data.token || !data.user) {
      return; // User not logged in
    }
    
    // Get the first URL from the set
    const url = Array.from(pendingAnalysis)[0];
    pendingAnalysis.delete(url);
    
    // Find the tab with this URL
    const tabs = await chrome.tabs.query({ url });
    if (tabs.length === 0) {
      return; // Tab not found
    }
    
    const tab = tabs[0];
    
    // Extract content information
    chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, async (contentInfo) => {
      if (!contentInfo || chrome.runtime.lastError) {
        return; // Error or no content
      }
      
      // We would normally process with local WebLLM here,
      // but that's handled by the popup for user confirmation
      
      // Show notification to user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'ReadWatch',
        message: `We found interesting content: "${contentInfo.title}". Open extension to review.`,
        priority: 2
      });
    });
    
  } catch (error) {
    console.error('Error processing pending analysis:', error);
  }
}

// Set model status
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'modelStatus') {
    isModelReady = message.ready;
    
    // If model is ready, check pending analysis
    if (isModelReady) {
      checkPendingAnalysis();
    }
  }
  
  return false;
});

// Listen for alarm to check for new content
chrome.alarms.create('checkPendingContent', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPendingContent') {
    checkPendingAnalysis();
  }
});