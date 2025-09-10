const fs = require('fs');
const path = require('path');

// Define the mapping of old imports to new imports
const importMappings = [
  // Mock Azure AD imports
  { from: /from ['"]\.\.\/\.\.\/\.\.\/mockAzureAD['"]/g, to: "from '@/types/mockAzureAD'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/mockAzureAD['"]/g, to: "from '@/types/mockAzureAD'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/mockAzureAD['"]/g, to: "from '@/types/mockAzureAD'" },
  
  // Store imports
  { from: /from ['"]\.\.\/\.\.\/\.\.\/store\/usePermissionsStore['"]/g, to: "from '@/store/usePermissionsStore'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/store\/usePermissionsStore['"]/g, to: "from '@/store/usePermissionsStore'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/store\/usePermissionsStore['"]/g, to: "from '@/store/usePermissionsStore'" },
  
  // Utils imports
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils['"]/g, to: "from '@/lib/utils'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils['"]/g, to: "from '@/lib/utils'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils['"]/g, to: "from '@/lib/utils'" },
  
  // Modal imports (relative to components)
  { from: /from ['"]\.\/modals\//g, to: "from '../modals/" },
  { from: /from ['"]\.\.\/modals\//g, to: "from '../modals/" },
];

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to update imports in a file
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    importMappings.forEach(mapping => {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔄 Fixing import paths...');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to process`);

files.forEach(updateImports);

console.log('✅ Import fixing complete!');
