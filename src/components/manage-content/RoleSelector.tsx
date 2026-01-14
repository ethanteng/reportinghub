'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Role } from '@/types/manageContent';
import { Eye } from 'lucide-react';

interface RoleSelectorProps {
  roles: Role[];
  value?: string;
  onChange: (roleId: string) => void;
}

export function RoleSelector({ roles, value, onChange }: RoleSelectorProps) {
  if (roles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Role</Label>
      <div className="relative">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pr-8">
            <SelectValue placeholder="..." />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
