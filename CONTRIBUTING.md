# Contributing to 100xdevs Web Wrapper

Thank you for your interest in contributing to 100xdevs Web Wrapper! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/web-wrapper.git
   cd web-wrapper
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the App

```bash
# Development mode
pnpm start

# Development mode with debugging
pnpm start:dev
```

### Building

```bash
# Build for your current platform
pnpm run build

# Build for specific platform
pnpm run build:linux
pnpm run build:win
pnpm run build:mac
```

### Testing

Before submitting a pull request, please:

1. Test your changes on the target platform(s)
2. Ensure the app builds successfully
3. Verify all existing features still work
4. Test on multiple platforms if possible (Windows, Linux, macOS)

## Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Update the README** if needed
3. **Test thoroughly** on your target platform(s)
4. **Commit your changes** with clear, descriptive commit messages
5. **Push to your fork** and create a Pull Request

### Pull Request Guidelines

- Provide a clear description of what your PR does
- Reference any related issues
- Include screenshots if UI changes are involved
- Ensure your branch is up to date with the main branch

## What to Contribute

We welcome contributions in many forms:

- **Bug fixes**: Report and fix issues
- **New features**: Add functionality that improves the app
- **Documentation**: Improve README, add comments, write guides
- **Platform support**: Help test and fix issues on Windows, macOS, or Linux
- **UI/UX improvements**: Enhance the user interface
- **Performance**: Optimize code and improve app performance
- **Security**: Report and fix security issues

## Reporting Issues

When reporting issues, please include:

- **Platform**: Windows, macOS, or Linux (and version)
- **Steps to reproduce**: Clear steps to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Any error messages or console output

## Questions?

If you have questions about contributing, feel free to:

- Open an issue for discussion
- Check existing issues and pull requests
- Review the README for more information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to 100xdevs Web Wrapper! 🎉

