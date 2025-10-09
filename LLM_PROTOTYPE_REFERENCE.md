# ReportingHub Prototype - LLM Technical Reference

## 🤖 **Purpose**
This document provides a comprehensive technical reference of ALL implemented functionality in the ReportingHub prototype. It is designed for LLM consumption to enable accurate code generation, modifications, and technical discussions.

**Last Updated:** October 9, 2025  
**Prototype Version:** 0.1.0  
**Status:** Fully functional frontend prototype with mock data

---

## 📦 **Tech Stack**

### **Core Framework**
- **Next.js:** 14.2.32 (App Router)
- **React:** 18.2.0
- **TypeScript:** 5.0.0
- **Node.js:** 20+

### **Styling**
- **Tailwind CSS:** 3.3.0
- **tailwindcss-animate:** 1.0.7
- **PostCSS:** 8.4.0
- **Autoprefixer:** 10.4.0

### **UI Components**
- **shadcn/ui:** Based on Radix UI primitives
- **Radix UI packages:**
  - @radix-ui/react-checkbox: 1.3.3
  - @radix-ui/react-dialog: 1.0.5
  - @radix-ui/react-dropdown-menu: 2.0.6
  - @radix-ui/react-label: 2.0.2
  - @radix-ui/react-popover: 1.0.7
  - @radix-ui/react-progress: 1.1.7
  - @radix-ui/react-radio-group: 1.1.3
  - @radix-ui/react-select: 2.0.0
  - @radix-ui/react-separator: 1.0.3
  - @radix-ui/react-slot: 1.0.2
  - @radix-ui/react-switch: 1.0.3
  - @radix-ui/react-tabs: 1.0.4
  - @radix-ui/react-toast: 1.1.5
  - @radix-ui/react-tooltip: 1.0.7
- **lucide-react:** 0.294.0 (icons)

### **State Management**
- **Zustand:** 4.4.0

### **Utilities**
- **class-variance-authority:** 0.7.0 (CVA for component variants)
- **clsx:** 2.0.0 (conditional classes)
- **tailwind-merge:** 2.0.0 (merge Tailwind classes)

---

## 🏗️ **Project Structure**

```
reportinghub/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles + Tailwind imports
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Home page (renders PermissionsHub)
│
├── src/                         # Source code (organized)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components (14 components)
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── features/
│   │   │   ├── permissions-hub/
│   │   │   │   ├── components/
│   │   │   │   │   ├── GroupRoleWizard.tsx        # Main setup wizard
│   │   │   │   │   ├── GroupsTable.tsx            # Groups list
│   │   │   │   │   ├── PermissionSetsTable.tsx    # Permission sets CRUD
│   │   │   │   │   ├── PermissionsHub.tsx         # Main container
│   │   │   │   │   ├── ReportAccessMatrix.tsx     # Access matrix (legacy)
│   │   │   │   │   ├── ReportAccessMatrixSidebar.tsx  # New matrix with sidebar
│   │   │   │   │   ├── SetupWizard.tsx            # Original wizard (hidden)
│   │   │   │   │   └── TenantSwitcher.tsx         # Tenant dropdown
│   │   │   │   ├── modals/
│   │   │   │   │   ├── AssignTenantSetModal.tsx   # Assign permission set
│   │   │   │   │   ├── AuditViewModal.tsx         # "Who can see?" modal
│   │   │   │   │   ├── EditPermissionSetModal.tsx # Edit permission set
│   │   │   │   │   └── OverrideReportAccessModal.tsx  # Override permissions
│   │   │   │   ├── hooks/                         # (empty, reserved)
│   │   │   │   ├── index.ts                       # Clean exports
│   │   │   │   └── permissions_hub_starter.jsx    # Original prototype
│   │   │   │
│   │   │   ├── navigation-hub/                    # (empty, reserved)
│   │   │   └── shared/                            # (placeholder)
│   │   │       ├── forms/
│   │   │       └── layout/
│   │   │
│   │   └── layout/                                # (empty, reserved)
│   │
│   ├── hooks/
│   │   └── usePermissions.ts                      # Custom permissions hooks
│   │
│   ├── lib/
│   │   └── utils.ts                               # Utility functions (cn)
│   │
│   ├── store/
│   │   └── usePermissionsStore.ts                 # Zustand global state
│   │
│   ├── types/
│   │   ├── index.ts                               # Type re-exports
│   │   └── mockAzureAD.ts                         # Mock data + types (1024 lines)
│   │
│   ├── utils/
│   │   └── index.ts                               # Helper functions
│   │
│   └── constants/
│       └── index.ts                               # App constants
│
├── public/
│   └── reporting_hub_integrated.html              # Original HTML prototype
│
├── scripts/                                        # Build scripts
│   ├── dev.sh
│   ├── fix-all-imports.sh
│   ├── fix-imports.js
│   ├── setup.sh
│   └── update-imports.sh
│
├── next.config.js                                  # Next.js configuration
├── tailwind.config.js                              # Tailwind configuration
├── tsconfig.json                                   # TypeScript configuration
├── postcss.config.js                               # PostCSS configuration
└── package.json                                    # Dependencies
```

---

## 🗃️ **Data Models & Types**

### **Core Types (src/types/mockAzureAD.ts)**

#### **Guid**
```typescript
export type Guid = string;
```

#### **DirectoryObjectRef**
```typescript
export type DirectoryObjectRef = { 
  "@odata.type": "#microsoft.graph.directoryObject"; 
  id: Guid 
};
```

#### **AadUser**
```typescript
export interface AadUser {
  "@odata.type": "#microsoft.graph.user";
  id: Guid;
  displayName: string;
  mail?: string;                    // May be undefined for guests
  userPrincipalName: string;        // e.g. alice@contoso.com or bob_outlook.com#EXT#@contoso.onmicrosoft.com
  mailNickname?: string;
  givenName?: string;
  surname?: string;
  accountEnabled: boolean;
}
```

**Guest User Detection:** UPN contains `#EXT#`

