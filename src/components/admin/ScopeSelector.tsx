'use client';

import { Scope } from '@/types/apiKeys';
import { availableScopes } from '@/lib/data/admin/scopes';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ScopeSelectorProps {
  selectedScopes: Scope[];
  onScopesChange: (scopes: Scope[]) => void;
}

export function ScopeSelector({ selectedScopes, onScopesChange }: ScopeSelectorProps) {
  const handleScopeToggle = (scopeId: Scope) => {
    if (selectedScopes.includes(scopeId)) {
      onScopesChange(selectedScopes.filter((s) => s !== scopeId));
    } else {
      onScopesChange([...selectedScopes, scopeId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Scopes</h3>
        <p className="text-sm text-muted-foreground">
          Choose the permissions this API key will have. Select only what&apos;s needed for your use case.
        </p>
      </div>

      <div className="space-y-3">
        {availableScopes.map((scope) => (
          <Card
            key={scope.id}
            className={`cursor-pointer transition-colors ${
              selectedScopes.includes(scope.id)
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleScopeToggle(scope.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={scope.id}
                  checked={selectedScopes.includes(scope.id)}
                  onCheckedChange={() => handleScopeToggle(scope.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <CardTitle className="text-base font-medium">{scope.name}</CardTitle>
                  <CardDescription className="mt-1">{scope.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedScopes.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Select at least one scope to continue.
        </p>
      )}
    </div>
  );
}
