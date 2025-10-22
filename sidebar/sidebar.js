const uploadBtn = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const fileInfo = document.getElementById('fileInfo');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const loadingImages = document.getElementById('loadingImages');
const productImagesGrid = document.getElementById('productImagesGrid');
const noImagesFound = document.getElementById('noImagesFound');
const selectedProductImage = document.getElementById('selectedProductImage');
const generateBtn = document.getElementById('generateBtn');

const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const apiKeyWarning = document.getElementById('apiKeyWarning');
const openSettingsFromWarning = document.getElementById('openSettingsFromWarning');

const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveApiKey = document.getElementById('saveApiKey');
const clearApiKey = document.getElementById('clearApiKey');
const apiKeyStatus = document.getElementById('apiKeyStatus');

const apiKeyModal = document.getElementById('apiKeyModal');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');

let backgroundImageData = null;
let selectedProductUrl = null;
let geminiApiKey = null;

// Event Listeners
uploadBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file) {
    handleImageUpload(file);
  }
});

// Handle image upload and preview
function handleImageUpload(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    return;
  }

  // Update file info
  const fileSizeKB = (file.size / 1024).toFixed(2);
  fileInfo.textContent = `${file.name} (${fileSizeKB} KB)`;

  // Create FileReader to read the image
  const reader = new FileReader();
  
  reader.onload = (e) => {
    backgroundImageData = e.target.result;
    
    // Display preview
    previewImage.src = backgroundImageData;
    previewSection.style.display = 'block';
    
    // Move to step 2: scrape product images
    setTimeout(() => {
      scrapeProductImages();
    }, 500);
  };
  
  reader.readAsDataURL(file);
}

// Scrape product images from the current page
async function scrapeProductImages() {
  step2.style.display = 'block';
  loadingImages.style.display = 'block';
  productImagesGrid.innerHTML = '';
  noImagesFound.style.display = 'none';
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to scrape images
    chrome.tabs.sendMessage(tab.id, { action: 'scrapeImages' }, (response) => {
      loadingImages.style.display = 'none';
      
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        noImagesFound.style.display = 'block';
        return;
      }
      
      if (response && response.images && response.images.length > 0) {
        displayProductImages(response.images);
      } else {
        noImagesFound.style.display = 'block';
      }
    });
  } catch (error) {
    console.error('Error scraping images:', error);
    loadingImages.style.display = 'none';
    noImagesFound.style.display = 'block';
  }
}