#### **AadGroup**
```typescript
export interface AadGroup {
  "@odata.type": "#microsoft.graph.group";
  id: Guid;
  displayName: string;
  mailNickname?: string;
  mail?: string;
  description?: string;
  securityEnabled: boolean;         // true for Security groups
  groupTypes: string[];             // [] for Security, ["Unified"] for M365
  visibility?: "Private" | "Public";
  membershipRule?: string;          // Present for dynamic groups
  membershipRuleProcessingState?: "On" | "Paused";
  members: DirectoryObjectRef[];    // Users and/or groups (transitive)
  owners?: DirectoryObjectRef[];
}
```

**Group Type Detection:**
- Security Group: `securityEnabled: true, groupTypes: []`
- M365 Group: `groupTypes: ["Unified"]`
- Dynamic Group: `membershipRule` is present

#### **Tenant**
```typescript
export interface Tenant {
  tenantId: Guid;
  defaultDomainName: string;        // e.g. contoso.onmicrosoft.com
  displayName: string;
  verifiedDomains: string[];        // e.g. ["contoso.com"]
  users: AadUser[];
  groups: AadGroup[];
}
```

#### **PermissionLevel** (Type Alias)
```typescript
export type PermissionLevel = 
  | "Viewer" 
  | "Editor" 
  | "Admin" 
  | "Finance Analyst" 
  | "Executive Dashboard" 
  | "Data Scientist" 
  | "Guest Limited" 
  | "Marketing Team" 
  | "Audit Read-Only";
```

#### **PermissionSet**
```typescript
export interface PermissionSet {
  id: string;                       // e.g. "ps_viewer"
  name: string;                     // Can be custom (e.g. "Viewer (Copy)")
  description: string;
  capabilities: {
    allowEditAndSave: boolean;
    allowEditAndSaveAs: boolean;
    allowExportReport: boolean;
    allowSharingReport: boolean;
    allowSemanticModelRefresh: boolean;
    allowSchedulingTasks: boolean;
    allowAccessToBIGenius: boolean;
    allowAccessToBIGeniusQueryDeepDive: boolean;
  };
}
```

**Power BI Capability Mapping:** These capabilities map directly to Power BI permissions.

#### **ReportRef**
```typescript
export interface ReportRef {
  id: string;
  name: string;
  path: string;                     // Logical path in ReportingHub
  dataset?: string;                 // Power BI dataset id/name
  rlsRoles?: string[];              // Available RLS roles
}
```

#### **GroupAssignment**
```typescript
export interface GroupAssignment {
  tenantId: Guid;
  aadGroupId: Guid;                 // AAD group being assigned
  permissionSetId: string;          // Which PermissionSet
  scope: "Tenant" | "Folder" | "Report";
  targetId?: string;                // folderId or reportId for scoped overrides
  rlsRole?: string;                 // Optional RLS role
  inherited?: boolean;              // Computed flag for UI
}
```

**Assignment Scopes:**
- `"Tenant"` - Default permission for all reports
- `"Report"` - Override for specific report (targetId = reportId)
- `"Folder"` - Future use

**Inheritance Logic:**
- Report-level assignment overrides tenant-level
- If no report-level exists, inherit from tenant-level

---

## 🎨 **UI Components Library**

### **Base Components (src/components/ui/)**

All components use CVA (class-variance-authority) for variants and are fully typed.

#### **1. Button (button.tsx)**
```typescript
interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  // ...extends React.ButtonHTMLAttributes
}
```

**Usage:**
```tsx
<Button variant="outline">Click me</Button>
<Button size="sm" variant="destructive">Delete</Button>
```

#### **2. Card (card.tsx)**
Components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### **3. Dialog (dialog.tsx)**
Components: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

**Usage:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### **4. Tabs (tabs.tsx)**
Components: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

**Usage:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### **5. Table (table.tsx)**
Components: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`

**Usage:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### **6. Badge (badge.tsx)**
```typescript
interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline"
}
```

#### **7. Checkbox (checkbox.tsx)**
Radix UI checkbox with custom styling.

#### **8. Input (input.tsx)**
Standard text input with Tailwind styling.

#### **9. Label (label.tsx)**
Form label component.

#### **10. Progress (progress.tsx)**
Progress bar for loading states.

#### **11. Radio Group (radio-group.tsx)**
Components: `RadioGroup`, `RadioGroupItem`

#### **12. Select (select.tsx)**
Components: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`

#### **13. Tooltip (tooltip.tsx)**
Components: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

#### **14. Alert (alert.tsx)**
Components: `Alert`, `AlertTitle`, `AlertDescription`

---

## 🧩 **Feature Components**

### **1. PermissionsHub (Main Container)**

**File:** `src/components/features/permissions-hub/components/PermissionsHub.tsx`

**Purpose:** Main orchestrator component that renders the entire permissions management interface.

**State:**
```typescript
const {
  currentTenantId,
  setCurrentTenantId,
  permissionSets,
  assignments,
  setupWizardOpen,
  setSetupWizardOpen,
  groupRoleWizardOpen,
  setGroupRoleWizardOpen
} = usePermissionsStore()
```

**Structure:**
```tsx
<div className="p-6 space-y-4">
  <header>
    <h1>Permissions Hub</h1>
    <TenantSwitcher />
    <Button onClick={() => setGroupRoleWizardOpen(true)}>
      Permissions Setup Wizard
    </Button>
  </header>

  <Tabs defaultValue="groups">
    <TabsList>
      <TabsTrigger value="reports">Report Access</TabsTrigger>
      <TabsTrigger value="groups">Users & Groups</TabsTrigger>
      <TabsTrigger value="sets">Permission Sets</TabsTrigger>
    </TabsList>

    <TabsContent value="reports">
      <ReportAccessMatrixSidebar />
    </TabsContent>

    <TabsContent value="groups">
      <GroupsTable />
    </TabsContent>

    <TabsContent value="sets">
      <PermissionSetsTable />
    </TabsContent>
  </Tabs>

  <SetupWizard /> {/* Hidden by default */}
  <GroupRoleWizard />
</div>
```

**Features:**
- Tab-based navigation
- Tenant context display
- Wizard launch buttons
- Responsive layout

---

### **2. TenantSwitcher**

**File:** `src/components/features/permissions-hub/components/TenantSwitcher.tsx`

