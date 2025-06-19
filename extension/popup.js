// Global variables
let currentUser = null;
let currentContent = null;
let modelLoaded = false;
let llmSession = null;

// API URL - replace with your actual backend URL
const API_URL = 'http://localhost:5000/api';

// Constants
const MODEL_URL = 'https://huggingface.co/mlc-ai/mlc-chat-gemma-3-1b-q4f16_1-MLC/resolve/main/';

// DOM Elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const mainSection = document.getElementById('main-section');
const statusSection = document.getElementById('status-section');
const statusMessage = document.getElementById('status-message');

// Initialize extension
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkAuth();
  initializeModel();
  
  if (currentUser) {
    showMainSection();
    await checkCurrentPage();
  } else {
    showLoginSection();
  }
});

// Set up event listeners
function setupEventListeners() {
  // Login/Register toggle
  document.getElementById('register-link').addEventListener('click', () => {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
  });
  
  document.getElementById('login-link').addEventListener('click', () => {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });
  
  // Form submissions
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  
  // Main section actions
  document.getElementById('logout-button').addEventListener('click', handleLogout);
  document.getElementById('save-button').addEventListener('click', saveContent);
  document.getElementById('discard-button').addEventListener('click', discardContent);
  
  // Settings changes
  document.getElementById('auto-analyze').addEventListener('change', saveSettings);
  document.getElementById('default-public').addEventListener('change', saveSettings);
}

