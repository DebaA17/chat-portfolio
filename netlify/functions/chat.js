const fetch = require('node-fetch');

const aboutMe = {
    name: "Debasis",
    bio: "Full Stack Developer passionate about building scalable web applications.",
    skills: ["JavaScript", "Node.js", "React", "HTML", "CSS", "Python", "Bash", "VAPT", "Bug bounty"],
    projects: [
        { name: "Chatbot", description: "A domain-specific chatbot using Gemini API." },
        { name: "Portfolio", description: "Personal portfolio website." }
    ]
};

function isAboutOwner(question) {
    const keywords = [
        'owner', 'your name', 'who are you', 'about you', 'bio', 'skills', 'projects',
        aboutMe.name.toLowerCase(), 'developer', 'portfolio', 'what can you do', 'tell me about yourself'
    ];
    const q = question.toLowerCase();
    return keywords.some(k => q.includes(k));
}

async function askGemini(prompt) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
        
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        return "Sorry, I couldn't get a response from Gemini.";
    } catch (error) {
        console.error('Gemini API error:', error);
        return "Sorry, there was an error connecting to Gemini.";
    }
}

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { question } = JSON.parse(event.body);
        let answer = '';
        
        if (isAboutOwner(question)) {
            answer = `Name: ${aboutMe.name}<br>Bio: ${aboutMe.bio}<br>Skills: ${aboutMe.skills.join(', ')}<br>Projects:<br>` +
                aboutMe.projects.map(p => `- ${p.name}: ${p.description}`).join('<br>');
        } else {
            answer = await askGemini(question);
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ answer })
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid request' })
        };
    }
};
