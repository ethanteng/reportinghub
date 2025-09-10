#!/bin/bash

echo "🔄 Fixing all remaining import paths..."

# Fix all remaining relative imports to use @/ aliases
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  echo "Processing: $file"
  
  # Fix mockAzureAD imports
  sed -i '' 's|from '\''\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  
  # Fix store imports
  sed -i '' 's|from '\''\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  
  # Fix lib imports
  sed -i '' 's|from '\''\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
  
  # Fix modal imports in index.ts
  sed -i '' 's|from '\''\.\./modals/|from '\''./modals/|g' "$file"
done

echo "✅ All imports fixed!"
