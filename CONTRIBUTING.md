# Contributing to ReportingHub

Thank you for your interest in contributing to ReportingHub! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Questions & Support](#questions--support)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- A code editor (VS Code recommended)

### First Contribution

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/reportinghub.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/reportinghub.git
   cd reportinghub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run setup script
- `npm run clean` - Clean and reinstall dependencies

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, maintainable code
   - Follow the coding standards below
   - Add tests if applicable

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Open a PR on GitHub
   - Fill out the PR template
   - Wait for review

## Project Structure

### Directory Organization

```
reportinghub/
├── app/                          # Next.js App Router pages
│   ├── (studio)/                 # Studio layout group
│   │   ├── sources/              # Data sources page
│   │   ├── model/                # Semantic model browser
│   │   ├── readiness/           # AI readiness analyzer
│   │   └── publish/             # Publish & review
│   ├── agents/                  # Agents management
│   ├── permissions/             # Permissions Hub
│   └── ...
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── studio/              # BI Genius Studio components
│   │   └── features/
│   │       └── permissions-hub/ # Permissions Hub components
│   ├── store/                   # Zustand stores
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Helper functions
│   └── constants/               # App constants
├── lib/                          # Root-level shared lib
│   ├── types.ts                 # Shared types
│   ├── mockData.ts              # Mock data
│   └── mockServices.ts          # Mock API services
└── scripts/                      # Utility scripts
```

### Import Path Aliases

Use the configured path aliases instead of relative imports:

```typescript
// ✅ Good - Use aliases
import { Button } from '@/components/ui/button'
import { useBiGeniusStore } from '@/store/useBiGeniusStore'
import { DataSource } from '@/types'

// ❌ Bad - Avoid relative imports
import { Button } from '../../../components/ui/button'
```

Available aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/store/*` → `./src/store/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/utils/*` → `./src/utils/*`
- `@/constants/*` → `./src/constants/*`

## Coding Standards

### TypeScript

- **Use TypeScript for all new code**
- **Strict mode enabled** - Follow TypeScript strict type checking
- **Define types explicitly** - Avoid `any` types
- **Use interfaces for object shapes**
- **Use enums for constants**

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

enum UserRole {
  Admin = 'admin',
  User = 'user',
}

// ❌ Bad
const user: any = { id: 1, name: 'John' }
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript for props**
- **Extract reusable logic into custom hooks**
- **Keep components small and focused**
- **Use meaningful component names**

```typescript
// ✅ Good
interface AgentCardProps {
  agent: Agent
  onConfigure: (id: string) => void
}

export function AgentCard({ agent, onConfigure }: AgentCardProps) {
  // Component implementation
}

// ❌ Bad
export function Card(props: any) {
  // Avoid any types
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `AgentCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `User.ts` or `types.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePermissions.ts`)
- **Constants**: UPPER_SNAKE_CASE for constants, camelCase for files (e.g., `constants.ts`)

### Component Organization

1. **Imports** (external, then internal)
2. **Types/Interfaces**
3. **Component definition**
4. **Exports**

```typescript
// 1. External imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Internal imports
import { useBiGeniusStore } from '@/store/useBiGeniusStore'
import { Agent } from '@/types'

// 3. Types
interface AgentCardProps {
  agent: Agent
}

// 4. Component
export function AgentCard({ agent }: AgentCardProps) {
  // Implementation
}
```

### Styling with Tailwind CSS

- **Use Tailwind utility classes** - Avoid inline styles
- **Use semantic class names** - Group related utilities
- **Extract complex styles** - Use `cn()` utility for conditional classes
- **Follow responsive design** - Mobile-first approach

```typescript
// ✅ Good
import { cn } from '@/lib/utils'

<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary text-primary-foreground",
  className
)}>

// ❌ Bad
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### State Management

- **Use Zustand for global state**
- **Keep stores focused** - One store per feature area
- **Use selectors** - Avoid accessing entire store
- **Local state for component-specific state**

```typescript
// ✅ Good - Use selectors
const agents = useBiGeniusStore((state) => state.
     state.agentConfigs)
const updateAgent = useBiGeniusStore((state) => state.updateAgentConfig)

// ❌ Bad - Access entire store
const store = useBiGeniusStore()
const agents = store.agentConfigs
```

### Error Handling

- **Use Error Boundaries** for component errors
- **Handle async errors** with try-catch
- **Show user-friendly error messages**
- **Log errors appropriately**

```typescript
// ✅ Good
try {
  const result = await syncDataSource(id)
  toast.success('Synced successfully')
} catch (error) {
  console.error('Failed to sync:', error)
  toast.error('Failed to sync data source')
}
```

### Accessibility

- **Use semantic HTML**
- **Add ARIA labels** where needed
- **Ensure keyboard navigation**
- **Test with screen readers**

```typescript
// ✅ Good
<button
  aria-label="Delete agent"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</button>
```

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-user-profile`)
- `fix/` - Bug fixes (e.g., `fix/agent-sync-error`)
- `refactor/` - Code refactoring (e.g., `refactor/permissions-store`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `test/` - Adding tests (e.g., `test/agent-card-tests`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(studio): add agent cloning functionality
fix(permissions): resolve tenant switching issue
docs: update contributing guidelines
refactor(store): simplify agent state management
```

### Commit Best Practices

- **Write clear, descriptive commit messages**
- **Make atomic commits** - One logical change per commit
- **Keep commits focused** - Don't mix unrelated changes
- **Test before committing** - Ensure code works

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test your changes**
   - Test manually in the browser
   - Verify no console errors
   - Check responsive design

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] TypeScript types are properly defined
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes are tested
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** - CI/CD will run linting and build
2. **Code review** - Maintainers will review your code
3. **Address feedback** - Make requested changes
4. **Approval** - Once approved, your PR will be merged

## Testing Guidelines

### Manual Testing

- **Test all user flows** related to your changes
- **Test edge cases** - Empty states, error states
- **Test responsive design** - Mobile, tablet, desktop
- **Test accessibility** - Keyboard navigation, screen readers

### Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors or warnings
- [ ] Responsive design works
- [ ] Accessibility maintained
- [ ] Performance acceptable
- [ ] Error handling works

### Future: Automated Testing

When test infrastructure is added:
- Write unit tests for utilities
- Write component tests for UI components
- Write integration tests for workflows
- Maintain test coverage above 80%

## Documentation

### Code Comments

- **Document complex logic** - Explain why, not what
- **Use JSDoc for functions** - Especially public APIs
- **Keep comments up-to-date** - Update when code changes

```typescript
/**
 * Calculates the effective permissions for a user across all groups.
 * 
 * @param userId - The user ID to calculate permissions for
 * @param tenantId - The tenant context
 * @returns The effective permission set
 */
function calculateEffectivePermissions(userId: string, tenantId: string): PermissionSet {
  // Implementation
}
```

### Updating Documentation

- **Update README.md** - If setup or usage changes
- **Update CONTRIBUTING.md** - If contribution process changes
- **Update code comments** - When adding complex features
- **Add JSDoc** - For new public APIs

## Questions & Support

### Getting Help

- **Check existing documentation** - README.md, STRUCTURE.md
- **Search existing issues** - Your question might already be answered
- **Ask in discussions** - For general questions
- **Open an issue** - For bugs or feature requests

### Reporting Bugs

When reporting bugs, include:

1. **Description** - What happened?
2. **Steps to reproduce** - How can we reproduce it?
3. **Expected behavior** - What should happen?
4. **Actual behavior** - What actually happened?
5. **Environment** - Browser, OS, Node version
6. **Screenshots** - If applicable
7. **Console errors** - Any error messages

### Feature Requests

When requesting features:

1. **Describe the feature** - What do you want?
2. **Explain the use case** - Why is it needed?
3. **Propose implementation** - How could it work?
4. **Consider alternatives** - Are there other solutions?

## Additional Resources

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Project-Specific Documentation

- [README.md](./README.md) - Project overview and setup
- [STRUCTURE.md](./STRUCTURE.md) - Code organization
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - Complete documentation guide

## Thank You!

Thank you for contributing to ReportingHub! Your contributions help make this project better for everyone.

---

**Last Updated**: 2025-01-27  
**Version**: 1.0