// Display scraped product images
function displayProductImages(images) {
  productImagesGrid.innerHTML = '';
  
  images.forEach((image, index) => {
    const imageCard = document.createElement('div');
    imageCard.className = 'product-image-card';
    
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.alt || `Product image ${index + 1}`;
    
    imageCard.appendChild(img);
    
    // Click handler to select this image
    imageCard.addEventListener('click', () => {
      // Remove previous selection
      document.querySelectorAll('.product-image-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Mark this as selected
      imageCard.classList.add('selected');
      selectedProductUrl = image.url;
      
      // Move to step 3
      showStep3(image.url);
    });
    
    productImagesGrid.appendChild(imageCard);
  });
}

// Show step 3 with selected product
function showStep3(imageUrl) {
  step3.style.display = 'block';
  selectedProductImage.src = imageUrl;
  
  // Scroll to step 3
  step3.scrollIntoView({ behavior: 'smooth' });
}

// Generate button
generateBtn.addEventListener('click', () => {
  if (!geminiApiKey) {
    promptForApiKey();
    return;
  }
  alert('Image generation will be implemented next!\n\nBackground: ' + (backgroundImageData ? 'Uploaded ✓' : 'None') + '\nProduct: ' + (selectedProductUrl ? 'Selected ✓' : 'None') + '\nAPI Key: Set ✓');
});

// ============================================
// SETTINGS & NAVIGATION
// ============================================

async function checkApiKey() {
  try {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    if (result.geminiApiKey) {
      geminiApiKey = result.geminiApiKey;
      hideApiKeyWarning();
      return true;
    } else {
      showApiKeyWarning();
      return false;
    }
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
}

function showApiKeyWarning() {
  apiKeyWarning.style.display = 'flex';
}

function hideApiKeyWarning() {
  apiKeyWarning.style.display = 'none';
}

function promptForApiKey() {
  showApiKeyWarning();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showApiKeyModal();
}

function showApiKeyModal() {
  apiKeyModal.style.display = 'flex';
}

function hideApiKeyModal() {
  apiKeyModal.style.display = 'none';
}

modalConfirmBtn.addEventListener('click', () => {
  hideApiKeyModal();
  showSettings();
  setTimeout(() => {
    apiKeyInput.focus();
  }, 100);
});

modalCancelBtn.addEventListener('click', () => {
  hideApiKeyModal();
});

apiKeyModal.addEventListener('click', (e) => {
  if (e.target === apiKeyModal) {
    hideApiKeyModal();
  }
});

function showSettings() {
  mainView.style.display = 'none';
  settingsView.style.display = 'block';
  loadApiKeyToInput();
}

function showMainView() {
  settingsView.style.display = 'none';
  mainView.style.display = 'block';
  checkApiKey();
}

settingsBtn.addEventListener('click', showSettings);
backBtn.addEventListener('click', showMainView);
openSettingsFromWarning.addEventListener('click', showSettings);

async function loadApiKeyToInput() {
  try {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    if (result.geminiApiKey) {
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
      clearApiKey.style.display = 'block';
      saveApiKey.textContent = 'Update API Key';
    } else {
      apiKeyInput.value = '';
      apiKeyInput.placeholder = 'Enter your Gemini API key';
      clearApiKey.style.display = 'none';
      saveApiKey.textContent = 'Save API Key';
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

saveApiKey.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  
  if (!key) {
    showStatusMessage('Please enter an API key', 'error');
    return;
  }
  
  if (!key.startsWith('AIza')) {
    showStatusMessage('Invalid API key format. Gemini API keys typically start with "AIza"', 'error');
    return;
  }
  
  const originalText = saveApiKey.textContent;
  saveApiKey.disabled = true;
  saveApiKey.textContent = 'Saving...';
  
  try {
    await chrome.storage.local.set({ geminiApiKey: key });
    geminiApiKey = key;
    
    saveApiKey.textContent = '✓ Saved!';
    showStatusMessage('API key saved successfully! Returning to main view...', 'success');
    
    apiKeyInput.value = '';
    
    hideApiKeyWarning();
    
    setTimeout(() => {
      saveApiKey.disabled = false;
      saveApiKey.textContent = originalText;
      showMainView();
    }, 2000);
    
  } catch (error) {
    console.error('Error saving API key:', error);
    showStatusMessage('Failed to save API key. Please try again.', 'error');
    saveApiKey.disabled = false;
    saveApiKey.textContent = originalText;
  }
});

clearApiKey.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear your API key?')) {
    return;
  }
  
  try {
    await chrome.storage.local.remove('geminiApiKey');
    geminiApiKey = null;
    apiKeyInput.value = '';
    apiKeyInput.placeholder = 'Enter your Gemini API key';
    clearApiKey.style.display = 'none';
    saveApiKey.textContent = 'Save API Key';
    showStatusMessage('API key cleared', 'success');
    
    showApiKeyWarning();
    
    setTimeout(() => {
      showMainView();
    }, 1000);
    
  } catch (error) {
    console.error('Error clearing API key:', error);
    showStatusMessage('Failed to clear API key. Please try again.', 'error');
  }
});

toggleKeyVisibility.addEventListener('click', () => {
  const input = apiKeyInput;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  
  const eyeIcon = document.getElementById('eyeIcon');
  if (isPassword) {
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
});

function showStatusMessage(message, type) {
  apiKeyStatus.textContent = message;
  apiKeyStatus.className = `status-message ${type}`;
  apiKeyStatus.style.display = 'block';
  
  setTimeout(() => {
    apiKeyStatus.style.display = 'none';
  }, 5000);
}

checkApiKey();

