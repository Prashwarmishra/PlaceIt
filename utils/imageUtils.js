/**
 * Fetch an image and convert it to base64
 * Uses chrome.runtime to bypass CORS restrictions
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    // Try direct fetch first
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Full data URL
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

/**
 * Extract base64 data from a data URL
 */
function extractBase64(dataUrl) {
  if (!dataUrl) return null;
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
}

/**
 * Get MIME type from data URL
 */
function getMimeType(dataUrl) {
  if (!dataUrl) return 'image/jpeg';
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Compress image if it's too large for API
 */
async function compressImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions if image is too large
      const maxDimension = 1024;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.9;
      let result = canvas.toDataURL('image/jpeg', quality);
      
      resolve(result);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

