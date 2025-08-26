# AI Chatbot for Netlify

A beautiful chatbot that answers questions about Debasis (the owner) and provides general AI assistance using Google's Gemini API.

## 🚀 Deploy to Netlify

### Method 1: Drag & Drop (Easiest)
1. Zip all files in this folder
2. Go to [netlify.com](https://netlify.com)
3. Drag the zip file to the deploy area
4. Set environment variable: `GEMINI_API_KEY` = your API key

### Method 2: Git Repository
1. Push this folder to GitHub
2. Connect your GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.`
5. Add environment variable: `GEMINI_API_KEY` = your API key

## 🔧 Environment Variables

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add: `GEMINI_API_KEY` = `your_gemini_api_key_here`

## 📁 File Structure

```
/
├── index.html          # Frontend UI
├── netlify.toml        # Netlify config
├── netlify/functions/
│   └── chat.js         # Serverless function
├── package.json        # Dependencies
└── README.md          # This file
```

## 🎯 Features

- ✅ Beautiful responsive design
- ✅ Answers about owner (Debasis)
- ✅ General AI assistance (math, coding, explanations)
- ✅ Secure serverless backend
- ✅ Mobile-friendly UI

## 🔄 Local Development

```bash
npm install
netlify dev  # Requires Netlify CLI
```

## 🌐 Live Demo

After deployment, your chatbot will be available at:
`https://your-site-name.netlify.app`
