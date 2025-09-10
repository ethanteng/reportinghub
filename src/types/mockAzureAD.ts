// mockAzureAD.ts

// ---------- Types (close to Microsoft Graph / Entra ID) ----------
export type Guid = string;

export type DirectoryObjectRef = { "@odata.type": "#microsoft.graph.directoryObject"; id: Guid };

export interface AadUser {
  "@odata.type": "#microsoft.graph.user";
  id: Guid;
  displayName: string;
  mail?: string;                    // may be undefined for guests
  userPrincipalName: string;        // e.g. alice@contoso.com or bob_outlook.com#EXT#@contoso.onmicrosoft.com
  mailNickname?: string;            // alias
  givenName?: string;
  surname?: string;
  accountEnabled: boolean;
}

export interface AadGroup {
  "@odata.type": "#microsoft.graph.group";
  id: Guid;
  displayName: string;
  mailNickname?: string;
  mail?: string;
  description?: string;
  securityEnabled: boolean;         // true for Security groups
  groupTypes: string[];             // [] or ["Unified"] for M365 groups
  visibility?: "Private" | "Public";
  membershipRule?: string;          // Dynamic groups (AAD rule syntax)
  membershipRuleProcessingState?: "On" | "Paused";
  members: DirectoryObjectRef[];    // users and/or groups (transitive)
  owners?: DirectoryObjectRef[];
}

export interface Tenant {
  tenantId: Guid;
  defaultDomainName: string;        // contoso.onmicrosoft.com
  displayName: string;
  verifiedDomains: string[];        // e.g. ["contoso.com"]
  users: AadUser[];
  groups: AadGroup[];
}

// ---------- ReportingHub-side concepts ----------
export type PermissionLevel = "Viewer" | "Editor" | "Admin";

export interface PermissionSet {
  id: string;
  name: PermissionLevel;
  description: string;
  // Power BI capabilities based on actual permission options
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

export interface ReportRef {
  id: string;
  name: string;
  path: string;          // logical path inside ReportingHub
  dataset?: string;      // Power BI dataset id/name if helpful
  rlsRoles?: string[];   // Row-Level Security roles available
}

export interface GroupAssignment {
  tenantId: Guid;
  aadGroupId: Guid;          // AAD group being assigned
  permissionSetId: string;   // which PermissionSet
  scope: "Tenant" | "Folder" | "Report";
  targetId?: string;         // folderId or reportId for scoped overrides
  rlsRole?: string;          // optional: attach an RLS role at this assignment
  inherited?: boolean;       // flag for UI (computed)
}

// ---------- Sample Tenants / Users / Groups (Azure-like) ----------
const guid = (s: string) => s as Guid; // convenience for readability

export const tenantContoso: Tenant = {
  tenantId: guid("11111111-aaaa-4444-bbbb-222222222222"),
  defaultDomainName: "contoso.onmicrosoft.com",
  displayName: "Contoso Ltd",
  verifiedDomains: ["contoso.com"],

  users: [
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001"),
      displayName: "Alice Wong",
      mail: "alice@contoso.com",
      userPrincipalName: "alice@contoso.com",
      givenName: "Alice",
      surname: "Wong",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002"),
      displayName: "Ben King",
      mail: "ben.king@contoso.com",
      userPrincipalName: "ben.king@contoso.com",
      givenName: "Ben",
      surname: "King",
      accountEnabled: true,
    },
    // Guest user example (#EXT# UPN format)
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000003"),
      displayName: "Chloe Rivera (Guest)",
      userPrincipalName: "chloe_gmail.com#EXT#@contoso.onmicrosoft.com",
      mail: undefined, // often undefined for guests
      givenName: "Chloe",
      surname: "Rivera",
      accountEnabled: true,
    },
  ],

  groups: [
    // Security group (typical for permissioning)
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000010"),
      displayName: "Finance Team",
      description: "Contoso Finance analysts",
      securityEnabled: true,
      groupTypes: [], // empty => Security group
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    // Microsoft 365 group (Unified)
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000011"),
      displayName: "Executive Leadership",
      description: "C-level and VPs",
      securityEnabled: false,
      groupTypes: ["Unified"], // M365 group
      visibility: "Private",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
      owners: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") },
      ],
    },
    // Nested group example (members include another group)
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000012"),
      displayName: "All Analytics",
      description: "Union of Finance Team + Guests",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000010") }, // Finance Team (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000003") }, // Chloe (Guest)
      ],
    },
    // Dynamic group example (rule syntax similar to AAD)
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000013"),
      displayName: "External Guests (Dynamic)",
      description: "Users whose UPN ends with #EXT#",
      securityEnabled: true,
      groupTypes: [],
      membershipRule: 'user.userPrincipalName -contains "#EXT#"',
      membershipRuleProcessingState: "On",
      members: [
        // In real AAD, dynamic groups are computed; we include Chloe here for mock parity
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000003") },
      ],
    },
  ],
};