// Check if user is authenticated
async function checkAuth() {
  try {
    const token = await chrome.storage.local.get('token');
    if (token.token) {
      const user = await chrome.storage.local.get('user');
      if (user.user) {
        currentUser = user.user;
        updateUserUI();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Initialize WebLLM model
async function initializeModel() {
  try {
    updateModelStatus('loading', 'Model: Loading...');

    // Import WebLLM dynamically
    if (typeof WebLLM === 'undefined') {
      console.error('WebLLM not available');
      updateModelStatus('offline', 'Model: Failed to load');
      return;
    }

    // Initialize WebLLM
    llmSession = new WebLLM.Session();
    await llmSession.loadModel({
      modelUrl: MODEL_URL,
      progressCallback: (progress) => {
        updateModelStatus('loading', `Model: Loading (${Math.round(progress * 100)}%)`);
      }
    });

    modelLoaded = true;
    updateModelStatus('online', 'Model: Ready');
    console.log('Model loaded successfully');
    
    // Check current page if user is logged in
    if (currentUser) {
      checkCurrentPage();
    }
  } catch (error) {
    console.error('Model initialization error:', error);
    updateModelStatus('offline', 'Model: Failed to load');
  }
}

// Update model status indicator
function updateModelStatus(status, text) {
  const indicator = document.getElementById('model-indicator');
  const statusText = document.getElementById('model-status-text');
  
  indicator.className = 'indicator ' + status;
  statusText.textContent = text;
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('login-error');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Save auth data
    await chrome.storage.local.set({ token: data.token, user: data.user });
    
    currentUser = data.user;
    updateUserUI();
    showMainSection();
    checkCurrentPage();
    
  } catch (error) {
    errorElement.textContent = error.message || 'Login failed';
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const errorElement = document.getElementById('register-error');
  
  // Validate passwords match
  if (password !== confirmPassword) {
    errorElement.textContent = 'Passwords do not match';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Save auth data
    await chrome.storage.local.set({ token: data.token, user: data.user });
    
    currentUser = data.user;
    updateUserUI();
    showMainSection();
    checkCurrentPage();
    
  } catch (error) {
    errorElement.textContent = error.message || 'Registration failed';
  }
}

// Handle logout
async function handleLogout() {
  await chrome.storage.local.remove(['token', 'user']);
  currentUser = null;
  showLoginSection();
}

// Save user settings
async function saveSettings() {
  const autoAnalyze = document.getElementById('auto-analyze').checked;
  const defaultPublic = document.getElementById('default-public').checked;
  
  await chrome.storage.local.set({
    settings: {
      autoAnalyze,
      defaultPublic
    }
  });
  
  showStatus('Settings saved', 'success');
}

// Load user settings
async function loadSettings() {
  const data = await chrome.storage.local.get('settings');
  if (data.settings) {
    document.getElementById('auto-analyze').checked = data.settings.autoAnalyze !== false;
    document.getElementById('default-public').checked = data.settings.defaultPublic !== false;
  }
}

// Check current page for analyzable content
async function checkCurrentPage() {
  // Show analyzing state
  document.getElementById('content-details').classList.add('hidden');
  document.getElementById('no-content-message').classList.add('hidden');
  document.getElementById('analyzing-message').classList.remove('hidden');
  document.getElementById('summary-section').classList.add('hidden');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      showNoContentMessage();
      return;
    }
    
    // Check if it's an article or video
    const isArticle = await checkIfArticle(tab);
    const isVideo = await checkIfVideo(tab);
    
    if (!isArticle && !isVideo) {
      showNoContentMessage();
      return;
    }
    
    // Extract content from page
    const contentInfo = await extractContentInfo(tab, isVideo ? 'video' : 'article');
    
    // Generate summary if model is loaded
    if (modelLoaded && llmSession) {
      const summary = await generateSummary(contentInfo);
      contentInfo.summary = summary;
    } else {
      contentInfo.summary = "Summary generation is not available. Please wait for the model to load.";
    }
    
    // Display content info
    currentContent = contentInfo;
    displayContentInfo(contentInfo);
    
  } catch (error) {
    console.error('Error checking current page:', error);
    showNoContentMessage();
  }
}

// Check if current page is an article
async function checkIfArticle(tab) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Check for article tag
        const hasArticleTag = document.querySelector('article') !== null;
        
        // Check for common blog/article patterns
        const hasArticlePattern = 
          document.querySelector('div.post, div.article, div.blog-post') !== null ||
          document.querySelector('[class*="article"], [class*="post"], [class*="blog"]') !== null;
        
        // Check meta tags
        const ogType = document.querySelector('meta[property="og:type"]');
        const isOgArticle = ogType && ogType.content.includes('article');
        
        // Check for long-form content
        const mainContent = document.querySelector('main') || document.body;
        const paragraphs = mainContent.querySelectorAll('p');
        const hasManyParagraphs = paragraphs.length > 5;
        const hasLongText = Array.from(paragraphs).some(p => p.textContent.length > 100);
        
        return hasArticleTag || hasArticlePattern || isOgArticle || (hasManyParagraphs && hasLongText);
      }
    });
    
    return result[0].result;
  } catch (error) {
    console.error('Error checking if article:', error);
    return false;
  }
}

// Check if current page is a video
async function checkIfVideo(tab) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Check for video players
        const hasVideoElement = document.querySelector('video') !== null;
        
        // Check for common video platforms
        const isYouTube = window.location.hostname.includes('youtube.com') && 
                         window.location.pathname.includes('watch');
        const isVimeo = window.location.hostname.includes('vimeo.com');
        const isTwitch = window.location.hostname.includes('twitch.tv');
        
        // Check meta tags
        const ogType = document.querySelector('meta[property="og:type"]');
        const isOgVideo = ogType && ogType.content.includes('video');
        
        return hasVideoElement || isYouTube || isVimeo || isTwitch || isOgVideo;
      }
    });
    
    return result[0].result;
  } catch (error) {
    console.error('Error checking if video:', error);
    return false;
  }
}

// Extract content information from the page
async function extractContentInfo(tab, type) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (contentType) => {
        // Default content info
        const info = {
          url: window.location.href,
          title: document.title,
          type: contentType,
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
        
        if (contentType === 'article') {
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
      },
      args: [type]
    });
    
    return result[0].result;
  } catch (error) {
    console.error('Error extracting content info:', error);
    return {
      url: tab.url,
      title: tab.title,
      type: type,
      source: new URL(tab.url).hostname.replace('www.', ''),
      textContent: ''
    };
  }
}

