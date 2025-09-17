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
export type PermissionLevel = "Viewer" | "Editor" | "Admin" | "Finance Analyst" | "Executive Dashboard" | "Data Scientist" | "Guest Limited" | "Marketing Team" | "Audit Read-Only";

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
    // Executive Team
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
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000004"),
      displayName: "Sarah Chen",
      mail: "sarah.chen@contoso.com",
      userPrincipalName: "sarah.chen@contoso.com",
      givenName: "Sarah",
      surname: "Chen",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000005"),
      displayName: "Michael Rodriguez",
      mail: "michael.rodriguez@contoso.com",
      userPrincipalName: "michael.rodriguez@contoso.com",
      givenName: "Michael",
      surname: "Rodriguez",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000006"),
      displayName: "Jennifer Liu",
      mail: "jennifer.liu@contoso.com",
      userPrincipalName: "jennifer.liu@contoso.com",
      givenName: "Jennifer",
      surname: "Liu",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000007"),
      displayName: "David Thompson",
      mail: "david.thompson@contoso.com",
      userPrincipalName: "david.thompson@contoso.com",
      givenName: "David",
      surname: "Thompson",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000008"),
      displayName: "Emily Johnson",
      mail: "emily.johnson@contoso.com",
      userPrincipalName: "emily.johnson@contoso.com",
      givenName: "Emily",
      surname: "Johnson",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000009"),
      displayName: "Robert Kim",
      mail: "robert.kim@contoso.com",
      userPrincipalName: "robert.kim@contoso.com",
      givenName: "Robert",
      surname: "Kim",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000010"),
      displayName: "Lisa Martinez",
      mail: "lisa.martinez@contoso.com",
      userPrincipalName: "lisa.martinez@contoso.com",
      givenName: "Lisa",
      surname: "Martinez",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000011"),
      displayName: "James Wilson",
      mail: "james.wilson@contoso.com",
      userPrincipalName: "james.wilson@contoso.com",
      givenName: "James",
      surname: "Wilson",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000012"),
      displayName: "Amanda Davis",
      mail: "amanda.davis@contoso.com",
      userPrincipalName: "amanda.davis@contoso.com",
      givenName: "Amanda",
      surname: "Davis",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000013"),
      displayName: "Christopher Brown",
      mail: "christopher.brown@contoso.com",
      userPrincipalName: "christopher.brown@contoso.com",
      givenName: "Christopher",
      surname: "Brown",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000014"),
      displayName: "Michelle Taylor",
      mail: "michelle.taylor@contoso.com",
      userPrincipalName: "michelle.taylor@contoso.com",
      givenName: "Michelle",
      surname: "Taylor",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000015"),
      displayName: "Kevin Anderson",
      mail: "kevin.anderson@contoso.com",
      userPrincipalName: "kevin.anderson@contoso.com",
      givenName: "Kevin",
      surname: "Anderson",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000016"),
      displayName: "Rachel Green",
      mail: "rachel.green@contoso.com",
      userPrincipalName: "rachel.green@contoso.com",
      givenName: "Rachel",
      surname: "Green",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000017"),
      displayName: "Daniel White",
      mail: "daniel.white@contoso.com",
      userPrincipalName: "daniel.white@contoso.com",
      givenName: "Daniel",
      surname: "White",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000018"),
      displayName: "Stephanie Lee",
      mail: "stephanie.lee@contoso.com",
      userPrincipalName: "stephanie.lee@contoso.com",
      givenName: "Stephanie",
      surname: "Lee",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000019"),
      displayName: "Matthew Garcia",
      mail: "matthew.garcia@contoso.com",
      userPrincipalName: "matthew.garcia@contoso.com",
      givenName: "Matthew",
      surname: "Garcia",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000020"),
      displayName: "Nicole Clark",
      mail: "nicole.clark@contoso.com",
      userPrincipalName: "nicole.clark@contoso.com",
      givenName: "Nicole",
      surname: "Clark",
      accountEnabled: true,
    },
    // Guest users
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
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000021"),
      displayName: "Alex Patel (Contractor)",
      userPrincipalName: "alex_patel_outlook.com#EXT#@contoso.onmicrosoft.com",
      mail: undefined,
      givenName: "Alex",
      surname: "Patel",
      accountEnabled: true,
    },
    {
      "@odata.type": "#microsoft.graph.user",
      id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000022"),
      displayName: "Maria Santos (Consultant)",
      userPrincipalName: "maria_santos_yahoo.com#EXT#@contoso.onmicrosoft.com",
      mail: undefined,
      givenName: "Maria",
      surname: "Santos",
      accountEnabled: true,
    },
  ],

  groups: [
    // Executive & Leadership Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000010"),
      displayName: "C-Suite Executives",
      description: "C-level executives and board members",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000004") }, // Sarah
      ],
    },
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
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000004") }, // Sarah
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000005") }, // Michael
      ],
      owners: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") },
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000012"),
      displayName: "Senior Management",
      description: "Directors and senior managers",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },

    // Finance & Accounting
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000020"),
      displayName: "Finance Team",
      description: "Finance analysts and accountants",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000006") }, // Jennifer
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000007") }, // David
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000008") }, // Emily
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000021"),
      displayName: "Accounting Department",
      description: "Accounts payable, receivable, and general accounting",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000022"),
      displayName: "Financial Planning & Analysis",
      description: "FP&A team for budgeting and forecasting",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },

    // Sales & Marketing
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000030"),
      displayName: "Sales Team",
      description: "Sales representatives and account managers",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000031"),
      displayName: "Marketing Team",
      description: "Marketing professionals and content creators",
      securityEnabled: false,
      groupTypes: ["Unified"], // M365 group
      visibility: "Private",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000032"),
      displayName: "Customer Success",
      description: "Customer success managers and support",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },

    // IT & Technology
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000040"),
      displayName: "IT Department",
      description: "IT support and infrastructure team",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000041"),
      displayName: "Engineering Team",
      description: "Software engineers and developers",
      securityEnabled: false,
      groupTypes: ["Unified"], // M365 group
      visibility: "Public",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000009") }, // Robert
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000010") }, // Lisa
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000011") }, // James
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000012") }, // Amanda
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000013") }, // Christopher
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000042"),
      displayName: "Data Science Team",
      description: "Data scientists and analysts",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000043"),
      displayName: "DevOps Team",
      description: "DevOps engineers and platform team",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },

    // HR & Operations
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000050"),
      displayName: "Human Resources",
      description: "HR professionals and recruiters",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000051"),
      displayName: "Operations Team",
      description: "Business operations and process improvement",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000052"),
      displayName: "Legal & Compliance",
      description: "Legal team and compliance officers",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },

    // Regional & Departmental Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000060"),
      displayName: "North America Employees",
      description: "All employees in North America region",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000061"),
      displayName: "EMEA Team",
      description: "Europe, Middle East, and Africa employees",
      securityEnabled: false,
      groupTypes: ["Unified"], // M365 group
      visibility: "Private",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000062"),
      displayName: "APAC Operations",
      description: "Asia Pacific operations team",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },

    // Project & Initiative Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000070"),
      displayName: "Digital Transformation Initiative",
      description: "Cross-functional team for digital transformation",
      securityEnabled: false,
      groupTypes: ["Unified"], // M365 group
      visibility: "Private",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000071"),
      displayName: "Product Launch Team",
      description: "Team working on Q2 product launch",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000072"),
      displayName: "Security Committee",
      description: "Information security and compliance committee",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },

    // Dynamic Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000080"),
      displayName: "All Employees",
      description: "All active employees in the organization",
      securityEnabled: true,
      groupTypes: [],
      membershipRule: 'user.accountEnabled -eq true -and user.userType -eq "Member"',
      membershipRuleProcessingState: "On",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000004") }, // Sarah
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000005") }, // Michael
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000006") }, // Jennifer
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000007") }, // David
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000008") }, // Emily
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000009") }, // Robert
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000010") }, // Lisa
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000011") }, // James
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000012") }, // Amanda
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000013") }, // Christopher
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000014") }, // Michelle
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000015") }, // Kevin
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000016") }, // Rachel
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000017") }, // Daniel
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000018") }, // Stephanie
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000019") }, // Matthew
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000020") }, // Nicole
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000081"),
      displayName: "External Guests (Dynamic)",
      description: "Users whose UPN ends with #EXT#",
      securityEnabled: true,
      groupTypes: [],
      membershipRule: 'user.userPrincipalName -contains "#EXT#"',
      membershipRuleProcessingState: "On",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000003") }, // Chloe (Guest)
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000082"),
      displayName: "Contractors",
      description: "External contractors and consultants",
      securityEnabled: true,
      groupTypes: [],
      membershipRule: 'user.userType -eq "Guest" -and user.accountEnabled -eq true',
      membershipRuleProcessingState: "On",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000003") }, // Chloe (Guest)
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000083"),
      displayName: "New Hires (First 90 Days)",
      description: "Employees in their first 90 days",
      securityEnabled: true,
      groupTypes: [],
      membershipRule: 'user.createdDateTime -ge (Now() - 90)',
      membershipRuleProcessingState: "On",
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },

    // Nested Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000090"),
      displayName: "All Analytics",
      description: "Union of Finance Team + Data Science Team",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000020") }, // Finance Team (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000042") }, // Data Science Team (nested)
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000091"),
      displayName: "Technology Division",
      description: "All technology-related teams",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000040") }, // IT Department (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000041") }, // Engineering Team (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000043") }, // DevOps Team (nested)
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000092"),
      displayName: "Business Operations",
      description: "All business-facing teams",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000030") }, // Sales Team (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000031") }, // Marketing Team (nested)
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("a0a0a0a0-1111-4444-9999-000000000032") }, // Customer Success (nested)
      ],
    },

    // Special Access Groups
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000100"),
      displayName: "Sensitive Data Access",
      description: "Users with access to sensitive financial data",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000101"),
      displayName: "System Administrators",
      description: "Users with administrative privileges",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002") }, // Ben
      ],
    },
    {
      "@odata.type": "#microsoft.graph.group",
      id: guid("a0a0a0a0-1111-4444-9999-000000000102"),
      displayName: "Audit & Compliance",
      description: "Users involved in audit and compliance activities",
      securityEnabled: true,
      groupTypes: [],
      members: [
        { "@odata.type": "#microsoft.graph.directoryObject", id: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001") }, // Alice
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
  // Custom user-created permission sets
  {
    id: "ps_finance_analyst",
    name: "Finance Analyst",
    description: "Custom role for finance team members with export and sharing capabilities",
    capabilities: { 
      allowEditAndSave: false, 
      allowEditAndSaveAs: true, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: true, 
      allowAccessToBIGenius: true, 
      allowAccessToBIGeniusQueryDeepDive: false 
    },
  },
  {
    id: "ps_executive_dashboard",
    name: "Executive Dashboard",
    description: "Read-only access for executives with scheduled reports and BI Genius",
    capabilities: { 
      allowEditAndSave: false, 
      allowEditAndSaveAs: false, 
      allowExportReport: true, 
      allowSharingReport: false, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: true, 
      allowAccessToBIGenius: true, 
      allowAccessToBIGeniusQueryDeepDive: true 
    },
  },
  {
    id: "ps_data_scientist",
    name: "Data Scientist",
    description: "Advanced analytics capabilities for data science team",
    capabilities: { 
      allowEditAndSave: true, 
      allowEditAndSaveAs: true, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: true, 
      allowSchedulingTasks: false, 
      allowAccessToBIGenius: true, 
      allowAccessToBIGeniusQueryDeepDive: true 
    },
  },
  {
    id: "ps_guest_limited",
    name: "Guest Limited",
    description: "Minimal access for external guests and contractors",
    capabilities: { 
      allowEditAndSave: false, 
      allowEditAndSaveAs: false, 
      allowExportReport: false, 
      allowSharingReport: false, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: false, 
      allowAccessToBIGenius: false, 
      allowAccessToBIGeniusQueryDeepDive: false 
    },
  },
  {
    id: "ps_marketing_team",
    name: "Marketing Team",
    description: "Custom permissions for marketing team with sharing and export rights",
    capabilities: { 
      allowEditAndSave: true, 
      allowEditAndSaveAs: true, 
      allowExportReport: true, 
      allowSharingReport: true, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: true, 
      allowAccessToBIGenius: false, 
      allowAccessToBIGeniusQueryDeepDive: false 
    },
  },
  {
    id: "ps_audit_readonly",
    name: "Audit Read-Only",
    description: "Strict read-only access for compliance and audit purposes",
    capabilities: { 
      allowEditAndSave: false, 
      allowEditAndSaveAs: false, 
      allowExportReport: true, 
      allowSharingReport: false, 
      allowSemanticModelRefresh: false, 
      allowSchedulingTasks: false, 
      allowAccessToBIGenius: false, 
      allowAccessToBIGeniusQueryDeepDive: false 
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
  // Contoso: Finance Team => Viewer (Tenant level + Report level overrides)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_viewer", scope: "Tenant" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_sales" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_exec" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_editor", scope: "Report", targetId: "r_fin" },

  // Individual user assignments
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000001"), permissionSetId: "ps_admin", scope: "Report", targetId: "r_sales" }, // Alice Wong
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000002"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_exec" }, // Ben King
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000004"), permissionSetId: "ps_editor", scope: "Report", targetId: "r_fin" }, // Sarah Chen
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("d1b3e2f0-7b0c-4a3c-9e8f-000000000005"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_sales" }, // Michael Rodriguez

  // Contoso: Executive Leadership => Admin (Tenant level + Report level overrides)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_admin", scope: "Tenant" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_admin", scope: "Report", targetId: "r_sales" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_admin", scope: "Report", targetId: "r_exec" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_admin", scope: "Report", targetId: "r_fin" },

  // Contoso: All Analytics => Viewer (Report level only - no tenant default)
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000012"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_sales", rlsRole: "CountryUS" },
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000012"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_exec", rlsRole: "LeadershipOnly" },
  
  // Contoso: Finance Team => Viewer with RLS roles
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_fin", rlsRole: "All" },

  // Fabrikam: Sales => Viewer (Tenant level + Report level overrides)
  { tenantId: tenantFabrikam.tenantId, aadGroupId: guid("b1b1b1b1-2222-5555-aaaa-000000000120"), permissionSetId: "ps_viewer", scope: "Tenant" },
  { tenantId: tenantFabrikam.tenantId, aadGroupId: guid("b1b1b1b1-2222-5555-aaaa-000000000120"), permissionSetId: "ps_viewer", scope: "Report", targetId: "r_sales" },

  // Custom permission set assignments
  // Finance Team using Finance Analyst role
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000010"), permissionSetId: "ps_finance_analyst", scope: "Report", targetId: "r_fin" },
  
  // Executive Leadership using Executive Dashboard role
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000011"), permissionSetId: "ps_executive_dashboard", scope: "Report", targetId: "r_exec" },
  
  // All Analytics using Data Scientist role for some reports
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000012"), permissionSetId: "ps_data_scientist", scope: "Report", targetId: "r_sales" },
  
  // External Guests using Guest Limited role
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000013"), permissionSetId: "ps_guest_limited", scope: "Tenant" },
  
  // Marketing Team using Marketing Team role
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000014"), permissionSetId: "ps_marketing_team", scope: "Tenant" },
  
  // Audit team using Audit Read-Only role
  { tenantId: tenantContoso.tenantId, aadGroupId: guid("a0a0a0a0-1111-4444-9999-000000000015"), permissionSetId: "ps_audit_readonly", scope: "Tenant" },
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
): { permissionSetId?: string; inheritedFrom?: "Tenant" | "Report"; rlsRole?: string; } {
  // specific report override wins
  const reportOverride = assignments.find(a => a.tenantId === tenantId && a.aadGroupId === aadGroupId && a.scope === "Report" && a.targetId === reportId);
  if (reportOverride) return { permissionSetId: reportOverride.permissionSetId, inheritedFrom: "Report", rlsRole: reportOverride.rlsRole };

  // tenant-level default
  const tenantDefault = assignments.find(a => a.tenantId === tenantId && a.aadGroupId === aadGroupId && a.scope === "Tenant");
  if (tenantDefault) return { permissionSetId: tenantDefault.permissionSetId, inheritedFrom: "Tenant", rlsRole: tenantDefault.rlsRole };

  return { permissionSetId: undefined };
}

// ---------- Convenience exports ----------
export const tenants: Tenant[] = [tenantContoso, tenantFabrikam];
export const byTenantId = new Map(tenants.map(t => [t.tenantId, t]));
