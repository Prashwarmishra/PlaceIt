// DOM elements
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

let backgroundImageData = null;
let selectedProductUrl = null;

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

// Generate button (placeholder for now)
generateBtn.addEventListener('click', () => {
  alert('Image generation will be implemented next!\n\nBackground: ' + (backgroundImageData ? 'Uploaded ✓' : 'None') + '\nProduct: ' + (selectedProductUrl ? 'Selected ✓' : 'None'));
});

