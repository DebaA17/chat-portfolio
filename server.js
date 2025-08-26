const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Owner info
const aboutMe = {
    name: "Debasis",
    bio: "Full Stack Developer passionate about building scalable web applications.",
    skills: ["JavaScript", "Node.js", "React", "Linux", "DevOps", "Python"],
    projects: [
        { name: "Chatbot", description: "A domain-specific chatbot." },
        { name: "Portfolio", description: "Personal portfolio website." }
    ]
};

app.use(bodyParser.json());
app.use(express.static(__dirname));

function isAboutOwner(question) {
    const keywords = [
        'owner', 'your name', 'who are you', 'about you', 'bio', 'skills', 'projects',
        aboutMe.name.toLowerCase(), 'developer', 'portfolio', 'what can you do', 'tell me about yourself'
    ];
    const q = question.toLowerCase();
    return keywords.some(k => q.includes(k));
}

async function askGemini(prompt) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
    if (!GEMINI_API_KEY) {
        return "Gemini API key not configured.";
    }
    
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        console.log('Gemini response:', data); // Debug log
        
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        return "Sorry, I couldn't get a response from Gemini.";
    } catch (error) {
        console.error('Gemini API error:', error);
        return "Sorry, there was an error connecting to Gemini.";
    }
}

app.post('/api/chat', async (req, res) => {
    const question = req.body.question || '';
    let answer = '';
    
    if (isAboutOwner(question)) {
        answer = `Name: ${aboutMe.name}<br>Bio: ${aboutMe.bio}<br>Skills: ${aboutMe.skills.join(', ')}<br>Projects:<br>` +
            aboutMe.projects.map(p => `- ${p.name}: ${p.description}`).join('<br>');
    } else {
        answer = await askGemini(question);
    }
    
    res.json({ answer });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`💬 Open your browser and go to http://localhost:${PORT} to use the chatbot!`);
});

