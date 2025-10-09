# ReportingHub - Feature Map & Architecture

## 🗺️ **Feature Map Overview**

This document visualizes how all features connect and the data flow through the system.

---

## 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACE                                │
│                         (Next.js + React)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Tenant     │  │   Groups &   │  │   Report     │                 │
│  │   Switcher   │  │    Users     │  │   Access     │                 │
│  │              │  │    Table     │  │   Matrix     │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                  │                          │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐                 │
│  │  Permission  │  │    Setup     │  │    Audit     │                 │
│  │     Sets     │  │   Wizards    │  │    Views     │                 │
│  │    Table     │  │              │  │              │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  STATE MANAGER  │
                    │    (Zustand)    │
                    └────────┬────────┘
                             │
┌────────────────────────────┴─────────────────────────────────────────────┐
│                          BACKEND API                                      │
│                      (Future: REST/GraphQL)                               │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Permission  │  │  Assignment  │  │    Audit     │                  │
│  │   Service    │  │   Service    │  │   Service    │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                  │                           │
│         └─────────────────┼──────────────────┘                           │
│                           │                                              │
│                  ┌────────▼────────┐                                     │
│                  │    DATABASE     │                                     │
│                  │ (PostgreSQL/    │                                     │
│                  │  SQL Server)    │                                     │
│                  └─────────────────┘                                     │
│                                                                           │
└────────────┬──────────────────────────────────────┬──────────────────────┘
             │                                      │
┌────────────▼────────┐                ┌───────────▼──────────┐
│   MICROSOFT GRAPH   │                │   POWER BI SERVICE   │
│    (Azure AD)       │                │       API            │
├─────────────────────┤                ├──────────────────────┤
│ • Users             │                │ • Workspaces         │
│ • Groups            │                │ • Reports            │
│ • Members (trans.)  │                │ • Datasets           │
│ • Dynamic groups    │                │ • Permissions        │
│ • Guest users       │                │ • RLS roles          │
└─────────────────────┘                └──────────────────────┘
```

---

## 🎯 **Core Feature Modules**

### **Module 1: Tenant Management**

```
┌───────────────────────────────────────┐
│       TENANT MANAGEMENT               │
├───────────────────────────────────────┤
│                                       │
│  [Tenant Switcher Dropdown]          │
│         │                             │
│         ├── List all tenants          │
│         ├── Show current tenant       │
│         ├── Switch tenant context     │
│         └── Tenant metadata           │
│                                       │
│  Features:                            │
│  ✅ Multi-tenant isolation            │
│  ✅ Tenant onboarding                 │
│  ✅ Cross-tenant admin                │
│                                       │
│  Data Model:                          │
│  • tenantId (GUID)                    │
│  • displayName                        │
│  • defaultDomainName                  │
│  • verifiedDomains[]                  │
│                                       │
└───────────────────────────────────────┘
```

**Milestone:** M3  
**Dependencies:** None  
**Integrations:** Azure AD (M7)

---

### **Module 2: Permission Sets**

```
┌───────────────────────────────────────┐
│       PERMISSION SETS                 │
├───────────────────────────────────────┤
│                                       │
│  [Permission Sets Table]              │
│         │                             │
│         ├── Create new sets           │
│         ├── Edit existing             │
│         ├── Delete (if not in use)    │
│         ├── Clone/duplicate           │
│         └── View usage count          │
│                                       │
│  Capabilities (Granular):             │
│  □ allowEditAndSave                   │
│  □ allowEditAndSaveAs                 │
│  □ allowExportReport                  │
│  □ allowSharingReport                 │
│  □ allowSemanticModelRefresh          │
│  □ allowSchedulingTasks               │
│  □ allowAccessToBIGenius              │
│  □ allowAccessToBIGeniusQueryDeepDive │
│                                       │
│  Data Model:                          │
│  • id (string)                        │
│  • name (string)                      │
│  • description (string)               │
│  • capabilities (object)              │
│                                       │
└───────────────────────────────────────┘
```

**Milestone:** M1  
**Dependencies:** None  
**Integrations:** Power BI API (M8 - to enforce capabilities)

---

### **Module 3: Groups & Users**

```
┌───────────────────────────────────────────────────────────────┐
│                   GROUPS & USERS                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [Groups Table]                    [Users Table]             │
│         │                                  │                  │
│         ├── List all groups                ├── List all users│
│         ├── Search/filter                  ├── Search/filter │
│         ├── Member count                   ├── Guest badges  │
│         ├── Group type badges              ├── Status        │
│         │   (Security/M365/Dynamic)        └── UPN/email     │
│         ├── Nested groups                                     │
│         ├── Effective permission set                          │
│         └── Guest user count                                  │
│                                                               │
│  Features:                                                    │
│  ✅ Transitive member resolution                              │
│  ✅ Dynamic group detection                                   │
│  ✅ Guest user identification                                 │
│  ✅ Real-time sync with Azure AD (M7)                         │
│                                                               │
│  Data Model (Group):                                          │
│  • id (GUID)                                                  │
│  • displayName                                                │
│  • securityEnabled (bool)                                     │
│  • groupTypes[] (Unified = M365)                              │
│  • members[] (directoryObjectRef)                             │
│  • membershipRule? (dynamic)                                  │
│                                                               │
│  Data Model (User):                                           │
│  • id (GUID)                                                  │
│  • displayName                                                │
│  • userPrincipalName                                          │
│  • mail                                                       │
│  • accountEnabled (bool)                                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Milestone:** M1 (Groups), M4 (Users with assignments)  
**Dependencies:** Tenant Management (M3)  
**Integrations:** Microsoft Graph API (M7)

