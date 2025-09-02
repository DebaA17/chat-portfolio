# Security Policy

## Reporting a Vulnerability

If you discover a security issue or vulnerability in this chatbot project, please report it immediately.

- **Contact:** forensic@debasisbiswas.me
- **Preferred Language:** English

## Responsible Disclosure

Please do not publicly disclose vulnerabilities before contacting the owner. Allow reasonable time for investigation and remediation.

## Best Practices Followed
- API keys are never hardcoded or committed to the repository
- Sensitive files (e.g., `.env`, `node_modules`) are excluded via `.gitignore`
- User input is validated and sanitized in backend code
- CORS headers are set for serverless functions
- No personal data is stored or logged

Thank you for helping keep this project secure!
