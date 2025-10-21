# Contributing to Neural Salvage

Thank you for your interest in contributing to Neural Salvage! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## Getting Started

### Development Setup

1. **Fork the repository**
   - Click "Fork" on GitHub
   - Clone your fork locally

2. **Set up development environment**
```bash
git clone https://github.com/your-username/neural-salvage.git
cd neural-salvage
npm install
cp .env.example .env.local
# Configure your .env.local with credentials
npm run dev
```

3. **Create a branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Using Daytona.io

Neural Salvage is optimized for development with Daytona.io:

1. **Install Daytona CLI**
```bash
curl -sf https://download.daytona.io/daytona/install.sh | sh
```

2. **Create Daytona workspace**
```bash
daytona create https://github.com/your-username/neural-salvage
```

3. **Start development**
```bash
# Daytona automatically:
# - Sets up the environment
# - Installs dependencies
# - Configures ports
# - Starts dev server
```

4. **Access your workspace**
   - Daytona provides a VS Code instance
   - Port 3000 is automatically exposed
   - All dependencies are pre-installed

## Development Guidelines

### Code Style

- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured rules
- **Prettier**: Format code before committing
- **Naming**: Use descriptive, camelCase names

### Component Guidelines

```typescript
// ✅ Good
export function MediaCard({ asset, onSelect }: MediaCardProps) {
  // Component logic
}

// ❌ Bad
export function card(props: any) {
  // Component logic
}
```

### File Organization

```
app/
  ├── (auth)/          # Auth-related pages
  ├── dashboard/       # Dashboard pages
  ├── api/            # API routes
  └── ...

components/
  ├── ui/             # shadcn/ui components
  ├── layout/         # Layout components
  ├── media/          # Media-specific components
  └── ...

lib/
  ├── firebase/       # Firebase utilities
  ├── ai/            # AI services
  ├── vector/        # Vector DB
  └── ...
```

### Commit Messages

Follow conventional commits:

```
feat: add video thumbnail generation
fix: resolve upload progress tracking bug
docs: update API documentation
style: format code with prettier
refactor: simplify AI provider abstraction
test: add upload component tests
chore: update dependencies
```

### Pull Request Process

1. **Update your branch**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests and linting**
```bash
npm run lint
npm run type-check
npm test
```

3. **Create pull request**
   - Use descriptive title
   - Reference related issues
   - Describe changes made
   - Include screenshots for UI changes
   - List breaking changes if any

4. **PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #123
```

## Areas for Contribution

### High Priority
- [ ] Implement video keyframe extraction
- [ ] Add batch AI processing queue
- [ ] Create mobile-responsive layouts
- [ ] Implement infinite scroll
- [ ] Add comprehensive error handling

### Medium Priority
- [ ] Add more layout options
- [ ] Implement advanced filters
- [ ] Create admin dashboard
- [ ] Add analytics tracking
- [ ] Improve accessibility

### Low Priority
- [ ] Add dark/light mode toggle
- [ ] Create keyboard shortcuts
- [ ] Add export functionality
- [ ] Implement sharing features
- [ ] Add social features

## Feature Development

### Adding New Features

1. **Plan the feature**
   - Create GitHub issue
   - Discuss approach
   - Get feedback

2. **Implement**
   - Write code
   - Add tests
   - Update documentation

3. **Review**
   - Self-review code
   - Test thoroughly
   - Request peer review

### API Endpoint Development

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const { field } = await request.json();
    if (!field) {
      return NextResponse.json(
        { error: 'Field is required' },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    // Add auth middleware

    // 3. Process request
    const result = await processData(field);

    // 4. Return response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Component Development

```typescript
// components/your-component.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface YourComponentProps {
  // Define props
}

export function YourComponent({ }: YourComponentProps) {
  const [state, setState] = useState();

  return (
    <div className="metal-card p-4 rounded-lg">
      {/* Component content */}
    </div>
  );
}
```

## Testing

### Unit Tests
```typescript
// __tests__/component.test.tsx
import { render, screen } from '@testing-library/react';
import { YourComponent } from '@/components/your-component';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Integration Tests
- Test API endpoints
- Test database operations
- Test file uploads
- Test AI processing

### E2E Tests
- Test user flows
- Test authentication
- Test upload process
- Test search functionality

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Explain non-obvious decisions
- Keep comments up to date

### API Documentation
- Document all endpoints in `docs/api.md`
- Include request/response examples
- Document error cases
- Update when changing APIs

### User Documentation
- Update README for new features
- Add setup instructions
- Create user guides
- Include screenshots

## Performance

### Best Practices
- Optimize images and media
- Use lazy loading
- Implement pagination
- Cache API responses
- Minimize bundle size

### Monitoring
- Track Core Web Vitals
- Monitor API response times
- Track error rates
- Monitor resource usage

## Security

### Security Checklist
- [ ] Validate all user input
- [ ] Sanitize data before storage
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Verify authentication
- [ ] Check authorization
- [ ] Encrypt sensitive data
- [ ] Use HTTPS only
- [ ] Validate file uploads
- [ ] Implement CSRF protection

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: security@neuralsalvage.com
- Include detailed description
- Provide steps to reproduce
- Allow time for fix before disclosure

## Release Process

### Version Numbering
- Follow Semantic Versioning (SemVer)
- MAJOR.MINOR.PATCH
- Document breaking changes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Tagged in git
- [ ] Deployed to production
- [ ] Release notes published

## Community

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Discord: Real-time chat (coming soon)

### Getting Help
1. Check existing documentation
2. Search GitHub issues
3. Ask in discussions
4. Create new issue if needed

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:
- Open a GitHub issue
- Start a discussion
- Reach out to maintainers

Thank you for contributing to Neural Salvage! 🚀