---

### **Module 4: Report Access Matrix**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REPORT ACCESS MATRIX                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                Reports →                                                 │
│              ┌─────┬─────┬─────┬─────┐                                  │
│   Groups  ↓  │ R1  │ R2  │ R3  │ R4  │                                  │
│              ├─────┼─────┼─────┼─────┤                                  │
│   Group A    │ 👁️ │ ✏️  │  -  │ 👁️ │                                  │
│              ├─────┼─────┼─────┼─────┤                                  │
│   Group B    │ ✏️  │ 🔒  │ 👁️ │  -  │                                  │
│              ├─────┼─────┼─────┼─────┤                                  │
│   Group C    │  -  │ 👁️ │ 👁️ │ ✏️  │                                  │
│              └─────┴─────┴─────┴─────┘                                  │
│                                                                          │
│  Legend:                                                                 │
│  👁️ = Viewer    ✏️ = Editor    🔒 = Admin    - = No Access             │
│                                                                          │
│  Cell Indicators:                                                        │
│  🔵 Inherited (from tenant-level assignment)                            │
│  🟠 Override (report-level specific assignment)                         │
│                                                                          │
│  Features:                                                               │
│  ✅ Visual grid view                                                     │
│  ✅ Click cell to override permission                                    │
│  ✅ Bulk operations (select multiple)                                    │
│  ✅ Inheritance tracking                                                 │
│  ✅ RLS role assignment per cell                                         │
│  ✅ Search/filter reports                                                │
│  ✅ Search/filter groups/users                                           │
│                                                                          │
│  Sidebar View:                                                           │
│  ├─ Tabs: [Users] [Groups]                                              │
│  ├─ Search bar                                                           │
│  ├─ Select assignees (checkboxes)                                       │
│  ├─ Choose permission set                                                │
│  └─ [Assign] button                                                      │
│                                                                          │
│  Data Model (Assignment):                                                │
│  • tenantId (GUID)                                                       │
│  • aadGroupId or userId (GUID)                                           │
│  • permissionSetId (string)                                              │
│  • scope ("Tenant" | "Report")                                           │
│  • targetId? (reportId for overrides)                                    │
│  • rlsRole? (string)                                                     │
│  • inherited (bool, computed)                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Milestone:** M2 (Groups), M4 (Users)  
**Dependencies:** Permission Sets (M1), Groups/Users (M1/M4)  
**Integrations:** Power BI API (M8 - to sync permissions)

---

### **Module 5: Setup Wizards**

