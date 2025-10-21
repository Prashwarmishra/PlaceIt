// DOM elements
const uploadBtn = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const fileInfo = document.getElementById('fileInfo');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');

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
    // Display preview
    previewImage.src = e.target.result;
    previewSection.style.display = 'block';
  };
  
  reader.readAsDataURL(file);
}

