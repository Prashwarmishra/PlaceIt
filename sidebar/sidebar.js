const uploadBtn = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const fileInfo = document.getElementById('fileInfo');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

const loadingImages = document.getElementById('loadingImages');
const productImagesGrid = document.getElementById('productImagesGrid');
const noImagesFound = document.getElementById('noImagesFound');
const selectedProductImage = document.getElementById('selectedProductImage');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const btnSpinner = generateBtn.querySelector('.btn-spinner');

const generatedImage = document.getElementById('generatedImage');
const downloadBtn = document.getElementById('downloadBtn');
const generateAgainBtn = document.getElementById('generateAgainBtn');

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
generateBtn.addEventListener('click', async () => {
  if (!geminiApiKey) {
    promptForApiKey();
    return;
  }
  
  if (!backgroundImageData || !selectedProductUrl) {
    alert('Please upload a background image and select a product first.');
    return;
  }
  
  await generateImage();
});

// Generate Again button
generateAgainBtn.addEventListener('click', () => {
  step4.style.display = 'none';
  step1.scrollIntoView({ behavior: 'smooth' });
});

// ============================================
// IMAGE GENERATION WITH GEMINI API
// ============================================

async function generateImage() {
  // Show loading state
  setGeneratingState(true);
  
  try {
    // Fetch product image as base64
    const productImageBase64 = await fetchImageAsBase64(selectedProductUrl);
    
    // Extract base64 data without data URL prefix
    const backgroundBase64 = backgroundImageData.split(',')[1];
    
    // Call Gemini API
    const result = await callGeminiAPI(backgroundBase64, productImageBase64);
    
    // Display the generated image
    if (result && result.image) {
      displayGeneratedImage(result.image);
    } else {
      throw new Error('No image generated from API');
    }
    
  } catch (error) {
    console.error('Error generating image:', error);
    handleGenerationError(error);
  } finally {
    setGeneratingState(false);
  }
}

function setGeneratingState(isGenerating) {
  generateBtn.disabled = isGenerating;
  
  if (isGenerating) {
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
  } else {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 data without data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching product image:', error);
    throw new Error('Failed to fetch product image');
  }
}

async function callGeminiAPI(backgroundBase64, productBase64) {
  // Using Gemini 2.5 Flash for image generation
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiApiKey}`;
  
  const prompt = `You are an expert at product visualization and interior design. 

I'm providing you with two images:
1. BACKGROUND IMAGE: A room or space where we want to visualize a product
2. PRODUCT IMAGE: The furniture or item that needs to be placed in the space

Your task is to create a photorealistic composite image that shows the product naturally integrated into the background space.

Requirements:
- Place the product in a realistic position that makes sense for the space
- Match the lighting conditions of the room (shadows, highlights, ambient light)
- Ensure proper scale and perspective - the product should look natural in size
- Blend the product seamlessly with the environment
- Maintain color harmony and realistic textures
- Add appropriate shadows and reflections
- Make it look like a professional product staging photo

Generate a high-quality, photorealistic image showing the product placed in the room.`;

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: backgroundBase64
          }
        },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: productBase64
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseModalities: ["IMAGE"]
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Extract generated image from response
    // Gemini 2.5 Flash returns image in the response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Look for inlineData with image (camelCase in response)
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            image: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`
          };
        }
      }
      
      // Some responses might have the image in a different format
      if (parts[0] && parts[0].text) {
        // If it returns base64 as text, handle that
        const base64Match = parts[0].text.match(/^[A-Za-z0-9+/=]+$/);
        if (base64Match) {
          return {
            image: `data:image/jpeg;base64,${parts[0].text}`
          };
        }
      }
    }
    
    throw new Error('No image data found in API response. The model may not support image generation yet.');
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

function displayGeneratedImage(imageDataUrl) {
  generatedImage.src = imageDataUrl;
  step4.style.display = 'block';
  step4.scrollIntoView({ behavior: 'smooth' });
  
  // Setup download functionality
  downloadBtn.onclick = () => downloadImage(imageDataUrl);
}

function downloadImage(imageDataUrl) {
  const link = document.createElement('a');
  link.href = imageDataUrl;
  link.download = `inplace-generated-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleGenerationError(error) {
  let errorMessage = 'Failed to generate image. ';
  let errorDetails = '';
  
  if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
    errorMessage += 'Invalid API key.';
    errorDetails = '\n\nPlease check your API key in settings and make sure it\'s valid.';
  } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
    errorMessage += 'API quota exceeded.';
    errorDetails = '\n\nYour API key has reached its usage limit. Please try again later or check your Google Cloud console.';
  } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
    errorMessage += 'Network error.';
    errorDetails = '\n\nPlease check your internet connection and try again.';
  } else if (error.message.includes('model may not support')) {
    errorMessage += 'Model not available.';
    errorDetails = '\n\nGemini 2.5 Flash with image generation may not be available yet in your region, or your API key may not have access to this model.\n\nPlease check Google AI Studio for model availability.';
  } else if (error.message.includes('PERMISSION_DENIED')) {
    errorMessage += 'Permission denied.';
    errorDetails = '\n\nYour API key doesn\'t have permission to use this model. Please check your API key settings in Google Cloud Console.';
  } else if (error.message.includes('NOT_FOUND')) {
    errorMessage += 'Model not found.';
    errorDetails = '\n\nThe Gemini 2.5 Flash model might not be available in your region yet.';
  } else {
    errorMessage += error.message || 'Unknown error occurred.';
    errorDetails = '\n\nPlease try again or contact support if the issue persists.';
  }
  
  // Create a more user-friendly error dialog
  const fullMessage = '❌ ' + errorMessage + errorDetails;
  
  // Log full error for debugging
  console.error('Generation Error:', {
    message: error.message,
    error: error,
    timestamp: new Date().toISOString()
  });
  
  alert(fullMessage);
}

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