**Purpose:** Dropdown to switch between multiple Azure AD tenants.

**State:**
```typescript
const { currentTenantId, setCurrentTenantId } = usePermissionsStore()
```

**Mock Data:**
- Contoso Ltd (default)
- Fabrikam Inc

**UI:**
```tsx
<Select value={currentTenantId} onValueChange={setCurrentTenantId}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {tenants.map(tenant => (
      <SelectItem value={tenant.tenantId}>
        {tenant.displayName} ({tenant.defaultDomainName})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### **3. PermissionSetsTable**

**File:** `src/components/features/permissions-hub/components/PermissionSetsTable.tsx`

**Purpose:** CRUD interface for permission sets with granular capability management.

**State:**
```typescript
const { 
  permissionSets, 
  addPermissionSet, 
  updatePermissionSet, 
  deletePermissionSet,
  assignments 
} = usePermissionsStore()
```

**Features:**

1. **Display Permission Sets**
   - Table with columns: Name, Description, Capabilities, Usage, Actions
   - Capability badges (8 toggles visualized)
   - Usage count (how many assignments use this set)

2. **Create Permission Set**
   - Modal with form
   - Name, description fields
   - 8 capability checkboxes:
     - Allow Edit and Save
     - Allow Edit and Save As
     - Allow Export Report
     - Allow Sharing Report
     - Allow Semantic Model Refresh
     - Allow Scheduling Tasks
     - Allow Access to BI Genius
     - Allow Access to BI Genius Query Deep Dive
   - Generate unique ID (`ps_${name.toLowerCase().replace(/\s+/g, '_')}`)

3. **Edit Permission Set**
   - Opens `EditPermissionSetModal`
   - Pre-populates all fields
   - Updates in Zustand store

4. **Delete Permission Set**
   - Validation: Check if in use via `isPermissionSetInUse()`
   - If in use, show alert: "Cannot delete: X assignments use this set"
   - If not in use, confirm and delete

5. **Clone Permission Set**
   - Creates copy with "(Copy)" suffix
   - Generates new unique ID

**Capabilities Object:**
```typescript
{
  allowEditAndSave: false,
  allowEditAndSaveAs: false,
  allowExportReport: true,
  allowSharingReport: true,
  allowSemanticModelRefresh: false,
  allowSchedulingTasks: false,
  allowAccessToBIGenius: false,
  allowAccessToBIGeniusQueryDeepDive: false
}
```

**Mock Permission Sets:**
- Viewer (ps_viewer)
- Editor (ps_editor)
- Admin (ps_admin)
- Finance Analyst (ps_finance_analyst)
- Executive Dashboard (ps_executive_dashboard)
- Data Scientist (ps_data_scientist)
- Guest Limited (ps_guest_limited)
- Marketing Team (ps_marketing_team)
- Audit Read-Only (ps_audit_readonly)

---

### **4. GroupsTable**

**File:** `src/components/features/permissions-hub/components/GroupsTable.tsx`

**Purpose:** Display Azure AD groups with metadata and effective permissions.

**Props:**
```typescript
interface GroupsTableProps {
  tenant: Tenant
}
```

**Features:**

1. **Display Groups**
   - Table columns:
     - Group Name
     - Description
     - Type (Security, M365, Dynamic)
     - Members (transitive count)
     - Guest Users (count)
     - Effective Permission Set
     - Actions

2. **Group Type Badges**
   - Security Group: Blue badge
   - M365 Group: Green badge
   - Dynamic Group: Purple badge with "⚡ Dynamic" indicator

3. **Member Count**
   - Shows transitive member count
   - Resolves nested groups recursively
   - Identifies guest users (UPN contains `#EXT#`)

4. **Effective Permission Set**
   - Shows tenant-level assignment
   - Badge with permission set name
   - "Not Assigned" if no assignment

5. **Actions**
   - Assign Permission Set button → Opens `AssignTenantSetModal`

**Member Resolution Logic:**
```typescript
const getTransitiveMemberCount = (group: AadGroup, tenant: Tenant): number => {
  const resolvedIds = new Set<Guid>()
  const resolveMembers = (memberRefs: DirectoryObjectRef[]) => {
    memberRefs.forEach(ref => {
      if (resolvedIds.has(ref.id)) return
      resolvedIds.add(ref.id)
      
      // Check if it's a group
      const nestedGroup = tenant.groups.find(g => g.id === ref.id)
      if (nestedGroup) {
        resolveMembers(nestedGroup.members) // Recursive
      }
    })
  }
  resolveMembers(group.members)
  return resolvedIds.size
}
```

**Guest User Count:**
```typescript
const getGuestUserCount = (group: AadGroup, tenant: Tenant): number => {
  // Resolve all transitive members
  // Filter users where UPN includes '#EXT#'
  return guestUsers.length
}
```

---

### **5. ReportAccessMatrixSidebar**

**File:** `src/components/features/permissions-hub/components/ReportAccessMatrixSidebar.tsx`

**Purpose:** New unified interface for managing report access with sidebar for assignees.

**Props:**
```typescript
interface ReportAccessMatrixSidebarProps {
  tenant: Tenant
  reports: ReportRef[]
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Report Access Management                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Sidebar: 30%]          │  [Main Content: 70%]         │
│                          │                               │
│  Search: [________]      │  Reports (expandable cards)  │
│                          │                               │
│  Tabs: [Users][Groups]   │  ┌──────────────────────┐   │
│                          │  │ Sales Dashboard      │   │
│  ☐ Alice Wong           │  │ ─ Finance Team: View │   │
│  ☐ Ben King             │  │ ─ Executives: Edit   │   │
│  ☐ Finance Team         │  └──────────────────────┘   │
│  ☐ Executives           │                               │
│                          │  ┌──────────────────────┐   │
│  Permission Set:         │  │ Q4 Financial         │   │
│  [Viewer ▾]             │  │ ─ Finance: View      │   │
│                          │  │ ─ Audit: Read-Only   │   │
│  [Assign to Selected     │  └──────────────────────┘   │
│   Reports]               │                               │
│                          │                               │
└──────────────────────────┴───────────────────────────────┘
```