// Generate summary using WebLLM
async function generateSummary(contentInfo) {
  try {
    if (!modelLoaded || !llmSession) {
      return "Summary generation is not available. Please wait for the model to load.";
    }
    
    const prompt = `
    You are a helpful assistant that summarizes content.
    
    Please summarize the following ${contentInfo.type}:
    Title: ${contentInfo.title}
    Source: ${contentInfo.source}
    
    Content:
    ${contentInfo.textContent || "No content available"}
    
    Provide a concise summary in 2-3 sentences highlighting the main points.
    `;
    
    const result = await llmSession.generate(prompt);
    return result.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return "Failed to generate summary. Please try again later.";
  }
}

// Display content information in the UI
function displayContentInfo(contentInfo) {
  document.getElementById('analyzing-message').classList.add('hidden');
  document.getElementById('no-content-message').classList.add('hidden');
  document.getElementById('content-details').classList.remove('hidden');
  document.getElementById('summary-section').classList.remove('hidden');
  
  document.getElementById('content-title').textContent = contentInfo.title;
  document.getElementById('content-source').textContent = `From: ${contentInfo.source}`;
  
  const typeBadge = document.getElementById('content-type-badge');
  typeBadge.textContent = contentInfo.type === 'article' ? '📄 Article' : '🎬 Video';
  
  document.getElementById('content-summary').textContent = contentInfo.summary;
}

// Show "no content" message
function showNoContentMessage() {
  document.getElementById('analyzing-message').classList.add('hidden');
  document.getElementById('content-details').classList.add('hidden');
  document.getElementById('summary-section').classList.add('hidden');
  document.getElementById('no-content-message').classList.remove('hidden');
}

// Save content to profile
async function saveContent() {
  try {
    if (!currentContent) return;
    
    const token = await chrome.storage.local.get('token');
    if (!token.token) {
      showStatus('Please log in to save content', 'error');
      return;
    }
    
    // Get default visibility setting
    const settings = await chrome.storage.local.get('settings');
    const isPublic = settings.settings?.defaultPublic !== false;
    
    // Prepare content data
    const contentData = {
      url: currentContent.url,
      title: currentContent.title,
      type: currentContent.type,
      source: currentContent.source,
      summary: currentContent.summary,
      thumbnail: currentContent.thumbnail || '',
      tags: [],
      isPublic
    };
    
    // Send to API
    const response = await fetch(`${API_URL}/content`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`
      },
      body: JSON.stringify(contentData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save content');
    }
    
    showStatus('Content saved to your profile', 'success');
    
    // Reset current content after saving
    setTimeout(() => {
      currentContent = null;
      checkCurrentPage();
    }, 2000);
    
  } catch (error) {
    console.error('Error saving content:', error);
    showStatus(error.message || 'Failed to save content', 'error');
  }
}

// Discard current content
function discardContent() {
  currentContent = null;
  showNoContentMessage();
  showStatus('Content discarded', 'success');
}

// Update user information in the UI
function updateUserUI() {
  if (!currentUser) return;
  
  document.getElementById('username').textContent = currentUser.username;
  
  const profilePic = document.getElementById('profile-pic');
  if (currentUser.profilePicture) {
    profilePic.style.backgroundImage = `url('${currentUser.profilePicture}')`;
  } else {
    profilePic.style.backgroundColor = '#0ea5e9';
  }
  
  const viewProfileLink = document.getElementById('view-profile');
  viewProfileLink.href = `http://localhost:3000/profile/${currentUser.username}`;
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusSection.className = '';
  statusSection.classList.add('status-' + type);
  statusSection.classList.remove('hidden');
  
  setTimeout(() => {
    statusSection.classList.add('hidden');
  }, 3000);
}

// Show login section
function showLoginSection() {
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
  mainSection.classList.add('hidden');
}

// Show register section
function showRegisterSection() {
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
}

// Show main section
function showMainSection() {
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  loadSettings();
}