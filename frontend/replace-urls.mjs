import fs from 'fs';
import path from 'path';

const files = [
  'frontend/src/pages/motogp.astro',
  'frontend/src/pages/motogp/[event].astro',
  'frontend/src/pages/motogp/standings.astro',
  'frontend/src/pages/index.astro',
  'frontend/src/pages/f1.astro',
  'frontend/src/pages/f1/[event].astro',
  'frontend/src/pages/f1/standings.astro',
  'frontend/src/components/LiveCountdown.svelte'
];

for (const file of files) {
  const filePath = path.join('c:/Users/Admin/Documents/Calender Race', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('http://localhost:3000')) {
    // Add import statement at the top of script tag or frontmatter
    let importPath = '../utils/api';
    if (file.includes('[event].astro') || file.includes('standings.astro')) importPath = '../../utils/api';
    else if (file.includes('LiveCountdown.svelte')) importPath = '../utils/api';
    
    // For Astro files, frontmatter starts with ---
    if (file.endsWith('.astro')) {
      content = content.replace('---\n', `---\nimport { API_URL } from '${importPath}';\n`);
    } else if (file.endsWith('.svelte')) {
      content = content.replace('<script lang="ts">\n', `<script lang="ts">\n  import { API_URL } from '${importPath}';\n`);
    }
    
    // Replace hardcoded URLs
    content = content.replace(/'http:\/\/localhost:3000\/(.*?)'/g, '`${API_URL}/$1`');
    content = content.replace(/`http:\/\/localhost:3000\/(.*?)`/g, '`${API_URL}/$1`');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
