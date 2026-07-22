const fs = require('fs');
const path = require('path');

const directories = ['src/components', 'src/pages'];

const replacements = [
  { regex: /indigo-600/g, replacement: '[var(--color-primary)]' },
  { regex: /indigo-500/g, replacement: '[var(--color-primary)]' },
  { regex: /indigo-400/g, replacement: '[var(--color-primary)]' },
  { regex: /indigo-300/g, replacement: '[var(--color-secondary)]' },
  { regex: /purple-600/g, replacement: '[var(--color-primary-hover)]' },
  { regex: /purple-500/g, replacement: '[var(--color-primary-hover)]' },
  { regex: /emerald-500/g, replacement: '[var(--color-secondary)]' },
  { regex: /emerald-400/g, replacement: '[var(--color-secondary)]' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Theme replacement complete.');