```
┌─────────────────────────────────────────────────────────────────┐
│                       SETUP WIZARDS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  GROUP/ROLE WIZARD (Primary)                       │         │
│  ├────────────────────────────────────────────────────┤         │
│  │                                                     │         │
│  │  Step 1: Select Groups                             │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │  [Search Azure AD Groups]            │          │         │
│  │  │                                      │          │         │
│  │  │  [Sync from Azure AD] ← 1000+ groups│          │         │
│  │  │  Progress: ████████░░ 80%           │          │         │
│  │  │                                      │          │         │
│  │  │  ☑ IT Administrators                │          │         │
│  │  │  ☑ Finance Team                     │          │         │
│  │  │  ☐ Sales Department                 │          │         │
│  │  │  ...                                 │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  │                                                     │         │
│  │  Step 2: Assign Permission Sets                    │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │  Group              Permission Set   │          │         │
│  │  │  ─────              ──────────────   │          │         │
│  │  │  IT Admins      →   [Admin ▾]       │          │         │
│  │  │  Finance Team   →   [Editor ▾]      │          │         │
│  │  │                                      │          │         │
│  │  │  Quick Actions:                      │          │         │
│  │  │  • Set all to "Viewer"               │          │         │
│  │  │  • Set all to "Editor"               │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  │                                                     │         │
│  │  Step 3: Review & Apply                            │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │  Summary:                            │          │         │
│  │  │  • 15 groups selected                │          │         │
│  │  │  • 3 permission sets assigned        │          │         │
│  │  │  • ~500 users affected               │          │         │
│  │  │                                      │          │         │
│  │  │  [Cancel]  [Apply Changes]           │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  REPORT ONBOARDING WIZARD                          │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Step 1: Select Reports (from Power BI)            │         │
│  │  Step 2: Default Permission Set                    │         │
│  │  Step 3: Initial Group Assignments                 │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  FIRST-TIME SETUP WIZARD                           │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Step 1: Welcome & Tenant Selection                │         │
│  │  Step 2: Create Permission Sets (templates)        │         │
│  │  Step 3: Import Groups                             │         │
│  │  Step 4: Assign Default Permissions                │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Milestone:** M5  
**Dependencies:** All M1-M4 features  
**Integrations:** Microsoft Graph (M7), Power BI API (M8)

---

### **Module 6: Audit & Compliance**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT & COMPLIANCE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  "WHO CAN SEE THIS REPORT?" MODAL                  │         │
│  ├────────────────────────────────────────────────────┤         │
│  │                                                     │         │
│  │  Report: Q4 Financial Summary                      │         │
│  │                                                     │         │
│  │  Access Summary:                                    │         │
│  │  • 47 users (5 guests)                             │         │
│  │  • 8 groups                                         │         │
│  │  • 3 permission sets                                │         │
│  │                                                     │         │
│  │  Access Breakdown:                                  │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ Finance Team (25 members)           │           │         │
│  │  │ └─ Viewer (Inherited)               │           │         │
│  │  │                                     │           │         │
│  │  │ Executives (12 members)             │           │         │
│  │  │ └─ Editor (Override)                │           │         │
│  │  │    └─ RLS Role: "Executive"         │           │         │
│  │  │                                     │           │         │
│  │  │ Alice Wong (Individual)             │           │         │
│  │  │ └─ Admin (Direct Assignment)        │           │         │
│  │  │                                     │           │         │
│  │  │ 🔴 External Auditor (Guest)         │           │         │
│  │  │ └─ Viewer (Direct Assignment)       │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  │                                                     │         │
│  │  [Export Audit Report]  [Close]                    │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  AUDIT LOG                                         │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Date       User      Action             Target    │         │
│  │  ────       ────      ──────             ──────    │         │
│  │  10/9 2pm   Alice     Assigned "Editor"  Group:IT  │         │
│  │  10/9 1pm   Bob       Created Set        "Viewer2" │         │
│  │  10/8 4pm   Alice     Removed access     Report:Q3 │         │
│  │  ...                                                │         │
│  │                                                     │         │
│  │  [Filter by Date] [Filter by User] [Export]       │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  COMPLIANCE DASHBOARD                              │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  📊 Total Users: 1,247                             │         │
│  │  📊 Guest Users: 43 (3.4%)                         │         │
│  │  📊 Over-permissioned: 12 (1.0%) ⚠️                │         │
│  │  📊 Orphaned Permissions: 0 ✅                      │         │
│  │  📊 Last Access Review: 2 weeks ago                │         │
│  │                                                     │         │
│  │  Recent Alerts:                                     │         │
│  │  • Guest user granted "Admin" access ⚠️             │         │
│  │  • 50+ permission changes in 1 hour ⚠️              │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Milestone:** M6  
**Dependencies:** All M1-M5 features  
**Integrations:** Database for audit logs, export to Excel/PDF

---

### **Module 7: Access Workflows (Advanced)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESS WORKFLOWS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  ACCESS REQUEST FORM (User-facing)                 │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Report: Q4 Financial Summary                      │         │
│  │  Access Level: [Viewer ▾]                          │         │
│  │  Duration: [30 days ▾] (Temporary)                 │         │
│  │  Justification: ___________________________        │         │
│  │                                                     │         │
│  │  [Cancel]  [Submit Request]                        │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │  APPROVAL WORKFLOW (Manager/Admin)                 │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Request from: John Doe                            │         │
│  │  Report: Q4 Financial Summary                      │         │
│  │  Access Level: Viewer                              │         │
│  │  Duration: 30 days                                 │         │
│  │  Justification: "Need for client presentation"     │         │
│  │                                                     │         │
│  │  [Deny]  [Approve]  [Approve with Changes]        │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │  TIME-BOUND ACCESS (Auto-expiration)               │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  John Doe → Q4 Financial Summary                   │         │
│  │  Access: Viewer                                     │         │
│  │  Expires: Nov 9, 2025 (29 days remaining)          │         │
│  │                                                     │         │
│  │  [Request Extension]  [Revoke Early]               │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  ACCESS REVIEW (Periodic Certification)            │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  Review Period: Q4 2025                            │         │
│  │  Reviewer: Sarah Chen (Finance Manager)            │         │
│  │                                                     │         │
│  │  Review your team's access:                        │         │
│  │  ☑ John Doe - Q4 Reports - Viewer ✅               │         │
│  │  ☑ Jane Smith - Q4 Reports - Editor ✅             │         │
│  │  ☐ Bob Johnson - Q4 Reports - Admin ❌ (Remove)    │         │
│  │                                                     │         │
│  │  [Submit Review]                                   │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Milestone:** M9  
**Dependencies:** All M1-M8 features  
**Integrations:** Email notifications, Calendar for expiration

---

### **Module 8: Analytics & Optimization**

```
┌─────────────────────────────────────────────────────────────────┐
│                  ANALYTICS & OPTIMIZATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  USAGE ANALYTICS DASHBOARD                         │         │
│  ├────────────────────────────────────────────────────┤         │
│  │                                                     │         │
│  │  📊 Top 10 Most Viewed Reports                     │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ 1. Sales Dashboard - 1,247 views    │           │         │
│  │  │ 2. Finance Q4 - 892 views           │           │         │
│  │  │ 3. HR Analytics - 654 views         │           │         │
│  │  │ ...                                 │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  │                                                     │         │
│  │  📊 Unused Reports (0 views in 90 days)            │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ • Old Marketing Report              │           │         │
│  │  │ • Test Dashboard v2                 │           │         │
│  │  │ • Archived Sales Data               │           │         │
│  │  │ [Recommend for Deletion] 💡         │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  │                                                     │         │
│  │  📊 License Optimization                            │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ Power BI Pro licenses: 250          │           │         │
│  │  │ Active users (30 days): 187         │           │         │
│  │  │ Inactive users: 63                  │           │         │
│  │  │                                     │           │         │
│  │  │ 💰 Potential Savings: $3,150/month  │           │         │
│  │  │ [Download Inactive Users List]      │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  RECOMMENDATIONS ENGINE                            │         │
│  ├────────────────────────────────────────────────────┤         │
│  │                                                     │         │
│  │  🔍 Over-permissioned Accounts Detected             │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ • Alice Wong has "Admin" on 47      │           │         │
│  │  │   reports (avg: 12)                 │           │         │
│  │  │   Recommendation: Review access ⚠️   │           │         │
│  │  │                                     │           │         │
│  │  │ • Guest user "consultant@ext.com"   │           │         │
│  │  │   has "Editor" on sensitive reports │           │         │
│  │  │   Recommendation: Downgrade to      │           │         │
│  │  │   Viewer or remove access ⚠️         │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  │                                                     │         │
│  │  💡 Permission Set Consolidation                    │         │
│  │  ┌─────────────────────────────────────┐           │         │
│  │  │ You have 15 permission sets with    │           │         │
│  │  │ similar capabilities:               │           │         │
│  │  │ • "Viewer" and "Viewer (Copy)"      │           │         │
│  │  │   are 95% identical                 │           │         │
│  │  │                                     │           │         │
│  │  │ Recommendation: Merge to reduce     │           │         │
│  │  │ complexity 💡                        │           │         │
│  │  └─────────────────────────────────────┘           │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Milestone:** M10  
**Dependencies:** All M1-M9 features, usage tracking data  
**Integrations:** Power BI usage logs, ML models for recommendations