**State:**
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [selectedTab, setSelectedTab] = useState<'users' | 'groups'>('users')
const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set())
const [selectedPermissionSet, setSelectedPermissionSet] = useState('ps_viewer')
const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())
```

**Features:**

1. **Sidebar (Left 30%)**
   - Search bar for users/groups
   - Tabs: Users | Groups
   - Checkbox list of all users/groups
   - Multi-select support
   - Permission set dropdown
   - "Assign to Selected Reports" button

2. **Main Content (Right 70%)**
   - List of all reports as expandable cards
   - Each report card shows:
     - Report name
     - Expand/collapse button
     - When expanded:
       - All users/groups with access
       - Their permission set
       - Source (inherited/override)
       - RLS role (if any)
   - Click report to expand
   - "Audit" button → Opens `AuditViewModal`

3. **Assignment Flow**
   - Select users/groups from sidebar (checkboxes)
   - Select permission set from dropdown
   - Click on a report in main area (auto-selects it)
   - Click "Assign to Selected Reports"
   - Creates assignments for all selected users/groups

4. **Data Structure**
   ```typescript
   interface Assignment {
     id: string
     type: 'user' | 'group'
     name: string
     email?: string
     description?: string
     memberCount?: number
   }
   
   interface ReportSummary {
     report: ReportRef
     assignments: {
       user: Assignment
       permissionSet: string
     }[]
     groupAssignments: {
       group: Assignment
       permissionSet: string
     }[]
   }
   ```

---

### **6. GroupRoleWizard**

**File:** `src/components/features/permissions-hub/components/GroupRoleWizard.tsx`

**Purpose:** 3-step wizard for bulk group selection and permission assignment with Azure AD sync simulation.

**Props:**
```typescript
interface GroupRoleWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
}
```

**State:**
```typescript
const [currentStep, setCurrentStep] = useState(1)
const [selectedGroups, setSelectedGroups] = useState<Guid[]>([])
const [groupAssignments, setGroupAssignments] = useState<Record<Guid, string>>({})
const [bulkPermissionSet, setBulkPermissionSet] = useState('')
const [bulkSelectedGroups, setBulkSelectedGroups] = useState<Guid[]>([])

// Search and sync
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState<AadGroup[]>([])
const [isSearching, setIsSearching] = useState(false)
const [isSyncing, setIsSyncing] = useState(false)
const [syncProgress, setSyncProgress] = useState(0)
const [allGroups, setAllGroups] = useState<AadGroup[]>([])
const [hasSynced, setHasSynced] = useState(false)
```

**Step 1: Select Groups**

Features:
- "Sync from Azure AD" button
- Mock sync simulation:
  - Generates 1000 mock groups
  - Progress bar (0-100%)
  - Simulates batches of 50 groups
  - Takes ~10 seconds
- Search functionality:
  - Live search across group names
  - Filters as you type
  - Highlights matches
- Checkbox selection:
  - Individual group selection
  - Select all visible
  - Multi-select support
- Visual feedback:
  - Selected count badge
  - Group metadata (type, description)

**Mock Group Generation:**
```typescript
const generateMockGroups = (count: number): AadGroup[] => {
  const departments = ['IT', 'Sales', 'Marketing', 'HR', 'Finance', ...]
  const roles = ['Administrators', 'Managers', 'Specialists', ...]
  const locations = ['North', 'South', 'East', 'West', ...]
  
  return Array.from({ length: count }, (_, i) => ({
    "@odata.type": "#microsoft.graph.group",
    id: `mock-group-${i + 1}`,
    displayName: `${departments[i % ...]} ${roles[i % ...]} ${locations[i % ...]}`,
    description: `...`,
    securityEnabled: Math.random() > 0.2,
    groupTypes: Math.random() > 0.7 ? ['Unified'] : [],
    members: []
  }))
}
```

**Sync Simulation:**
```typescript
const mockSyncGroups = async () => {
  setIsSyncing(true)
  setSyncProgress(0)
  
  const totalGroups = 1000
  const batchSize = 50
  const allMockGroups: AadGroup[] = []
  
  for (let i = 0; i < totalGroups; i += batchSize) {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API call
    
    const batch = generateMockGroups(batchSize)
    allMockGroups.push(...batch)
    
    setSyncProgress(Math.min(((i + batchSize) / totalGroups) * 100, 100))
  }
  
  setAllGroups(allMockGroups)
  setHasSynced(true)
  setIsSyncing(false)
  setLastGroupSyncTime(new Date())
}
```

**Step 2: Assign Permission Sets**

Layout:
```
┌─────────────────────────────────────────────────────┐
│  Quick Actions: (Collapsible)                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ Select Groups: [☐☐☐☐☐] (5 selected)          │  │
│  │ Permission Set: [Viewer ▾]                    │  │
│  │ [Bulk Assign]                                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Individual Assignments:                             │
│  ┌───────────────────────────────────────────────┐  │
│  │ IT Administrators                              │  │
│  │ Permission Set: [Admin ▾]                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Finance Team                                   │  │
│  │ Permission Set: [Editor ▾]                    │  │
│  └───────────────────────────────────────────────┘  │
│  ...                                                 │
└─────────────────────────────────────────────────────┘
```

Features:
- Quick Actions (collapsible section):
  - Checkboxes to select multiple groups
  - Dropdown to choose permission set
  - "Bulk Assign" button
  - Quick action buttons: "Set All to Viewer", "Set All to Editor"
- Individual dropdowns for each selected group
- Visual indicator of assigned vs. unassigned

**Step 3: Review & Apply**

Display:
```
Summary:
• 15 groups selected
• 3 different permission sets assigned
• ~347 users affected (estimated)

Groups by Permission Set:
┌─────────────────────────────────────┐
│ Admin (1 group)                     │
│ • IT Administrators (12 members)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Editor (8 groups)                   │
│ • Finance Team (25 members)         │
│ • Sales Team (45 members)           │
│ ...                                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Viewer (6 groups)                   │
│ • Marketing Team (30 members)       │
│ ...                                 │
└─────────────────────────────────────┘

