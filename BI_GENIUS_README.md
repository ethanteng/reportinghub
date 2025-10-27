# BI Genius Studio

A modern, three-pane studio interface for building and configuring AI agents for Business Intelligence.

## Overview

BI Genius Studio is a Next.js application that provides a comprehensive workflow for:
- Connecting and syncing data sources (Power BI, SQL, Files, URLs)
- Navigating and configuring semantic models
- Running AI readiness analysis
- Managing multi-level instructions (model, table, column)
- Publishing and cloning agent configurations

## Features

### ✨ Key Highlights

- **Three-Pane Layout**: Left navigation rail, center work area, right inspector panel
- **No Modal Hell**: All editing happens in the inspector panel
- **Multi-Level Instructions**: Add context at model, table, or column level
- **AI Readiness Analyzer**: Scan models for optimization opportunities
- **Visual Hierarchy**: Tree-based navigation with collapsible sections
- **Real-time Sync**: Non-blocking data source synchronization
- **Keyboard Navigation**: Cmd+K search, arrow key navigation
- **Accessibility**: ARIA labels, semantic HTML, keyboard support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
  ├── (studio)/           # Studio layout group
  │   ├── layout.tsx      # Three-pane layout
  │   ├── sources/        # Data sources page
  │   ├── model/          # Semantic model browser
  │   ├── readiness/      # AI readiness analyzer
  │   ├── instructions/   # Instruction management
  │   └── publish/        # Publish & review
  └── page.tsx            # Root redirect

src/
  ├── components/
  │   ├── studio/         # Studio-specific components
  │   └── ui/             # shadcn/ui components
  ├── store/
  │   └── useBiGeniusStore.ts  # Zustand store
  └── lib/
      └── utils.ts        # Utility functions

lib/
  ├── types.ts            # TypeScript definitions
  ├── mockData.ts         # Sample data
  └── mockServices.ts     # Mock API services
```

## Pages & Workflows

### 1. Data Sources (`/sources`)
- Grid view of all connected data sources
- Inline alias editing
- Individual and bulk sync
- Status indicators (Idle, Syncing, Success, Error)

### 2. Model (`/model`)
- Collapsible tree view (Model → Tables → Columns)
- Search and filter
- Breadcrumb navigation
- Inspector shows metadata and relationships

### 3. Readiness (`/readiness`)
- Run AI readiness analysis
- Progress tracking with ETA
- Readiness score (0-100)
- Findings grouped by severity (Blocker, Warning, Info)
- Click finding to navigate to entity

### 4. Instructions (`/instructions`)
- Same tree view as Model
- 🧠 badges indicate items with instructions
- Filter to show only items with instructions
- Add/edit/delete instructions at any level
- Autosave with toast notifications

### 5. Publish (`/publish`)
- Configuration summary cards
- Clone configuration (creates new version)
- Publish agent (generates share link)
- Recommendations if readiness score < 80

## Components

### Core Components

- **StepRail**: Left navigation with status chips
- **InspectorPanel**: Right panel with tabs (Summary, Instructions, Lineage)
- **TreeView**: Hierarchical model navigation
- **Breadcrumbs**: Current selection path
- **SourceCard**: Data source card with sync controls
- **ReadinessRunCard**: Analysis runner with progress
- **FindingList**: Analyzer findings with navigation
- **InstructionEditor**: Multi-level instruction editor

### Shared Components

- **EmptyState**: Empty state placeholders
- **StatusPill**: Status badges with loading states
- **ProgressBar**: Progress indicator with ETA
- **LoadingSkeleton**: Loading skeletons
- **ErrorBoundary**: Error handling

## State Management

Uses Zustand for global state:

```typescript
- dataSources: DataSource[]
- model: SemanticModel
- analyzerRun: AnalyzerRun | null
- agentConfigs: AgentConfig[]
- selectedEntity: SelectedEntity
- selectedSourceIds: ID[]
```

## Mock Data

The application uses in-memory mock data for demonstration:
- 3 data sources (Power BI, SQL, URL)
- 1 semantic model with 2 tables (Sales, Customers)
- Sample analyzer findings
- Pre-configured instructions at all levels

## Keyboard Shortcuts

- **Cmd/Ctrl + K**: Focus search in tree view
- **Enter/Space**: Expand/collapse tree nodes
- **Tab**: Navigate between interactive elements

## Deployment

### Vercel (Recommended)

```bash
# Build command
npm run build

# Output directory
.next
```

The application is optimized for Vercel deployment with:
- Static page generation
- Optimized bundle sizes
- Edge-ready configuration

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted with Node.js

## Design Principles

1. **No Blocking Modals**: Use inspector panel for all editing
2. **Clear State Communication**: Toasts, progress bars, status pills
3. **Visual Hierarchy**: Tree structure, breadcrumbs, badges
4. **Async-First**: All operations non-blocking with progress
5. **Accessibility**: Keyboard nav, ARIA labels, semantic HTML
6. **Compact & Clean**: Efficient space use, consistent styling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

This is a prototype/demo application. For production use:
1. Replace mock services with real API calls
2. Add authentication and authorization
3. Implement data persistence
4. Add error tracking (Sentry, etc.)
5. Add analytics (Mixpanel, Amplitude, etc.)

## License

Proprietary - ReportingHub

## Contact

For questions or support, contact the ReportingHub team.

