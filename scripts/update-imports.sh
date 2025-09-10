#!/bin/bash

echo "🔄 Updating imports to use new src structure..."

# Find all TypeScript/JavaScript files and update imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  echo "Processing: $file"
  
  # Update relative imports to use @/ aliases
  sed -i '' 's|from '\''\.\./\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./\.\./mockAzureAD'\''|from '\''@/types/mockAzureAD'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./\.\./store/usePermissionsStore'\''|from '\''@/store/usePermissionsStore'\''|g' "$file"
  sed -i '' 's|from '\''\.\./\.\./\.\./\.\./\.\./lib/utils'\''|from '\''@/lib/utils'\''|g' "$file"
done

echo "✅ Import updates complete!"
