# 📁 Project Structure

This document outlines the organized file structure of the ReportingHub Permissions Hub.

## 🏗️ **New Structure Overview**

```
reportinghub/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── src/                         # Source code (organized)
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   └── features/            # Feature-specific components
│   │       ├── permissions-hub/ # Main feature
│   │       │   ├── components/  # Feature components
│   │       │   ├── modals/      # Modal dialogs
│   │       │   ├── hooks/       # Custom hooks
│   │       │   └── index.ts     # Exports
│   │       └── shared/          # Shared components
│   ├── hooks/                   # Global custom hooks
│   ├── lib/                     # Utility libraries
│   ├── store/                   # State management
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Helper functions
│   └── constants/               # App constants
├── scripts/                     # Build and utility scripts
├── public/                      # Static assets
└── docs/                        # Documentation
```

## 🎯 **Key Improvements**

### **1. Separation of Concerns**
- **Components**: Organized by feature and reusability
- **Hooks**: Custom logic separated from components
- **Utils**: Pure functions and helpers
- **Types**: Centralized type definitions
- **Store**: State management isolated

### **2. Import Aliases**
```typescript
// Old (relative imports)
import { Button } from '../../../components/ui/button'
import { useStore } from '../../store/useStore'

// New (clean aliases)
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
```

### **3. Feature Organization**
```
permissions-hub/
├── components/          # Main feature components
│   ├── GroupsTable.tsx
│   ├── PermissionSetsTable.tsx
│   ├── ReportAccessMatrix.tsx
│   ├── SetupWizard.tsx
│   ├── TenantSwitcher.tsx
│   └── PermissionsHub.tsx
├── modals/             # Modal dialogs
│   ├── AssignTenantSetModal.tsx
│   ├── AuditViewModal.tsx
│   ├── EditPermissionSetModal.tsx
│   └── OverrideReportAccessModal.tsx
├── hooks/              # Feature-specific hooks
└── index.ts           # Clean exports
```

## 🔧 **Path Aliases**

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/store/*": ["./src/store/*"],
    "@/types/*": ["./src/types/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/constants/*": ["./src/constants/*"]
  }
}
```

## 📦 **Module Organization**

### **Types** (`src/types/`)
- `mockAzureAD.ts` - Azure AD mock data and types
- `index.ts` - Re-exports and additional types

### **Components** (`src/components/`)
- `ui/` - Reusable UI components (shadcn/ui)
- `features/` - Feature-specific components
- `shared/` - Cross-feature shared components

### **Hooks** (`src/hooks/`)
- `usePermissions.ts` - Permissions-related hooks
- Custom hooks for reusable logic

### **Store** (`src/store/`)
- `usePermissionsStore.ts` - Zustand store
- Centralized state management

### **Utils** (`src/utils/`)
- `index.ts` - Helper functions
- Pure functions and utilities

### **Constants** (`src/constants/`)
- `index.ts` - App constants
- Configuration values

## 🚀 **Benefits**

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Easy to add new features
3. **Developer Experience**: Clean imports and organization
4. **Type Safety**: Centralized type definitions
5. **Reusability**: Shared components and utilities
6. **Testing**: Isolated modules for easier testing

## 📝 **Usage Examples**

### **Importing Components**
```typescript
// Feature components
import { PermissionsHub, GroupsTable } from '@/components/features/permissions-hub'

// UI components
import { Button, Card } from '@/components/ui'

// Types
import { Tenant, AadGroup } from '@/types'

// Hooks
import { usePermissions } from '@/hooks/usePermissions'

// Utils
import { getGroupTypeBadge } from '@/utils'

// Constants
import { PERMISSION_LEVELS } from '@/constants'
```

### **Adding New Features**
1. Create feature folder in `src/components/features/`
2. Add components, modals, hooks as needed
3. Export from `index.ts`
4. Import using `@/components/features/feature-name`

This structure makes the codebase more professional, maintainable, and ready for production use! 🎉
