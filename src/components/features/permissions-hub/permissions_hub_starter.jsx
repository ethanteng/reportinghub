import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Bring in the mock Azure AD–style data
import {
  tenants,
  tenantContoso,
  permissionSets,
  reports,
  assignments,
  resolveTransitiveMembers,
  getEffectivePermissionSetId,
  byTenantId,
} from "./mockAzureAD";

// Small helpers
const psById = new Map(permissionSets.map((p) => [p.id, p]));

export default function PermissionsHubStarter() {
  // Pick a tenant to display (Contoso as the default). You can swap in a selector later.
  const [tenantId] = useState(tenantContoso.tenantId);
  const tenant = byTenantId.get(tenantId)!;

  // Cache computed views
  const groups = tenant.groups;
  const groupColumns = ["Group Name", "Members", "Assigned Set", "Actions"];

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions Hub</h1>
          <p className="text-sm text-muted-foreground">Tenant: {tenant.displayName} ({tenant.defaultDomainName})</p>
        </div>
        {/* Placeholder: swap tenants */}
        <Button variant="outline" size="sm" disabled>
          Switch Tenant
        </Button>
      </header>

      <Tabs defaultValue="groups">
        <TabsList className="mb-2">
          <TabsTrigger value="groups">Users & Groups</TabsTrigger>
          <TabsTrigger value="sets">Permission Sets</TabsTrigger>
          <TabsTrigger value="reports">Report Access</TabsTrigger>
        </TabsList>

        {/* Users & Groups */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="font-semibold">Groups from Identity Provider</CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {groupColumns.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const members = resolveTransitiveMembers(tenant, g.id);
                    const eff = getEffectivePermissionSetId(tenant.tenantId, g.id);
                    const ps = eff.permissionSetId ? psById.get(eff.permissionSetId)?.name : "—";
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.displayName}</TableCell>
                        <TableCell>{members.length}</TableCell>
                        <TableCell>
                          {ps !== "—" ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{ps}</Badge>
                              {eff.inheritedFrom && (
                                <Badge variant="outline">Inherited: {eff.inheritedFrom}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Change</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Sets */}
        <TabsContent value="sets">
          <Card>
            <CardHeader className="font-semibold">Permission Sets</CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Capabilities</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionSets.map((ps) => (
                    <TableRow key={ps.id}>
                      <TableCell className="font-medium">{ps.name}</TableCell>
                      <TableCell>{ps.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(ps.capabilities)
                            .filter(([, v]) => v)
                            .map(([k]) => (
                              <Badge key={k} variant="secondary">{k}</Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button className="mt-4">+ Add New Set</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Access */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="font-semibold">Report Access Matrix</CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Report</TableHead>
                      {groups.map((g) => (
                        <TableHead key={g.id}>{g.displayName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{r.name}</span>
                            <span className="text-xs text-muted-foreground">{r.path}</span>
                          </div>
                        </TableCell>
                        {groups.map((g) => {
                          const eff = getEffectivePermissionSetId(tenant.tenantId, g.id, r.id);
                          const label = eff.permissionSetId ? psById.get(eff.permissionSetId)?.name : "—";
                          const inherited = eff.inheritedFrom === "Tenant";
                          return (
                            <TableCell key={`${r.id}-${g.id}`}>
                              {label !== "—" ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant={inherited ? "secondary" : "default"}>{label}</Badge>
                                  {inherited ? (
                                    <Badge variant="outline">Inherited</Badge>
                                  ) : (
                                    <Badge variant="outline">Override</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not assigned</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
