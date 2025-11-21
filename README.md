# ReportingHub

A comprehensive platform for Business Intelligence management, featuring two main capabilities: **BI Genius Studio** for building AI-powered BI agents and **Permissions Hub** for multi-tenant BI permissions management. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components.

## Overview

ReportingHub is a modern BI platform that combines:

- **BI Genius Studio**: An AI assistant builder that enables users to create, configure, and deploy AI agents for Business Intelligence. Connect data sources, analyze semantic models, configure instructions, and publish intelligent assistants.

- **Permissions Hub**: A comprehensive multi-tenant permissions management system for BI environments. Manage access control, audit permissions, and ensure compliance across multiple tenants.

## Features

### 🤖 BI Genius Studio

#### AI Agent Management
- Create, configure, and manage multiple AI agents
- Clone and version agent configurations
- Publish agents with shareable links
- Test agents with interactive chat widget
- Custom agent instructions and context

#### Data Source Integration
- Connect Power BI datasets
- Connect SQL databases
- Import files and URLs as data sources
- Real-time data source synchronization
- Alias management for data sources
- Bulk sync operations

#### Semantic Model Browser
- Hierarchical tree view (Models → Tables → Columns)
- Multi-model support with versioning
- AI-generated model narratives
- Model metadata and relationships
- Search and filter capabilities
- Breadcrumb navigation

#### AI Readiness Analysis
- Automated model analysis
- Readiness scoring (0-100)
- Findings grouped by severity (Blocker, Warning, Info)
- Progress tracking with ETA
- Click-to-navigate from findings to entities

#### Multi-Level Instructions
- Add instructions at model, table, or column level
- Visual badges indicating items with instructions
- Filter to show only configured items
- Autosave with toast notifications
- Instruction history tracking

#### Agent Publishing
- Configuration summary cards
- Clone configurations (creates new versions)
- Publish agents (generates share link)
- Readiness recommendations
- Status management (Draft, Live)

### 🔐 Permissions Hub

#### Multi-Tenant Support
- Switch between different Azure AD tenants
- Isolated permission management per tenant
- Tenant-specific group and user management

#### Users & Groups Management
- View Azure AD groups with transitive member counts
- Support for Security groups and Microsoft 365 groups
- Dynamic group detection with membership rules
- Guest user identification and counting
- Nested group support with proper member resolution

#### Permission Sets
- Create, edit, and delete permission sets
- Granular capability management (view, edit, admin, export)
- Usage tracking and validation
- Prevent deletion of in-use permission sets

#### Report Access Matrix
- Visual matrix showing group access to reports
- Inheritance vs Override visualization
- Bulk assignment operations
- Row-Level Security (RLS) role support
- Real-time effective permission calculation

#### Audit & Compliance
- "Who can see this report?" audit view
- Detailed access breakdown by group
- Inheritance source tracking
- Guest user visibility

#### Setup Wizard
- 3-step guided configuration
- Group selection and import
- Default permission assignment
- Configuration review and application

### 🎨 Modern UI/UX
- Built with shadcn/ui components
- Responsive design with Tailwind CSS
- Clean, professional interface
- Accessible and keyboard-navigable
- Three-pane studio layout (navigation, work area, inspector)
- No modal hell - all editing in inspector panel

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theming**: next-themes

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

### Navigation

The application has the following main routes:

- **`/`** - Redirects to `/agents`
- **`/agents`** - BI Genius Studio: Manage AI agents
- **`/sources`** - BI Genius Studio: Connect and sync data sources
- **`/model`** - BI Genius Studio: Browse semantic models and configure instructions
- **`/readiness`** - BI Genius Studio: Run AI readiness analysis
- **`/publish`** - BI Genius Studio: Review and publish agents
- **`/permissions`** - Permissions Hub: Multi-tenant permissions management

### Project Structure

```
reportinghub/
├── app/                          # Next.js app directory
│   ├── (studio)/                 # Studio layout group
│   │   ├── layout.tsx           # Three-pane studio layout
│   │   ├── sources/             # Data sources page
│   │   ├── model/               # Semantic model browser
│   │   ├── readiness/           # AI readiness analyzer
│   │   └── publish/             # Publish & review
│   ├── agents/                  # Agents management page
│   ├── permissions/             # Permissions Hub page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (redirects to /agents)
├── src/
│   ├── components/
│   │   ├── studio/              # BI Genius Studio components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentChatWidget.tsx
│   │   │   ├── SourceCard.tsx
│   │   │   ├── MultiModelTreeView.tsx
│   │   │   ├── InspectorPanel.tsx
│   │   │   ├── StepRail.tsx
│   │   │   ├── ReadinessRunCard.tsx
│   │   │   ├── FindingList.tsx
│   │   │   └── ...
│   │   ├── features/
│   │   │   └── permissions-hub/ # Permissions Hub components
│   │   │       ├── components/
│   │   │       │   ├── PermissionsHub.tsx
│   │   │       │   ├── GroupsTable.tsx
│   │   │       │   ├── PermissionSetsTable.tsx
│   │   │       │   ├── ReportAccessMatrix.tsx
│   │   │       │   ├── SetupWizard.tsx
│   │   │       │   └── TenantSwitcher.tsx
│   │   │       └── modals/
│   │   └── ui/                  # shadcn/ui components
│   ├── store/
│   │   ├── useBiGeniusStore.ts  # BI Genius Studio state
│   │   └── usePermissionsStore.ts  # Permissions Hub state
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── hooks/
│   │   └── usePermissions.ts    # Permissions hooks
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── constants/
│       └── index.ts             # Constants
├── lib/                          # Root-level lib
│   ├── types.ts                 # Shared types
│   ├── mockData.ts              # Mock data
│   └── mockServices.ts          # Mock API services
├── scripts/                      # Utility scripts
├── public/                      # Static assets
└── package.json
```