// Optional second tenant to demo multi-tenant behavior:
export const tenantFabrikam: Tenant = {
  tenantId: guid("22222222-bbbb-5555-cccc-333333333333"),
  defaultDomainName: "fabrikam.onmicrosoft.com",
  displayName: "Fabrikam Inc",
  verifiedDomains: ["fabrikam.com"],
  users: [
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("e2c4f310-1234-4bcd-9abc-000000000101"),
      displayName: "Dana Patel",
      mail: "dana.patel@fabrikam.com",
      userPrincipalName: "dana.patel@fabrikam.com",
      accountEnabled: true,
    },
  ],
  groups: [
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("b1b1b1b1-2222-5555-aaaa-000000000120"),
      displayName: "Fabrikam Sales",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("e2c4f310-1234-4bcd-9abc-000000000101") }, // Dana
      ],
    },
  ],
};

// ---------- Permission Sets (ReportingHub) ----------
export const permissionSets: PermissionSet[] = [
  {
    id: "ps_viewer",
    name: "Viewer",
    description: "Read-only access to reports",
    capabilities: { 
      allowEditAndSave: false, 
      allowEditAndSaveAs: false, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: false, 
      allowAccessToBIGenius: false, 
      allowAccessToBIGeniusQueryDeepDive: false 
    },
  },
  {
    id: "ps_editor",
    name: "Editor",
    description: "View and customize reports (no tenant-level admin)",
    capabilities: { 
      allowEditAndSave: true, 
      allowEditAndSaveAs: true, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: false, 
      allowAccessToBIGenius: false, 
      allowAccessToBIGeniusQueryDeepDive: false 
    },
  },
  {
    id: "ps_admin",
    name: "Admin",
    description: "Full admin, including permissions management",
    capabilities: { 
      allowEditAndSave: true, 
      allowEditAndSaveAs: true, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: true, 
      allowSchedulingTasks: true, 
      allowAccessToBIGenius: true, 
      allowAccessToBIGeniusQueryDeepDive: true 
    },
  },
];

// ---------- Reports (for the matrix / audit view) ----------
export const reports: ReportRef[] = [
  { id: "r_sales", name: "Sales Dashboard", path: "/sales", dataset: "ds_sales_core", rlsRoles: ["CountryUS", "CountryCA", "All"] },
  { id: "r_exec",  name: "Executive Summary", path: "/executive", dataset: "ds_exec", rlsRoles: ["LeadershipOnly", "All"] },
  { id: "r_fin",   name: "Finance P&L", path: "/finance/pnl", dataset: "ds_fin", rlsRoles: ["FinanceOnly", "All"] },
];

// ---------- Example Assignments (what your UI will render) ----------
// Assign at tenant-level by default, then override on a specific report if needed.
export const assignments: GroupAssignment[] = [
  // Contoso: Finance Team => Viewer (Tenant level)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_viewer", scope: "Tenant" },

  // Contoso: Executive Leadership => Admin (Tenant level)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_admin", scope: "Tenant" },

  // Contoso: Finance Team gets elevated Editor on Finance P&L (override at report level)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_editor", scope: "Report", targetId: "r_fin" },

  // Optional: attach an RLS role for Sales Dashboard to All Analytics group
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000012"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_sales", rlsRole: "CountryUS" },

  // Fabrikam: Sales => Viewer (Tenant level)
  { tenantId: tenantFabrikam.tenantId, aadGroupId: guid("b1b1b1b1-2222-5555-aaaa-000000000120"), permissionSetId: "ps_viewer", scope: "Tenant" },
];

// ---------- Helper: resolve transitive membership (users of a group) ----------
export function resolveTransitiveMembers(tenant: Tenant, groupId: Guid): AadUser[] {
  const byUserId = new Map(tenant.users.map(u => [u.id, u]));
  const byGroupId = new Map(tenant.groups.map(g => [g.id, g]));
  const seen = new Set<Guid>();
  const users: AadUser[] = [];

  const dfs = (id: Guid) => {
    if (seen.has(id)) return;
    seen.add(id);

    const g = byGroupId.get(id);
    if (!g) return;

    for (const m of g.members) {
      // member could be user or group; try user first
      const u = byUserId.get(m.id);
      if (u) {
        users.push(u);
      } else if (byGroupId.has(m.id)) {
        dfs(m.id); // nested group
      }
    }
  };

  dfs(groupId);
  return users;
}

// ---------- Helper: compute effective permission for a group/report ----------
export function getEffectivePermissionSetId(
  tenantId: Guid,
  aadGroupId: Guid,
  reportId?: string
): { permissionSetId?: string; inheritedFrom?: "Tenant" | "Report"; } {
  // specific report override wins
  const reportOverride = assignments.find(a => a.tenantId === tenantId && a.aadGroupId === aadGroupId && a.scope === "Report" && a.targetId === reportId);
  if (reportOverride) return { permissionSetId: reportOverride.permissionSetId, inheritedFrom: "Report" };

  // tenant-level default
  const tenantDefault = assignments.find(a => a.tenantId === tenantId && a.aadGroupId === aadGroupId && a.scope === "Tenant");
  if (tenantDefault) return { permissionSetId: tenantDefault.permissionSetId, inheritedFrom: "Tenant" };

  return { permissionSetId: undefined };
}

// ---------- Convenience exports ----------
export const tenants: Tenant[] = [tenantContoso, tenantFabrikam];
export const byTenantId = new Map(tenants.map(t => [t.tenantId, t]));
