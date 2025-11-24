export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
}

export const getUsersForTenant = (tenantId: string): User[] => {
  // Generate fake users based on tenant
  const baseUsers: User[] = [
    {
      id: 'u1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      lastActive: '2025-11-19',
      status: 'Active',
    },
    {
      id: 'u2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Content Admin',
      lastActive: '2025-11-18',
      status: 'Active',
    },
    {
      id: 'u3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Viewer',
      lastActive: '2025-11-15',
      status: 'Active',
    },
    {
      id: 'u4',
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      role: 'Viewer',
      lastActive: '2025-10-20',
      status: 'Inactive',
    },
    {
      id: 'u5',
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'Platform Admin',
      lastActive: '2025-11-19',
      status: 'Active',
    },
  ];

  // Return different counts based on tenant
  const tenantUserCounts: Record<string, number> = {
    t1: 42,
    t2: 18,
    t3: 5,
    t4: 8,
  };

  const count = tenantUserCounts[tenantId] || 5;
  return baseUsers.slice(0, Math.min(count, baseUsers.length));
};