## Key Components

### BI Genius Studio Components

#### AgentCard
Displays agent information with:
- Agent name and subheader
- Status badges (Draft, Live)
- Action buttons (Configure, Test, Clone, Delete, Publish)
- Suggested prompts management

#### SourceCard
Data source card with:
- Connection status indicators
- Sync controls
- Alias editing
- Status badges (Idle, Syncing, Success, Error)

#### MultiModelTreeView
Hierarchical model browser with:
- Collapsible tree structure
- Search and filter
- Instruction badges
- Entity selection
- Breadcrumb navigation

#### InspectorPanel
Right-side panel with:
- Summary tab (metadata, relationships)
- Instructions tab (multi-level editing)
- Lineage tab (data lineage visualization)

#### StepRail
Left navigation rail with:
- Step indicators
- Status chips
- Navigation between studio pages

#### ReadinessRunCard
AI readiness analyzer with:
- Progress tracking
- ETA display
- Readiness score
- Findings list

### Permissions Hub Components

#### PermissionsHub
The main component that orchestrates all features and manages the overall application state.

#### GroupsTable
Displays Azure AD groups with:
- Transitive member counts
- Group type badges (Security vs M365)
- Dynamic group indicators
- Guest user counts
- Effective permission sets

#### PermissionSetsTable
Manages permission sets with:
- CRUD operations
- Capability toggles
- Usage validation
- In-use protection

#### ReportAccessMatrix
Shows the access matrix with:
- Group vs Report permissions
- Inheritance vs Override badges
- Bulk assignment tools
- Cell-level override controls

#### SetupWizard
3-step guided setup:
1. Group selection
2. Permission assignment
3. Configuration review

## State Management

The application uses Zustand for state management with two main stores:

### BI Genius Studio Store (`useBiGeniusStore`)
- Data sources (CRUD operations)
- Semantic models
- Analyzer runs
- Agent configurations
- Selected entities
- Instruction management

### Permissions Hub Store (`usePermissionsStore`)
- Current tenant selection
- Permission sets (CRUD operations)
- Group assignments (tenant and report level)
- Selected items for bulk operations
- Setup wizard state
- Audit view state

## Mock Data

### BI Genius Studio
The application uses in-memory mock data for demonstration:
- 3 data sources (Power BI, SQL, URL)
- Semantic models with tables and columns
- Sample analyzer findings
- Pre-configured instructions at all levels

### Permissions Hub
The application uses realistic mock Azure AD data including:
- Multiple tenants (Contoso, Fabrikam)
- Various group types (Security, M365, Dynamic)
- Guest users with `#EXT#` UPN format
- Nested group structures
- Permission sets and assignments

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run setup script
- `npm run clean` - Clean and reinstall dependencies

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

## 🚀 Deployment

This project is automatically deployed to Vercel on every push to the `main` branch.

- **Live URL**: https://reportinghub-d6te0a28y-ethan-tengs-projects-f09c66fd.vercel.app
- **Status**: ✅ Auto-deployment enabled

## 📚 Documentation

Comprehensive documentation is available for planning, development, and deployment:

### **For Stakeholders & Decision Makers**
- **[📊 STAKEHOLDER_SUMMARY.md](./STAKEHOLDER_SUMMARY.md)** - Business case, ROI analysis, and investment options
- **[🗺️ ROADMAP_SUMMARY.md](./ROADMAP_SUMMARY.md)** - Visual roadmap, timeline, and team sizing

### **For Product & Project Managers**
- **[📋 EPICS_AND_MILESTONES.md](./EPICS_AND_MILESTONES.md)** - Detailed feature breakdown with user stories (30 pages)
- **[🎯 FEATURE_MAP.md](./FEATURE_MAP.md)** - Architecture diagrams and workflows

### **For Developers**
- **[🏗️ STRUCTURE.md](./STRUCTURE.md)** - Code organization and best practices
- **[📖 README.md](./README.md)** - This file (setup and tech stack)
- **[🤖 LLM_PROTOTYPE_REFERENCE.md](./LLM_PROTOTYPE_REFERENCE.md)** - Complete technical reference for AI/LLM (100+ pages)
- **[🤖 BI_GENIUS_README.md](./BI_GENIUS_README.md)** - BI Genius Studio detailed documentation

### **Navigation**
- **[📚 DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete guide to all documentation

**Quick Links:**
- 🚀 [MVP Definition (2 months)](./ROADMAP_SUMMARY.md#mvp-definition-minimum-viable-product)
- 💰 [ROI Analysis](./STAKEHOLDER_SUMMARY.md#investment--roi)
- 📅 [10 Milestone Roadmap](./ROADMAP_SUMMARY.md#10-milestone-roadmap)
- 🎯 [Success Metrics](./EPICS_AND_MILESTONES.md#overall-success-metrics)

---

## Future Enhancements

### BI Genius Studio
- Real API integrations (Power BI Service API, SQL connections)
- Advanced AI model selection
- Custom instruction templates
- Agent analytics and usage tracking
- Multi-language support

### Permissions Hub
- Real Azure AD/Entra ID integration
- Backend API integration
- Advanced audit logging
- Permission templates
- Automated group provisioning
- Compliance reporting

## License

This project is a prototype for demonstration purposes.
