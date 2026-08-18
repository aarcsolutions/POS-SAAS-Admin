import { spawn } from 'child_process';
import { getAppPort, loadAppEnv } from './load-env.mjs';

loadAppEnv();
const port = getAppPort();

console.log(`Starting SaaS Admin dev server on http://localhost:${port}`);

const child = spawn('npx', ['next', 'dev', '--webpack', '-p', port], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
