# InPlace 🏠

**Visualize products in your own space with AI-powered image generation**

InPlace is a Chrome extension that helps you see how any product would look in your actual background before buying. Simply upload a photo of your wall, select a product from any e-commerce site, and let AI generate a realistic visualization.

![InPlace Extension](https://img.shields.io/badge/version-0.1.0-blue) ![Chrome Extension](https://img.shields.io/badge/platform-Chrome-brightgreen) ![Manifest V3](https://img.shields.io/badge/manifest-v3-orange)

---

## ✨ Features

- **🖼️ Custom Background Upload** - Upload photos of your actual room or space
- **🔍 Smart Product Scraping** - Automatically detects product images from any e-commerce website
- **🤖 AI-Powered Visualization** - Uses Google Gemini 2.5 Flash Image API to generate photorealistic composites
- **📱 Tab-Specific Sidebar** - Independent sidebar for each browser tab
- **⚙️ Settings Management** - Secure API key storage with visual feedback
- **🔄 Quick Reset** - Start over with one click
- **⬇️ Download Results** - Save generated visualizations instantly
- **🛒 Multi-Site Support** - Works with Amazon, Flipkart, and other e-commerce sites

---

## 🚀 Quick Start

### Prerequisites

- Google Chrome browser (version 88+)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/inplace.git
   cd inplace
   ```

2. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **"Load unpacked"**
   - Select the `inplace` project folder

3. **Add Your API Key**
   - Click the InPlace extension icon in Chrome toolbar
   - Click the settings ⚙️ icon
   - Enter your Gemini API key
   - Click **"Save API Key"**

---

## 📖 How to Use

### Step 1: Upload Your Background
1. Click the InPlace icon while on any product page
2. Upload a photo of your room/space
3. The preview will appear below

### Step 2: Select a Product
1. The extension automatically scans the page for product images
2. Browse the detected products
3. Click to select the product you want to visualize

### Step 3: Generate Visualization
1. Review your selected product
2. Click **"Generate Image"**
3. Wait for AI to create the composite (typically 10-30 seconds)

### Step 4: Download & Share
1. View your generated visualization
2. Click **"Download Image"** to save
3. Or click **"Generate Again"** to try different settings

---

## 🏗️ Architecture

### File Structure

```
inplace/
├── manifest.json              # Extension configuration
├── background/
│   └── background.js          # Service worker for tab management
├── content/
│   └── content.js             # Page scraping & image detection
├── sidebar/
│   ├── sidebar.html           # Main UI structure
│   ├── sidebar.css            # Shadcn-inspired styles
│   └── sidebar.js             # UI logic & API integration
├── utils/
│   └── imageUtils.js          # Image processing utilities
└── README.md                  # This file
```

### Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Browser APIs:** Chrome Extension API (Manifest V3)
- **AI Model:** Google Gemini 2.5 Flash Image
- **Storage:** Chrome Storage API (local)
- **Design:** Shadcn-inspired design system

---

## 🔧 Technical Details

### Manifest V3 Features

- **Service Worker:** Tab-specific sidebar management
- **Content Scripts:** Product image scraping from DOM
- **Side Panel API:** Modern sidebar interface
- **Storage API:** Secure local storage for API keys
- **Host Permissions:** Cross-origin image fetching

### API Integration

The extension uses the Gemini 2.5 Flash Image API endpoint:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
```

**Request Format:**
```json
{
  "contents": [{
    "parts": [
      { "text": "prompt" },
      { "inline_data": { "mime_type": "image/jpeg", "data": "base64..." } },
      { "inline_data": { "mime_type": "image/jpeg", "data": "base64..." } }
    ]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 8192
  }
}
```

### Image Processing

1. **Background Upload:** FileReader API converts to base64
2. **Product Scraping:** 
   - Detects `<img>` elements and CSS background images
   - Filters by size (min 250x250px)
   - Amazon-specific: Prioritizes `#landingImage`
   - Excludes logos, icons, ads
3. **Fetching:** Uses Chrome's fetch API to bypass CORS
4. **Generation:** Sends both images as base64 to Gemini API
5. **Display:** Renders returned base64 image

---

## 🛠️ Development

### Setting Up for Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inplace.git
   cd inplace
   ```

2. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project folder

3. **Make Changes**
   - Edit files in your IDE
   - Click the refresh icon in `chrome://extensions/` to reload

### Debugging

**Sidebar Console:**
- Right-click sidebar → Inspect
- Check console for errors

**Background Script:**
- Go to `chrome://extensions/`
- Click "Inspect views: service worker"

**Content Script:**
- Inspect the webpage
- Check console for content script logs

### Key Files to Modify

| File | Purpose |
|------|---------|
| `sidebar/sidebar.js` | UI logic, API calls, event handlers |
| `sidebar/sidebar.css` | Styling (shadcn design system) |
| `content/content.js` | Product scraping logic |
| `background/background.js` | Tab management |
| `manifest.json` | Permissions, scripts, metadata |

---

## 🎨 Design System

The extension uses a **shadcn-inspired** design system with:

- **HSL Color Variables** for easy theming
- **Clean Borders** over heavy shadows
- **Subtle Animations** (150ms transitions)
- **Ring-based Focus States**
- **Consistent Spacing** (0.5rem scale)
- **Modern Typography** (Inter, SF Pro)

### Color Palette

```css
--primary: 222.2 47.4% 11.2%       /* Dark slate */
--secondary: 210 40% 96.1%         /* Light gray */
--accent: 210 40% 96.1%            /* Accent gray */
--destructive: 0 84.2% 60.2%       /* Red */
--border: 214.3 31.8% 91.4%        /* Border gray */
--ring: 222.2 84% 4.9%             /* Focus ring */
```

---

## 🔐 Privacy & Security

- **Local Storage Only:** API keys are stored locally in Chrome's secure storage
- **No Data Collection:** No user data is sent to external servers (except Gemini API)
- **No Tracking:** No analytics or tracking scripts
- **Open Source:** Full transparency of code

### API Key Storage

```javascript
// Keys are stored using Chrome Storage API
chrome.storage.local.set({ 'geminiApiKey': 'your-key' });

// Retrieved securely when needed
chrome.storage.local.get(['geminiApiKey'], (result) => {
  // Use result.geminiApiKey
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "No product images found"**
- Make sure you're on a product detail page, not a listing page
- Try refreshing the page and reopening the sidebar
- Some sites may have unusual image structures

**2. "Gemini API key required"**
- Go to Settings ⚙️ and add your API key
- Get a key at https://aistudio.google.com/app/apikey
- Make sure the key has access to Gemini 2.5 Flash

**3. "Failed to generate image"**
- Check your internet connection
- Verify your API key is valid
- Check Chrome console for detailed error messages
- Ensure images aren't too large (recommended < 5MB each)

**4. "Sidebar won't open"**
- Reload the extension in `chrome://extensions/`
- Check that the extension has necessary permissions
- Try restarting Chrome

**5. Back button not working**
- Reload the extension
- Clear browser cache
- Check browser console for JavaScript errors

---

## 🚧 Roadmap

### Planned Features

- [ ] Multiple product placement in one scene
- [ ] Adjustable product size and position
- [ ] Light/shadow refinement controls
- [ ] Style presets (modern, rustic, minimalist)
- [ ] History of generated images
- [ ] Comparison view (before/after)
- [ ] Share to social media
- [ ] Firefox & Edge support
- [ ] Mobile app version

### Known Limitations

- Works best with furniture and home decor products
- Requires clear, well-lit background photos
- Generation time varies (10-30 seconds typical)
- API usage subject to Google's rate limits
- Best results with products shown from similar angles

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/inplace/issues)
- **Email:** support@inplace.app
- **Documentation:** [Wiki](https://github.com/yourusername/inplace/wiki)

---

## 🙏 Acknowledgments

- **Google Gemini** for the powerful image generation API
- **Shadcn** for design inspiration
- **Lucide Icons** for the beautiful SVG icons
- Chrome Extension community for excellent documentation

---

## 📊 Stats

- **Version:** 0.1.0
- **Extension Size:** ~50KB
- **Manifest Version:** 3
- **Minimum Chrome Version:** 88
- **Permissions:** activeTab, storage, scripting, sidePanel, host permissions

---

<p align="center">
  Made with ❤️ for better online shopping experiences
</p>

<p align="center">
  <a href="#inplace-">⬆️ Back to Top</a>
</p>

