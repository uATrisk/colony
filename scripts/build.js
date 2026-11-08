import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- Building NANDI Township CAD Viewer ---');

// 1. Prepare index.html from template for Vite compilation
fs.copyFileSync('index.template.html', 'index.html');

// 2. Run Vite build
execSync('npx vite build', { stdio: 'inherit' });

// 3. Sync dist files to root so GitHub Pages works in BOTH "branch deployment" and "Actions deployment"
fs.mkdirSync('assets', { recursive: true });
fs.copyFileSync('dist/assets/app.js', 'assets/app.js');
fs.copyFileSync('dist/assets/index.css', 'assets/index.css');

// 4. Overwrite root index.html with production-ready dist/index.html
fs.copyFileSync('dist/index.html', 'index.html');

// 5. Copy public files to root so they can be downloaded directly from root path
const publicFiles = ['plots.json', 'plot_schedule.csv', 'area_statement.csv', 'nandi_township_master_plan.dxf'];
for (const file of publicFiles) {
  if (fs.existsSync(path.join('public', file))) {
    fs.copyFileSync(path.join('public', file), file);
  }
}

console.log('[OK] Build and root synchronization complete!');
