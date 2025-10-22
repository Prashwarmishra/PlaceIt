# Contributing to InPlace

Thank you for your interest in contributing to InPlace! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Report Bugs** - Found a bug? Open an issue!
- **Suggest Features** - Have an idea? We'd love to hear it!
- **Fix Issues** - Check out our open issues
- **Improve Documentation** - Help make our docs better
- **Write Tests** - Help us improve code quality
- **Code Reviews** - Review pull requests

## 🚀 Getting Started

### Prerequisites

- Google Chrome (latest version)
- Git
- Text editor or IDE (VS Code recommended)
- Google Gemini API key for testing

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/inplace.git
   cd inplace
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

4. **Load the extension in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `inplace` folder

## 📝 Development Guidelines

### Code Style

We follow standard JavaScript conventions:

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Use them
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Comments:** Use JSDoc for functions

Example:
```javascript
/**
 * Fetch an image and convert it to base64
 * @param {string} imageUrl - The URL of the image to fetch
 * @returns {Promise<string>} Base64 encoded image data
 */
async function fetchImageAsBase64(imageUrl) {
  // Implementation
}
```

### File Organization

```
inplace/
├── manifest.json          # Keep version updated
├── background/            # Service worker logic
├── content/               # Page interaction scripts
├── sidebar/               # Main UI components
│   ├── sidebar.html      # Structure
│   ├── sidebar.css       # Styles (shadcn design)
│   └── sidebar.js        # Logic
└── utils/                # Shared utilities
```

### CSS Guidelines

We use a **shadcn-inspired** design system:

- Use HSL color variables from `:root`
- Follow the spacing scale (0.5rem increments)
- Use `rem` units, not `px`
- Transitions: 150ms for interactions
- Border radius: Use CSS variables
- Focus states: Use ring shadows

Example:
```css
.button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  transition: all 150ms ease;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--ring), 0.1);
}
```

## 🐛 Reporting Bugs

### Before Submitting

1. Check if the bug has already been reported
2. Test with the latest version
3. Check the browser console for errors

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Chrome Version: [e.g. 120]
- Extension Version: [e.g. 0.1.0]
- OS: [e.g. macOS 14.0]

**Console Errors**
Paste any console errors here.
```

## ✨ Requesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features.

**Additional context**
Add any other context or screenshots.
```

## 🔧 Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Test on multiple e-commerce sites
   - Verify all features work
   - Check for console errors

2. **Update documentation**
   - Update README if needed
   - Add inline comments
   - Update CHANGELOG

3. **Follow code style**
   - Match existing code style
   - Use meaningful variable names
   - Add comments for complex logic

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome latest
- [ ] Tested on Amazon
- [ ] Tested on other sites
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated

## Screenshots (if applicable)
Add screenshots here.
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited!

## 🧪 Testing Guidelines

### Manual Testing

Test the following scenarios:

1. **Fresh Installation**
   - Load unpacked extension
   - Add API key
   - Generate first image

2. **Core Functionality**
   - Upload background image
   - Scrape products from page
   - Select product
   - Generate visualization
   - Download result

3. **Edge Cases**
   - No products found
   - Invalid API key
   - Large images
   - Slow connection
   - Tab switching

4. **Cross-Site Testing**
   - Amazon
   - IKEA
   - Wayfair
   - Other e-commerce sites

### Browser Console Testing

Check for:
- No JavaScript errors
- No failed network requests
- Proper API responses
- Clean console logs

## 📚 Documentation

### Updating README

- Keep installation steps clear
- Update features list
- Add screenshots for new features
- Update troubleshooting section

### Inline Comments

```javascript
// Good: Explains WHY
// Using setTimeout to preserve user gesture context
setTimeout(() => chrome.sidePanel.open({ tabId }), 0);

// Bad: Explains WHAT (obvious from code)
// Open the side panel
chrome.sidePanel.open({ tabId });
```

## 🎯 Priority Areas

We especially welcome contributions in:

1. **Product Scraping Logic** - Support for more sites
2. **UI/UX Improvements** - Better user experience
3. **Error Handling** - More graceful error messages
4. **Performance** - Faster image processing
5. **Documentation** - Clearer guides and examples

## 🤔 Questions?

- **General Questions:** Open a GitHub Discussion
- **Bug Reports:** Open an Issue
- **Security Issues:** Email security@inplace.app

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information

## 🏆 Recognition

Contributors will be:
- Listed in README acknowledgments
- Credited in release notes
- Given shoutouts on social media

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to InPlace! 🎉**