---

## 📊 **Data Flow Diagram**

```
┌─────────────┐
│   ADMIN     │
│   ACTIONS   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  1. CREATE PERMISSION SET                           │
│     "Viewer" with capabilities                      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  2. ASSIGN TO GROUP (Tenant-level)                  │
│     "Finance Team" → "Viewer"                       │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  3. OVERRIDE FOR SPECIFIC REPORT (Optional)         │
│     "Finance Team" → "Q4 Report" → "Editor"         │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  4. CALCULATE EFFECTIVE PERMISSIONS                 │
│     User: John Doe                                  │
│     ├─ Member of: Finance Team                      │
│     ├─ Tenant-level: Viewer                         │
│     └─ Report-level (Q4): Editor (Override)         │
│                                                     │
│     Effective Permission for Q4 Report: EDITOR ✅    │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  5. SYNC TO POWER BI (M8)                           │
│     POST /api/powerbi/permissions                   │
│     {                                               │
│       user: "john.doe@contoso.com",                 │
│       report: "q4-financial",                       │
│       permissions: ["Read", "Write"]                │
│     }                                               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  6. USER ACCESSES REPORT                            │
│     Power BI checks permissions                     │
│     → Grants access based on ReportingHub data ✅    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 **Integration Points**

### **Microsoft Graph API (M7)**

```
ReportingHub                    Microsoft Graph API
     │                                   │
     ├─── GET /users ──────────────────→ │
     │                                   │
     ←──── [User List] ─────────────────┤
     │                                   │
     ├─── GET /groups ─────────────────→ │
     │                                   │
     ←──── [Group List] ────────────────┤
     │                                   │
     ├─── GET /groups/{id}/members ────→ │
     │                                   │
     ←──── [Members (transitive)] ──────┤
