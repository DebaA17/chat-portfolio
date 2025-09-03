const fetch = require('node-fetch');
const BAD_PROMPT_KEYWORDS = [
    // 18+ / explicit
    'sex', 'porn', 'nude', 'xxx', 'adult', 'erotic', 'nsfw', 'explicit', 'naked', 'boobs', 'genital', 'penis', 'vagina', 'cum', 'orgasm', 'masturbate', 'rape', 'incest', 'fetish', 'bdsm', 'hentai',
    // Hate/violence
    'kill', 'murder', 'terrorist', 'bomb', 'attack', 'racist', 'hate', 'suicide', 'self-harm', 'abuse', 'bully', 'violence', 'shoot', 'stab', 'assault', 'torture',
    // XSS/code injection
    '<script', 'onerror', 'onload', 'javascript:', 'alert(', 'document.cookie', 'eval(', 'base64,', 'iframe', 'srcdoc', 'img src', 'svg on', 'fetch(', 'XMLHttpRequest',
    // Unethical
    'hack', 'phish', 'scam', 'cheat', 'steal', 'exploit', 'malware', 'virus', 'keylogger', 'ddos', 'ransomware', 'crack', 'pirate', 'illegal', 'drugs', 'weed', 'cocaine', 'heroin', 'meth', 'lsd', 'ecstasy',
];

const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
const blockedIPs = {};

function getIP(event) {
    // Try Netlify headers, fallback to remote IP
    return event.headers['x-forwarded-for']?.split(',')[0]?.trim() || event.headers['client-ip'] || event.headers['x-real-ip'] || event.headers['cf-connecting-ip'] || event.headers['fastly-client-ip'] || event.headers['true-client-ip'] || event.headers['x-cluster-client-ip'] || event.headers['x-forwarded'] || event.headers['forwarded-for'] || event.headers['forwarded'] || event.requestContext?.identity?.sourceIp || 'unknown';
}

function isBadPrompt(question) {
    const q = question.toLowerCase();
    return BAD_PROMPT_KEYWORDS.some(k => q.includes(k));
}

function sanitize(str) {
    // Basic HTML entity encoding
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
        const ip = getIP(event);

        // Check if IP is blocked
        if (blockedIPs[ip] && Date.now() < blockedIPs[ip]) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'You have been blocked for submitting unethical or unsafe prompts. Try again later.' })
            };
        }

        // Check for bad prompt
        if (isBadPrompt(question)) {
            blockedIPs[ip] = Date.now() + BLOCK_DURATION_MS;
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Your prompt was blocked due to unsafe or unethical content. You are blocked for 1 hour.' })
            };
        }

        let answer = '';
        if (isAboutOwner(question)) {
            answer = `Name: ${sanitize(aboutMe.name)}<br>Bio: ${sanitize(aboutMe.bio)}<br>Skills: ${sanitize(aboutMe.skills.join(', '))}<br>Projects:<br>` +
                aboutMe.projects.map(p => `- ${sanitize(p.name)}: ${sanitize(p.description)}`).join('<br>');
        } else {
            answer = await askGemini(question);
            answer = sanitize(answer);
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
