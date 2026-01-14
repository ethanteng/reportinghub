'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { availableUsersAndGroups } from '@/lib/data/manageContent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageMultiSelect } from './PageMultiSelect';

interface PermissionsSelectorProps {
  users: string[];
  groups: string[];
  onUsersChange: (users: string[]) => void;
  onGroupsChange: (groups: string[]) => void;
  availableRoles: Array<{ id: string; name: string }>;
  userRoles: Record<string, string>; // Map of user/group name to role ID
  onUserRoleChange: (userOrGroup: string, roleId: string) => void;
  hasSelectedModel: boolean;
  modelSupportsRLS: boolean;
  availablePages?: string[]; // Available pages for selection
  userPages?: Record<string, string[]>; // Map of user/group name to selected pages
  onUserPagesChange?: (userOrGroup: string, pages: string[]) => void;
}

export function PermissionsSelector({
  users,
  groups,
  onUsersChange,
  onGroupsChange,
  availableRoles,
  userRoles,
  onUserRoleChange,
  hasSelectedModel,
  modelSupportsRLS,
  availablePages = [],
  userPages = {},
  onUserPagesChange,
}: PermissionsSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter available options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) {
      return availableUsersAndGroups;
    }
    const searchLower = inputValue.toLowerCase();
    return availableUsersAndGroups.filter((option) =>
      option.toLowerCase().includes(searchLower)
    );
  }, [inputValue]);

  // Get already selected items
  const selectedItems = useMemo(() => {
    return new Set([...users, ...groups]);
  }, [users, groups]);

  // Filter out already selected items
  const availableOptions = useMemo(() => {
    return filteredOptions.filter((option) => !selectedItems.has(option));
  }, [filteredOptions, selectedItems]);

  const handleSelect = (value: string) => {
    // Determine if it's a group (contains "admin" or "group" or "Admin" or "Group")
    const isGroup = 
      value.toLowerCase().includes('admin') || 
      value.toLowerCase().includes('group');
    
    if (isGroup) {
      if (!groups.includes(value)) {
        onGroupsChange([...groups, value]);
      }
    } else {
      if (!users.includes(value)) {
        onUsersChange([...users, value]);
      }
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // If there's a filtered match, select the first one
      if (availableOptions.length > 0) {
        handleSelect(availableOptions[0]);
      } else if (filteredOptions.length > 0) {
        // If exact match exists but is already selected, do nothing
        // Otherwise, allow manual entry
        const exactMatch = filteredOptions.find(
          (opt) => opt.toLowerCase() === inputValue.toLowerCase()
        );
        if (exactMatch && !selectedItems.has(exactMatch)) {
          handleSelect(exactMatch);
        }
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const removeGroup = (groupToRemove: string) => {
    onGroupsChange(groups.filter((g) => g !== groupToRemove));
    // Remove role assignment when group is removed
    if (userRoles[groupToRemove]) {
      onUserRoleChange(groupToRemove, '');
    }
    // Remove page assignments when group is removed
    if (onUserPagesChange && userPages && userPages[groupToRemove]) {
      onUserPagesChange(groupToRemove, []);
    }
  };

  const removeUser = (userToRemove: string) => {
    onUsersChange(users.filter((u) => u !== userToRemove));
    // Remove role assignment when user is removed
    if (userRoles[userToRemove]) {
      onUserRoleChange(userToRemove, '');
    }
    // Remove page assignments when user is removed
    if (onUserPagesChange && userPages && userPages[userToRemove]) {
      onUserPagesChange(userToRemove, []);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Assign Permissions (Users/Security Groups)"
      >
        <div className="relative">
          <Input
            placeholder="Type to search group name or user email"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // Delay hiding dropdown to allow click events
              setTimeout(() => setShowDropdown(false), 200);
            }}
          />
          {showDropdown && availableOptions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
              {availableOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </FormField>

      {/* Selected groups/users - Each on its own line with role dropdown */}
      {(groups.length > 0 || users.length > 0) && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Groups/Users Selected:</Label>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group} className="flex items-center">
                <div className="flex-shrink-0 min-w-[400px] mr-8">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 w-fit"
                  >
                    <span>{group}</span>
                    <button
                      onClick={() => removeGroup(group)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  {hasSelectedModel && availableRoles.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      {modelSupportsRLS 
                        ? 'No roles available for the selected semantic model'
                        : 'The selected semantic model does not support roles'}
                    </div>
                  )}
                  {availableRoles.length > 0 && (
                    <div className="relative flex-shrink-0 w-48">
                      <Select
                        value={userRoles[group] || ''}
                        onValueChange={(value) => onUserRoleChange(group, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {availablePages.length > 0 && onUserPagesChange && (
                    <PageMultiSelect
                      availablePages={availablePages}
                      selectedPages={userPages[group] || []}
                      onSelectedPagesChange={(pages) => onUserPagesChange(group, pages)}
                    />
                  )}
                </div>
              </div>
            ))}
            {users.map((user) => (
              <div key={user} className="flex items-center">
                <div className="flex-shrink-0 min-w-[400px] mr-8">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 w-fit"
                  >
                    <span>{user}</span>
                    <button
                      onClick={() => removeUser(user)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  {hasSelectedModel && availableRoles.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      {modelSupportsRLS 
                        ? 'No roles available for the selected semantic model'
                        : 'The selected semantic model does not support roles'}
                    </div>
                  )}
                  {availableRoles.length > 0 && (
                    <div className="relative flex-shrink-0 w-48">
                      <Select
                        value={userRoles[user] || ''}
                        onValueChange={(value) => onUserRoleChange(user, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {availablePages.length > 0 && onUserPagesChange && (
                    <PageMultiSelect
                      availablePages={availablePages}
                      selectedPages={userPages[user] || []}
                      onSelectedPagesChange={(pages) => onUserPagesChange(user, pages)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