```

### **Power BI Service API (M8)**

```
ReportingHub                    Power BI API
     │                                │
     ├─── GET /workspaces ──────────→ │
     │                                │
     ←──── [Workspace List] ──────────┤
     │                                │
     ├─── GET /reports ─────────────→ │
     │                                │
     ←──── [Report List] ─────────────┤
     │                                │
     ├─── POST /permissions ────────→ │
     │    (Apply permission changes)  │
     │                                │
     ←──── [Success] ─────────────────┤
```

---

## 🎯 **Key Workflows**

### **Workflow 1: New User Onboarding**

```
1. HR creates user in Azure AD
           ↓
2. ReportingHub syncs user (M7)
           ↓
3. User added to groups automatically (Azure AD)
           ↓
4. ReportingHub detects group membership change
           ↓
5. Effective permissions calculated
           ↓
6. Permissions synced to Power BI (M8)
           ↓
7. User can access reports ✅
```

### **Workflow 2: Access Request (M9)**

```
1. User searches for report
           ↓
2. Sees "Request Access" button
           ↓
3. Fills request form (justification, duration)
           ↓
4. Manager receives email notification
           ↓
5. Manager approves via email link or portal
           ↓
6. ReportingHub grants time-bound access
           ↓
7. Permissions synced to Power BI
           ↓
8. User accesses report ✅
           ↓
9. After 30 days, access auto-revokes
```

### **Workflow 3: Audit Query**

```
1. Auditor asks: "Who can see Payroll Report?"
           ↓
2. Admin clicks "Audit" button on report
           ↓
3. ReportingHub calculates:
   ├─ Groups with access (tenant + override)
   ├─ Users via group membership (transitive)
   ├─ Direct user assignments
   └─ Guest users flagged
           ↓
4. Modal displays full breakdown
           ↓
5. Admin exports to Excel for auditor ✅
```

---

## 🏁 **Conclusion**

This feature map shows:

✅ **Complete feature coverage** from M1-M10  
✅ **Clear module boundaries** for development  
✅ **Integration points** with Azure AD and Power BI  
✅ **Data flow** from admin actions to user access  
✅ **Key workflows** for common scenarios  

Use this map to:
- Understand system architecture
- Plan development sprints
- Communicate with stakeholders
- Onboard new team members

---

**Last Updated:** October 9, 2025  
**Version:** 1.0

