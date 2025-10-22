chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'scrapeImages') {
    const images = scrapeProductImages();
    sendResponse({ images: images });
  }
  return true;
});

function scrapeProductImages() {
  const images = [];
  const seenUrls = new Set();
  const minSize = 250;
  
  const allImages = document.querySelectorAll('img');
  
  allImages.forEach(img => {
    const url = img.src || img.dataset.src || img.dataset.original || img.currentSrc;
    
    if (!url || seenUrls.has(url)) {
      return;
    }
    
    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
    
    if (width >= minSize && height >= minSize) {
      if (isValidProductImage(url, img)) {
        seenUrls.add(url);
        images.push({
          url: url,
          alt: img.alt || '',
          width: width,
          height: height
        });
      }
    }
  });
  
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const style = window.getComputedStyle(element);
    const backgroundImage = style.backgroundImage;
    
    if (backgroundImage && backgroundImage !== 'none') {
      const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1];
        
        if (seenUrls.has(url)) {
          return;
        }
        
        const rect = element.getBoundingClientRect();
        let width = rect.width || 0;
        let height = rect.height || 0;
        
        if (width === 0 || height === 0) {
          width = parseInt(style.width) || 0;
          height = parseInt(style.height) || 0;
        }
        
        const isProductContainer = element.className && (
          element.className.includes('image-grid') ||
          element.className.includes('product-image') ||
          element.className.includes('product-img')
        );
        
        const sizeThreshold = isProductContainer ? 100 : minSize;
        
        if (width >= sizeThreshold && height >= sizeThreshold) {
          if (isValidProductImage(url, element)) {
            seenUrls.add(url);
            images.push({
              url: url,
              alt: element.getAttribute('aria-label') || element.title || '',
              width: width,
              height: height
            });
          }
        }
      }
    }
  });
  
  images.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  return images;
}

function isValidProductImage(url, element) {
  const excludePatterns = [
    'logo',
    'icon',
    'sprite',
    'banner',
    'advertisement',
    'ad-',
    'tracking',
    'pixel',
    '1x1',
    'badge',
    'button',
    'thumbnail'
  ];
  
  const urlLower = url.toLowerCase();
  
  let altText = '';
  if (element.alt) {
    altText = element.alt;
  } else if (element.getAttribute) {
    altText = element.getAttribute('aria-label') || element.title || '';
  }
  const altLower = altText.toLowerCase();
  
  return !excludePatterns.some(pattern => 
    urlLower.includes(pattern) || altLower.includes(pattern)
  );
}

