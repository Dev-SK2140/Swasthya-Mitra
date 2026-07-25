const fs = require('fs');
const path = require('path');

const clientSrcDir = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /(?<!dark:)bg-slate-900(?![\/\-])/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
  { regex: /(?<!dark:)bg-slate-950(?![\/\-])/g, replacement: 'bg-slate-100 dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-slate-800(?![\/\-])/g, replacement: 'bg-white dark:bg-slate-800' },
  // Opacity backgrounds
  { regex: /(?<!dark:)bg-slate-900\/50/g, replacement: 'bg-slate-50/50 dark:bg-slate-900/50' },
  { regex: /(?<!dark:)bg-slate-800\/50/g, replacement: 'bg-white/50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-800\/60/g, replacement: 'bg-white/60 dark:bg-slate-800/60' },
  { regex: /(?<!dark:)bg-slate-800\/80/g, replacement: 'bg-white/80 dark:bg-slate-800/80' },
  { regex: /(?<!dark:)bg-slate-800\/90/g, replacement: 'bg-white/90 dark:bg-slate-800/90' },
  { regex: /(?<!dark:)bg-slate-900\/60/g, replacement: 'bg-slate-50/60 dark:bg-slate-900/60' },
  { regex: /(?<!dark:)bg-slate-900\/80/g, replacement: 'bg-slate-50/80 dark:bg-slate-900/80' },
  
  // Text
  { regex: /(?<!dark:)text-white(?![\/\-])/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-300(?![\/\-])/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-200(?![\/\-])/g, replacement: 'text-slate-700 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-400(?![\/\-])/g, replacement: 'text-slate-500 dark:text-slate-400' },
  
  // Borders
  { regex: /(?<!dark:)border-slate-800(?![\/\-])/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-700(?![\/\-])/g, replacement: 'border-slate-300 dark:border-slate-700' },
  { regex: /(?<!dark:)border-slate-700\/50/g, replacement: 'border-slate-300/50 dark:border-slate-700/50' },
  { regex: /(?<!dark:)border-slate-700\/80/g, replacement: 'border-slate-300/80 dark:border-slate-700/80' },
  { regex: /(?<!dark:)border-white\/10/g, replacement: 'border-slate-200 dark:border-white/10' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log('Starting class replacement...');
processDirectory(clientSrcDir);
console.log('Done!');
