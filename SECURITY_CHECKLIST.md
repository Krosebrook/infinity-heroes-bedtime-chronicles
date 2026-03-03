# Security Audit Checklist

Use this checklist when reviewing code changes for security concerns.

## 🔒 Secrets & API Keys

- [ ] No hardcoded API keys in code
- [ ] No credentials in configuration files
- [ ] All secrets use `process.env.*` (server-side only)
- [ ] `.env` file is in `.gitignore`
- [ ] API keys never sent to client bundle
- [ ] Vercel environment variables configured correctly

## 🛡️ Input Validation

- [ ] User input sanitized before processing
- [ ] Length limits enforced (hero name < 50 chars, etc.)
- [ ] No `eval()`, `new Function()`, or `innerHTML` usage
- [ ] XSS prevention: text content escaped properly
- [ ] File uploads (if any) validated for type and size

## 🌐 Content Security Policy

- [ ] CSP headers configured in `vercel.json`
- [ ] `script-src 'self'` maintained (no external scripts)
- [ ] `connect-src` limited to Gemini API only
- [ ] No inline scripts without nonce/hash
- [ ] `X-Frame-Options: DENY` present
- [ ] `X-Content-Type-Options: nosniff` present

## 👶 Child Safety (COPPA)

- [ ] No personally identifiable information (PII) collected
- [ ] No email addresses, phone numbers, or real names stored
- [ ] No analytics or tracking scripts (Google Analytics, Mixpanel, etc.)
- [ ] No social media integrations or share buttons
- [ ] No external links that navigate away from app
- [ ] No third-party cookies
- [ ] No advertisements or monetization
- [ ] AI content includes age-appropriate safety filters
- [ ] Generated content verified for appropriateness

## 🔐 Authentication & Authorization

- [ ] API endpoints verify HTTP method
- [ ] Server-side API key validation before Gemini calls
- [ ] No authentication bypass vulnerabilities
- [ ] Session handling secure (if applicable)

## 🎯 API Endpoints Security

- [ ] Method validation (POST-only where required)
- [ ] API key existence check
- [ ] Error messages don't leak sensitive data
- [ ] Rate limiting considered (Gemini API quotas)
- [ ] Request body validated
- [ ] Response sanitization

## 📦 Dependencies

- [ ] `npm audit` run and critical vulnerabilities addressed
- [ ] Dependencies up to date (especially security patches)
- [ ] No deprecated packages
- [ ] Minimal dependency footprint maintained
- [ ] Lock file (`package-lock.json`) committed

## 🗄️ Data Storage

- [ ] IndexedDB used for local storage only
- [ ] No data sent to external servers (except Gemini)
- [ ] Storage quota limits handled gracefully
- [ ] Sensitive data cleared on logout/reset
- [ ] No localStorage used for sensitive information

## 🌍 Network Security

- [ ] All requests use HTTPS
- [ ] API proxy pattern followed (no direct Gemini calls from client)
- [ ] CORS configured appropriately
- [ ] No credentials in URLs or query parameters

## 🔍 Error Handling

- [ ] Errors logged without exposing stack traces to users
- [ ] Generic error messages shown to users
- [ ] Detailed errors logged server-side only
- [ ] No sensitive data in error responses

## 🎨 Frontend Security

- [ ] React escapes content automatically (no `dangerouslySetInnerHTML`)
- [ ] User-generated content properly escaped
- [ ] No client-side code execution of untrusted input
- [ ] Links validated before rendering
- [ ] External resources (fonts, etc.) use SRI (Subresource Integrity)

## 📱 PWA Security

- [ ] Service worker from trusted source only
- [ ] Service worker cache only contains app assets
- [ ] No sensitive data cached by service worker
- [ ] HTTPS required for PWA features

## 🏗️ Build & Deployment

- [ ] Production builds don't include source maps with secrets
- [ ] Build artifacts in `.gitignore`
- [ ] CI/CD pipeline doesn't expose secrets in logs
- [ ] Vercel project environment variables isolated per environment

## 🔬 Code Review Process

- [ ] Security-sensitive changes reviewed by 2+ maintainers
- [ ] Child safety implications considered
- [ ] COPPA compliance verified for new features
- [ ] Threat modeling performed for significant changes

## 🚨 Incident Response

- [ ] Security vulnerability disclosure process followed (SECURITY.md)
- [ ] Critical vulnerabilities fixed within 7 days
- [ ] Users notified if data breach occurs (N/A for local-only app)
- [ ] Post-mortem conducted for security incidents

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All checklist items above verified
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Build succeeds without warnings
- [ ] Manual security testing performed
- [ ] COPPA compliance double-checked
- [ ] Content Security Policy tested in production-like environment

## 🛠️ Tools & Commands

```bash
# Audit dependencies
npm audit

# Check for outdated packages
npm outdated

# Find potential secrets in code
git secrets --scan

# Search for console.log (potential info leaks)
grep -r "console\.log" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules

# Find eval usage (dangerous)
grep -r "eval\|new Function" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules

# Check for localStorage keys
grep -r "localStorage\|sessionStorage" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
```

## 📚 Reference Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [COPPA Compliance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [Content Security Policy](https://content-security-policy.com/)
- [Web.dev Security](https://web.dev/secure/)

## 🔄 Regular Security Tasks

### Weekly
- [ ] Review dependency security alerts
- [ ] Check for new CVEs affecting dependencies

### Monthly
- [ ] Run full `npm audit`
- [ ] Review CSP violations (if monitoring enabled)
- [ ] Update dependencies with security patches

### Quarterly
- [ ] Full security audit of codebase
- [ ] Review and update SECURITY.md
- [ ] Test incident response procedures
- [ ] Review access control and API keys

---

**Last Updated:** 2026-02-15  
**License:** Apache-2.0 · SPDX-License-Identifier: Apache-2.0
