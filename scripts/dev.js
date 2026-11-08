import fs from 'fs';
import { spawn } from 'child_process';

fs.copyFileSync('index.template.html', 'index.html');
const child = spawn('npx', ['vite'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
