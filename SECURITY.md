# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[security@100xdevs.com](mailto:security@100xdevs.com)**. You will receive a response within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Features

This application implements multiple security layers:

1. **Context Isolation**: Enabled to prevent direct access to Node.js APIs from renderer
2. **Node Integration**: Disabled in renderer process
3. **Trusted Origins**: Only specific domains are trusted for navigation
4. **Permission Handling**: Permissions are restricted to trusted origins
5. **External Links**: Untrusted links open in system browser
6. **OAuth Detection**: OAuth redirects are properly handled

## Best Practices

- Always download from official GitHub Releases
- Verify checksums when available
- Keep the application updated to the latest version
- Report security issues responsibly

