# Security Policy

## Overview

Infinity Heroes: Bedtime Chronicles is a children's application (target age 7-9) that prioritizes child safety and data privacy. We take security seriously and follow industry best practices to protect our young users.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Child Safety & Privacy (COPPA Compliance)

This application is designed with strict COPPA (Children's Online Privacy Protection Act) compliance:

### ✅ What We DO
- Store story data locally in browser IndexedDB only
- Use parent-provided API keys (stored in localStorage or provided at runtime)
- Generate age-appropriate content with AI safety filters
- Provide offline-first functionality with no external tracking

### ❌ What We DO NOT Do
- Collect personally identifiable information (PII)
- Track user behavior or analytics
- Set third-party cookies
- Include social media integrations
- Display advertisements
- Send data to external servers (except Gemini API for story generation)

## Security Measures

### 1. Content Security Policy (CSP)
Strict CSP headers defined in `vercel.json`:
- `script-src 'self'` - Only scripts from our domain
- `connect-src` limited to Gemini API
- `X-Frame-Options: DENY` - No iframe embedding
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing

### 2. API Key Protection
- API keys never exposed to client code
- All Gemini API calls proxied through Vercel serverless functions
- Keys stored as environment variables (not committed to git)
- `.env` file gitignored

### 3. Input Validation
- User input sanitized before sending to AI
- Story length limits enforced
- No executable code in generated content

### 4. Dependency Security
- Dependencies regularly audited with `npm audit`
- Minimal dependency footprint (5 core dependencies)
- No deprecated or unmaintained packages

## Reporting a Vulnerability

**⚠️ Do NOT report security vulnerabilities through public GitHub issues.**

### Reporting Process

1. **Email**: Send details to the repository maintainers (check GitHub profile for contact)
2. **Subject Line**: Use `[SECURITY] Infinity Heroes: Vulnerability Report`
3. **Include**:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Affected versions
   - Suggested fix (if available)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Critical vulnerabilities addressed within 7 days
- **Disclosure**: Coordinated disclosure after fix is deployed

### Scope

**In Scope:**
- Authentication/authorization bypass
- API key exposure or leakage
- Cross-site scripting (XSS)
- Content Security Policy bypass
- Malicious content generation
- IndexedDB data exfiltration
- Child safety violations (inappropriate content)

**Out of Scope:**
- Issues requiring physical access to device
- Social engineering attacks
- Denial of Service (DoS) attacks
- Issues in third-party dependencies (report to maintainers directly)
- Browser-specific bugs (report to browser vendors)

## Security Best Practices for Contributors

### 1. Code Review Checklist
- [ ] No hardcoded secrets or API keys
- [ ] User input validated and sanitized
- [ ] Error messages don't leak sensitive information
- [ ] No `eval()` or `new Function()` usage
- [ ] CSP compliance maintained
- [ ] COPPA guidelines followed

### 2. Dependency Management
```bash
# Before adding a new dependency
npm audit
# Review package homepage and maintainers
# Check for known vulnerabilities
```

### 3. Environment Variables
Always use environment variables for sensitive data:
```typescript
// ✅ Correct
const apiKey = process.env.GEMINI_API_KEY;

// ❌ Wrong
const apiKey = "AIza...";
```

### 4. API Endpoints
All serverless functions must:
- Validate HTTP method
- Check API key existence
- Use try/catch error handling
- Return appropriate status codes
- Log errors without exposing secrets

## Security Audit History

| Date | Type | Findings | Status |
|------|------|----------|--------|
| 2026-02-15 | Senior Engineer Audit | Documentation gaps, license headers | In Progress |

## Resources

- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Vercel Security Best Practices](https://vercel.com/docs/security)

## License

This security policy is part of the Infinity Heroes: Bedtime Chronicles project, licensed under Apache-2.0.

SPDX-License-Identifier: Apache-2.0
