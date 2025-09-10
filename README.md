# ReportingHub - Permissions Hub

A comprehensive multi-tenant BI permissions management prototype built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### 🏢 Multi-Tenant Support
- Switch between different Azure AD tenants
- Isolated permission management per tenant
- Tenant-specific group and user management

### 👥 Users & Groups Management
- View Azure AD groups with transitive member counts
- Support for Security groups and Microsoft 365 groups
- Dynamic group detection with membership rules
- Guest user identification and counting
- Nested group support with proper member resolution

### 🔐 Permission Sets
- Create, edit, and delete permission sets
- Granular capability management (view, edit, admin, export)
- Usage tracking and validation
- Prevent deletion of in-use permission sets

### 📊 Report Access Matrix
- Visual matrix showing group access to reports
- Inheritance vs Override visualization
- Bulk assignment operations
- Row-Level Security (RLS) role support
- Real-time effective permission calculation

### 🔍 Audit & Compliance
- "Who can see this report?" audit view
- Detailed access breakdown by group
- Inheritance source tracking
- Guest user visibility

### 🚀 Setup Wizard
- 3-step guided configuration
- Group selection and import
- Default permission assignment
- Configuration review and application

### 🎨 Modern UI/UX
- Built with shadcn/ui components
- Responsive design with Tailwind CSS
- Clean, professional interface
- Accessible and keyboard-navigable

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reportinghub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure

```
reportinghub/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── PermissionsHub/    # Main feature components
│       ├── modals/        # Modal components
│       ├── GroupsTable.tsx
│       ├── PermissionSetsTable.tsx
│       ├── ReportAccessMatrix.tsx
│       ├── SetupWizard.tsx
│       ├── TenantSwitcher.tsx
│       └── PermissionsHub.tsx
├── store/
│   └── usePermissionsStore.ts  # Zustand store
├── lib/
│   └── utils.ts           # Utility functions
├── mockAzureAD.ts         # Mock Azure AD data
└── permissions_hub_starter.jsx  # Original starter file
```

## Key Components

### PermissionsHub
The main component that orchestrates all features and manages the overall application state.

### GroupsTable
Displays Azure AD groups with:
- Transitive member counts
- Group type badges (Security vs M365)
- Dynamic group indicators
- Guest user counts
- Effective permission sets

### PermissionSetsTable
Manages permission sets with:
- CRUD operations
- Capability toggles
- Usage validation
- In-use protection

### ReportAccessMatrix
Shows the access matrix with:
- Group vs Report permissions
- Inheritance vs Override badges
- Bulk assignment tools
- Cell-level override controls

### SetupWizard
3-step guided setup:
1. Group selection
2. Permission assignment
3. Configuration review

## Mock Data

The application uses realistic mock Azure AD data including:
- Multiple tenants (Contoso, Fabrikam)
- Various group types (Security, M365, Dynamic)
- Guest users with `#EXT#` UPN format
- Nested group structures
- Permission sets and assignments

## State Management

The application uses Zustand for state management with the following key state:
- Current tenant selection
- Permission sets (CRUD operations)
- Group assignments (tenant and report level)
- Selected items for bulk operations
- Setup wizard state
- Audit view state

## Azure AD Integration Points

The mock data structure closely mirrors Microsoft Graph API:
- User and Group objects with proper typing
- Transitive membership resolution
- Effective permission calculation
- RLS role support

## Future Enhancements

This prototype is designed to be easily extended with:
- Real Azure AD/Entra ID integration
- Backend API integration
- Advanced audit logging
- Permission templates
- Automated group provisioning
- Compliance reporting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

## License

This project is a prototype for demonstration purposes.