[Cancel] [Apply Changes]
```

**Apply Logic:**
```typescript
const handleApply = () => {
  Object.entries(groupAssignments).forEach(([groupId, permissionSetId]) => {
    addAssignment({
      tenantId: tenant.tenantId,
      aadGroupId: groupId,
      permissionSetId,
      scope: "Tenant"
    })
  })
  
  // Reset wizard state
  setCurrentStep(1)
  setSelectedGroups([])
  setGroupAssignments({})
  onOpenChange(false)
}
```

---

### **7. SetupWizard (Legacy)**

**File:** `src/components/features/permissions-hub/components/SetupWizard.tsx`

**Note:** This wizard is currently HIDDEN in the UI (commented out in PermissionsHub). It's the original 3-step wizard. GroupRoleWizard is the newer, enhanced version.

**Structure:** Similar to GroupRoleWizard but:
- Uses tenant.groups directly (no sync)
- Simpler UI
- Less advanced search

---

### **8. ReportAccessMatrix (Legacy)**

**File:** `src/components/features/permissions-hub/components/ReportAccessMatrix.tsx`

**Note:** This is the original grid-based matrix. ReportAccessMatrixSidebar is the newer version currently in use.

**Layout:** Traditional grid with:
- Rows = Groups
- Columns = Reports
- Cells = Permission badges

---

## 🔧 **Modals**

### **1. EditPermissionSetModal**

**File:** `src/components/features/permissions-hub/modals/EditPermissionSetModal.tsx`

**Props:**
```typescript
interface EditPermissionSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissionSet: PermissionSet | null
}
```

**Features:**
- Edit name, description
- Toggle 8 capabilities via checkboxes
- Save updates to Zustand store
- Validation: Name required, must be unique

---

### **2. AssignTenantSetModal**

**File:** `src/components/features/permissions-hub/modals/AssignTenantSetModal.tsx`

**Props:**
```typescript
interface AssignTenantSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: AadGroup | null
  tenantId: Guid
}
```

**Purpose:** Assign or update tenant-level permission set for a group.

**Features:**
- Shows group name
- Dropdown to select permission set
- "Assign" or "Update" button
- Creates/updates assignment in Zustand store

**Logic:**
```typescript
const handleAssign = () => {
  // Check if assignment already exists
  const existing = assignments.find(a => 
    a.tenantId === tenantId && 
    a.aadGroupId === group.id && 
    a.scope === "Tenant"
  )
  
  if (existing) {
    updateAssignment({
      ...existing,
      permissionSetId: selectedPermissionSetId
    })
  } else {
    addAssignment({
      tenantId,
      aadGroupId: group.id,
      permissionSetId: selectedPermissionSetId,
      scope: "Tenant"
    })
  }
}
```

---

### **3. OverrideReportAccessModal**

**File:** `src/components/features/permissions-hub/modals/OverrideReportAccessModal.tsx`

**Props:**
```typescript
interface OverrideReportAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: AadGroup | null
  report: ReportRef | null
  tenantId: Guid
}
```

**Purpose:** Override tenant-level permission for a specific report.

**Features:**
- Shows group and report names
- Displays current tenant-level permission (inherited)
- Dropdown to select override permission set
- Optional RLS role dropdown (if report has rlsRoles)
- "Remove Override" button (if override exists)
- "Apply Override" button

**Logic:**
```typescript
const handleApplyOverride = () => {
  const existing = assignments.find(a =>
    a.tenantId === tenantId &&
    a.aadGroupId === group.id &&
    a.scope === "Report" &&
    a.targetId === report.id
  )
  
  if (existing) {
    updateAssignment({
      ...existing,
      permissionSetId: selectedPermissionSetId,
      rlsRole: selectedRlsRole || undefined
    })
  } else {
    addAssignment({
      tenantId,
      aadGroupId: group.id,
      permissionSetId: selectedPermissionSetId,
      scope: "Report",
      targetId: report.id,
      rlsRole: selectedRlsRole || undefined
    })
  }
}
```

---

### **4. AuditViewModal**

**File:** `src/components/features/permissions-hub/modals/AuditViewModal.tsx`

**Props:**
```typescript
interface AuditViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportRef | null
  tenant: Tenant
}
```

**Purpose:** "Who can see this report?" - Shows all users/groups with access.

**Features:**

1. **Summary Stats**
   - Total users with access
   - Guest user count
   - Number of groups
   - Number of permission sets

2. **Access Breakdown**
   - Lists all groups with access
   - For each group:
     - Group name and type
     - Member count
     - Permission set name
     - Source: "Inherited" (tenant-level) or "Override" (report-level)
     - RLS role (if assigned)
     - Nested groups (transitive members)
   - Guest users highlighted in red

3. **User Expansion**
   - Click group to expand and see all members
   - Recursive resolution of nested groups
   - Guest user badges

**Access Calculation Logic:**
```typescript
const getGroupsWithAccess = () => {
  // Find all groups with tenant-level assignments
  const tenantAssignments = assignments.filter(a =>
    a.tenantId === tenant.tenantId &&
    a.scope === "Tenant"
  )
  
  // Find all groups with report-level overrides
  const reportAssignments = assignments.filter(a =>
    a.tenantId === tenant.tenantId &&
    a.scope === "Report" &&
    a.targetId === report.id
  )
  
  // Combine (report overrides take precedence)
  const groupsWithAccess = new Map()
  
  tenantAssignments.forEach(a => {
    groupsWithAccess.set(a.aadGroupId, {
      ...a,
      inherited: true
    })
  })
  
  reportAssignments.forEach(a => {
    groupsWithAccess.set(a.aadGroupId, {
      ...a,
      inherited: false
    })
  })
  
  return Array.from(groupsWithAccess.values())
}
```

**UI:**
```tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Who can see "{report.name}"?</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>Total Users: 247</div>
        <div>Guest Users: 12</div>
        <div>Groups: 8</div>
        <div>Permission Sets: 3</div>
      </div>
      
      {/* Access List */}
      <div className="space-y-2">
        {groupsWithAccess.map(assignment => {
          const group = tenant.groups.find(g => g.id === assignment.aadGroupId)
          const permissionSet = permissionSets.find(ps => ps.id === assignment.permissionSetId)
          
          return (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{group.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {getMemberCount(group)} members
                      {getGuestCount(group) > 0 && ` • ${getGuestCount(group)} guests`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{permissionSet.name}</Badge>
                    <Badge variant={assignment.inherited ? "secondary" : "default"}>
                      {assignment.inherited ? "Inherited" : "Override"}
                    </Badge>
                    {assignment.rlsRole && (
                      <Badge variant="outline">RLS: {assignment.rlsRole}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

## 🏪 **State Management (Zustand)**

### **Store: usePermissionsStore**

**File:** `src/store/usePermissionsStore.ts`

**Full Interface:**
```typescript
interface PermissionsState {
  // Current tenant
  currentTenantId: Guid | null
  setCurrentTenantId: (tenantId: Guid) => void
  
  // Permission sets (can be modified)
  permissionSets: PermissionSet[]
  addPermissionSet: (permissionSet: PermissionSet) => void
  updatePermissionSet: (id: string, updates: Partial<PermissionSet>) => void
  deletePermissionSet: (id: string) => void
  
  // Group assignments (can be modified)
  assignments: GroupAssignment[]
  addAssignment: (assignment: GroupAssignment) => void
  updateAssignment: (assignment: GroupAssignment) => void
  removeAssignment: (tenantId: Guid, aadGroupId: Guid, scope: 'Tenant' | 'Report', targetId?: string) => void
  
  // Selected items for bulk operations
  selectedReports: string[]
  setSelectedReports: (reportIds: string[]) => void
  toggleReportSelection: (reportId: string) => void
  
  // Audit view
  auditReportId: string | null
  setAuditReportId: (reportId: string | null) => void
  
  // Setup wizard state
  setupWizardOpen: boolean
  setSetupWizardOpen: (open: boolean) => void
  setupStep: number
  setSetupStep: (step: number) => void
  setupSelectedGroups: Guid[]
  setSetupSelectedGroups: (groupIds: Guid[]) => void
  setupGroupAssignments: Record<Guid, string> // groupId -> permissionSetId
  setSetupGroupAssignment: (groupId: Guid, permissionSetId: string) => void
  setSetupGroupAssignments: (assignments: Record<Guid, string>) => void
  
  // Group role wizard state
  groupRoleWizardOpen: boolean
  setGroupRoleWizardOpen: (open: boolean) => void
  
  // Last sync time for groups
  lastGroupSyncTime: Date | null
  setLastGroupSyncTime: (time: Date | null) => void
}
```

**Initial State:**
```typescript
{
  currentTenantId: "11111111-aaaa-4444-bbbb-222222222222", // Contoso
  permissionSets: mockPermissionSets, // 9 default sets
  assignments: mockAssignments, // Pre-configured assignments
  selectedReports: [],
  auditReportId: null,
  setupWizardOpen: false,
  setupStep: 1,
  setupSelectedGroups: [],
  setupGroupAssignments: {},
  groupRoleWizardOpen: false,
  lastGroupSyncTime: null
}
```

**Helper Functions:**
```typescript
export const getPermissionSetUsage = (
  permissionSetId: string, 
  assignments: GroupAssignment[]
): number => {
  return assignments.filter(a => a.permissionSetId === permissionSetId).length
}

export const isPermissionSetInUse = (
  permissionSetId: string, 
  assignments: GroupAssignment[]
): boolean => {
  return getPermissionSetUsage(permissionSetId, assignments) > 0
}
```

---

## 📊 **Mock Data**

### **Tenants**

**1. Contoso Ltd (Default)**
- **ID:** `11111111-aaaa-4444-bbbb-222222222222`
- **Domain:** `contoso.onmicrosoft.com`
- **Verified:** `contoso.com`
- **Users:** 50+ (executives, finance, sales, marketing, IT, contractors, guests)
- **Groups:** 20+ (departmental, role-based, dynamic, nested)

**2. Fabrikam Inc**
- **ID:** `22222222-bbbb-5555-cccc-333333333333`
- **Domain:** `fabrikam.onmicrosoft.com`
- **Verified:** `fabrikam.com`
- **Users:** 1 (minimal for demo)
- **Groups:** 1

### **Reports (10 reports)**

```typescript
export const reports: ReportRef[] = [
  {
    id: "rpt_sales_dashboard",
    name: "Sales Dashboard",
    path: "/Sales/Dashboard",
    dataset: "dataset_sales_2024",
    rlsRoles: ["SalesManager", "SalesRep", "Executive"]
  },
  {
    id: "rpt_finance_q4",
    name: "Q4 Financial Summary",
    path: "/Finance/Q4_Summary",
    dataset: "dataset_finance_2024",
    rlsRoles: ["FinanceTeam", "CFO", "Auditor"]
  },
  {
    id: "rpt_hr_analytics",
    name: "HR Analytics",
    path: "/HR/Analytics",
    dataset: "dataset_hr_2024",
    rlsRoles: ["HRManager", "Executive"]
  },
  {
    id: "rpt_marketing_campaign",
    name: "Marketing Campaign Performance",
    path: "/Marketing/Campaigns",
    dataset: "dataset_marketing_2024"
  },
  {
    id: "rpt_product_metrics",
    name: "Product Metrics",
    path: "/Product/Metrics",
    dataset: "dataset_product_2024",
    rlsRoles: ["ProductManager", "Executive"]
  },
  {
    id: "rpt_customer_satisfaction",
    name: "Customer Satisfaction",
    path: "/Customer/Satisfaction",
    dataset: "dataset_customer_2024"
  },
  {
    id: "rpt_inventory",
    name: "Inventory Levels",
    path: "/Operations/Inventory",
    dataset: "dataset_inventory_2024",
    rlsRoles: ["WarehouseManager", "Operations"]
  },
  {
    id: "rpt_executive_summary",
    name: "Executive Summary",
    path: "/Executive/Summary",
    dataset: "dataset_executive_2024",
    rlsRoles: ["CEO", "CFO", "CTO"]
  },
  {
    id: "rpt_data_quality",
    name: "Data Quality Report",
    path: "/IT/DataQuality",
    dataset: "dataset_data_quality",
    rlsRoles: ["DataEngineer", "DataScientist"]
  },
  {
    id: "rpt_audit_trail",
    name: "Audit Trail",
    path: "/Compliance/AuditTrail",
    dataset: "dataset_audit_2024",
    rlsRoles: ["Auditor", "ComplianceOfficer"]
  }
]
```

### **Permission Sets (9 default)**

1. **Viewer** (`ps_viewer`) - Read-only, can export
2. **Editor** (`ps_editor`) - Can edit and save, plus all viewer capabilities
3. **Admin** (`ps_admin`) - All capabilities enabled
4. **Finance Analyst** (`ps_finance_analyst`) - Custom for finance team
5. **Executive Dashboard** (`ps_executive_dashboard`) - Custom for executives
6. **Data Scientist** (`ps_data_scientist`) - Access to BI Genius and deep dive
7. **Guest Limited** (`ps_guest_limited`) - Very restricted for external users
8. **Marketing Team** (`ps_marketing_team`) - Custom for marketing
9. **Audit Read-Only** (`ps_audit_readonly`) - Audit-only access

### **Assignments (Pre-configured)**

Sample assignments in mock data:
- Finance Team → Viewer (Tenant-level)
- Sales Team → Editor (Tenant-level)
- Executives → Executive Dashboard (Tenant-level)
- IT Administrators → Admin (Tenant-level)
- Finance Team → Finance Analyst (Report-level override for Q4 Financial)
- Executives → Admin (Report-level override for Executive Summary)

---

## 🎨 **Styling System**

### **Tailwind Configuration**

**File:** `tailwind.config.js`

**Custom Theme:**
```javascript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  },
}
```

### **CSS Variables**

**File:** `app/globals.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other dark mode colors */
  }
}
```

### **Utility Function**

**File:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:** Merge Tailwind classes safely
```tsx
<div className={cn("base-class", conditional && "conditional-class", className)} />
```

---

## 🔑 **Key Algorithms**

### **1. Transitive Member Resolution**

**Purpose:** Calculate total members in a group including nested groups.

```typescript
function getTransitiveMemberIds(
  group: AadGroup, 
  tenant: Tenant, 
  visited = new Set<Guid>()
): Set<Guid> {
  const memberIds = new Set<Guid>()
  
  // Prevent infinite loops
  if (visited.has(group.id)) {
    return memberIds
  }
  visited.add(group.id)
  
  group.members.forEach(memberRef => {
    // Check if it's a user
    const user = tenant.users.find(u => u.id === memberRef.id)
    if (user) {
      memberIds.add(user.id)
      return
    }
    
    // Check if it's a nested group
    const nestedGroup = tenant.groups.find(g => g.id === memberRef.id)
    if (nestedGroup) {
      const nestedMembers = getTransitiveMemberIds(nestedGroup, tenant, visited)
      nestedMembers.forEach(id => memberIds.add(id))
    }
  })
  
  return memberIds
}
```

### **2. Guest User Detection**

```typescript
function isGuestUser(user: AadUser): boolean {
  return user.userPrincipalName.includes('#EXT#')
}

function getGuestUsersInGroup(group: AadGroup, tenant: Tenant): AadUser[] {
  const allMemberIds = getTransitiveMemberIds(group, tenant)
  return tenant.users.filter(user => 
    allMemberIds.has(user.id) && isGuestUser(user)
  )
}
```

### **3. Effective Permission Calculation**

```typescript
function getEffectivePermissionSetId(
  tenantId: Guid,
  groupId: Guid,
  reportId: string | null,
  assignments: GroupAssignment[]
): string | null {
  // First, check for report-level override
  if (reportId) {
    const reportOverride = assignments.find(a =>
      a.tenantId === tenantId &&
      a.aadGroupId === groupId &&
      a.scope === "Report" &&
      a.targetId === reportId
    )
    
    if (reportOverride) {
      return reportOverride.permissionSetId
    }
  }
  
  // Fall back to tenant-level assignment
  const tenantAssignment = assignments.find(a =>
    a.tenantId === tenantId &&
    a.aadGroupId === groupId &&
    a.scope === "Tenant"
  )
  
  return tenantAssignment?.permissionSetId || null
}
```

### **4. User Access Calculation**

```typescript
function getUserAccessToReport(
  userId: Guid,
  reportId: string,
  tenant: Tenant,
  assignments: GroupAssignment[]
): {
  hasAccess: boolean
  permissionSetId: string | null
  source: 'tenant' | 'report' | null
  viaGroups: string[]
} {
  // Find all groups user is member of
  const userGroups = tenant.groups.filter(group => {
    const memberIds = getTransitiveMemberIds(group, tenant)
    return memberIds.has(userId)
  })
  
  // Check each group for report access
  for (const group of userGroups) {
    const permissionSetId = getEffectivePermissionSetId(
      tenant.tenantId,
      group.id,
      reportId,
      assignments
    )
    
    if (permissionSetId) {
      const assignment = assignments.find(a => 
        a.permissionSetId === permissionSetId &&
        a.aadGroupId === group.id
      )
      
      return {
        hasAccess: true,
        permissionSetId,
        source: assignment?.scope === 'Report' ? 'report' : 'tenant',
        viaGroups: [group.displayName]
      }
    }
  }
  
  return {
    hasAccess: false,
    permissionSetId: null,
    source: null,
    viaGroups: []
  }
}
```

---

## 🚀 **Available Scripts**

```json
{
  "dev": "next dev",                    // Start development server (localhost:3000)
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "setup": "./scripts/setup.sh",        // Setup script
  "clean": "rm -rf .next node_modules package-lock.json && npm install"
}
```

---

## 📁 **Import Aliases**

**Configured in:** `tsconfig.json`

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

**Usage:**
```typescript
import { Button } from '@/components/ui/button'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { PermissionSet, Tenant } from '@/types/mockAzureAD'
import { cn } from '@/lib/utils'
```

---

## 🎯 **Key Features Summary**

### **✅ Implemented**

1. **Multi-Tenant Management**
   - Switch between tenants via dropdown
   - Scoped data isolation
   - 2 mock tenants (Contoso, Fabrikam)

2. **Permission Sets**
   - CRUD operations
   - 8 granular capabilities
   - Usage validation (prevent deletion if in use)
   - Clone functionality
   - 9 default permission sets

3. **Groups & Users**
   - Display Azure AD groups with metadata
   - Group type badges (Security, M365, Dynamic)
   - Transitive member count
   - Guest user count
   - Nested group support

4. **Report Access Matrix**
   - Sidebar-based interface
   - User/Group tabs with search
   - Multi-select assignment
   - Expandable report cards
   - Inherited vs. override visualization

5. **Setup Wizards**
   - **GroupRoleWizard:** 3-step bulk configuration
     - Azure AD sync simulation (1000 groups)
     - Live search
     - Bulk and individual assignment
   - **SetupWizard:** Legacy wizard (hidden)

6. **Assignments**
   - Tenant-level (default for all reports)
   - Report-level (overrides)
   - RLS role support
   - Inheritance tracking

7. **Audit Views**
   - "Who can see this report?" modal
   - Complete access breakdown
   - Guest user highlighting
   - Transitive group expansion

8. **Modern UI**
   - shadcn/ui components
   - Responsive design
   - Accessible (Radix UI primitives)
   - Tailwind CSS styling
   - Dark mode ready (not enabled)

### **❌ Not Implemented (Future)**

1. Real Azure AD integration
2. Real Power BI integration
3. Backend API
4. Database persistence
5. Authentication/authorization
6. Access request workflows
7. Time-bound access
8. Access reviews
9. Analytics dashboard
10. Email notifications

---

## 📝 **Code Patterns**

### **Pattern 1: Component with Zustand State**

```typescript
'use client'

import { usePermissionsStore } from '@/store/usePermissionsStore'

export function MyComponent() {
  const { 
    currentTenantId, 
    permissionSets,
    addPermissionSet 
  } = usePermissionsStore()
  
  const handleAdd = () => {
    addPermissionSet({
      id: 'ps_new',
      name: 'New Set',
      description: 'Description',
      capabilities: { /* ... */ }
    })
  }
  
  return (
    <div>
      {/* UI */}
    </div>
  )
}
```

### **Pattern 2: Modal Component**

```typescript
interface MyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: SomeType | null
}

export function MyModal({ open, onOpenChange, data }: MyModalProps) {
  const [formData, setFormData] = useState(data)
  
  const handleSave = () => {
    // Save logic
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        {/* Form */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### **Pattern 3: Table with Actions**

```typescript
export function MyTable() {
  const items = usePermissionsStore(state => state.items)
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Button size="sm" onClick={() => handleEdit(item)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 🧪 **Testing Notes**

**Current State:** No tests implemented (prototype phase)

**Future Testing Strategy:**
- Unit tests: Vitest or Jest
- Component tests: React Testing Library
- E2E tests: Playwright or Cypress
- Coverage target: 80%+

---

## 📦 **Deployment**

**Current Deployment:**
- **Platform:** Vercel
- **URL:** https://reportinghub-d6te0a28y-ethan-tengs-projects-f09c66fd.vercel.app
- **Auto-deploy:** Enabled for main branch
- **Build:** `npm run build`
- **Start:** `npm run start`

---

## 🔮 **Future Integration Points**

### **Microsoft Graph API**
```typescript
// Future: Real user/group sync
const syncUsers = async (tenantId: string) => {
  const response = await fetch(`https://graph.microsoft.com/v1.0/users`)
  const data = await response.json()
  return data.value // AadUser[]
}

const syncGroups = async (tenantId: string) => {
  const response = await fetch(`https://graph.microsoft.com/v1.0/groups`)
  const data = await response.json()
  return data.value // AadGroup[]
}
```

### **Power BI Service API**
```typescript
// Future: Apply permissions to Power BI
const applyPermissionsToPowerBI = async (
  reportId: string,
  assignments: GroupAssignment[]
) => {
  // Convert assignments to Power BI format
  // POST to Power BI API
}
```

---

## 🎓 **Learning Resources**

For LLMs working with this codebase:

1. **Next.js 14 App Router:** https://nextjs.org/docs
2. **Radix UI:** https://www.radix-ui.com/primitives/docs/overview/introduction
3. **shadcn/ui:** https://ui.shadcn.com
4. **Zustand:** https://github.com/pmndrs/zustand
5. **Tailwind CSS:** https://tailwindcss.com/docs
6. **Microsoft Graph API:** https://learn.microsoft.com/en-us/graph/overview
7. **Power BI REST API:** https://learn.microsoft.com/en-us/rest/api/power-bi/

---

## ✅ **Completeness Checklist**

- [x] Multi-tenant switching
- [x] Permission sets CRUD
- [x] Groups table with transitive members
- [x] Guest user detection
- [x] Report access matrix
- [x] Tenant-level assignments
- [x] Report-level overrides
- [x] RLS role support
- [x] Setup wizards
- [x] Audit modal
- [x] Bulk operations
- [x] Search functionality
- [x] Modern UI components
- [x] Responsive design
- [x] Mock data (comprehensive)
- [ ] Backend API
- [ ] Real Azure AD integration
- [ ] Real Power BI integration
- [ ] Authentication
- [ ] Database persistence
- [ ] Access workflows
- [ ] Analytics

---

## 📞 **For LLMs**

When working with this codebase:

1. **Always use TypeScript** - The entire codebase is typed
2. **Use import aliases** - Prefer `@/components/...` over relative paths
3. **Follow existing patterns** - Component structure is consistent
4. **Maintain Zustand store** - Don't create new state management
5. **Use shadcn/ui components** - Don't create new base components
6. **Respect data models** - Types are defined in `mockAzureAD.ts`
7. **Test transitive logic** - Group nesting can be complex
8. **Consider guest users** - Always check for `#EXT#` in UPN
9. **Handle inheritance** - Report overrides take precedence over tenant
10. **Validate before delete** - Check usage before removing permission sets

---

**Last Updated:** October 9, 2025  
**Version:** 1.0  
**Status:** Complete Technical Reference for LLM Consumption ✅

