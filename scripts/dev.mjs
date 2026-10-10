// Starts the API and the React dev server together: `npm run dev` from the root.
// Output from each is prefixed; Ctrl+C stops both.
import { spawn } from 'node:child_process';

const processes = [
  { name: 'api', color: '\x1b[36m', command: 'npm run dev --prefix backend' },
  { name: 'web', color: '\x1b[33m', command: 'npm run dev --prefix frontend' },
];

const children = processes.map(({ name, color, command }) => {
  // A single command string through the shell works for npm on Windows and Unix.
  const child = spawn(command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = `${color}[${name}]\x1b[0m `;
  const forward = (stream, target) =>
    stream.on('data', (chunk) => {
      chunk
        .toString()
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => target.write(`${prefix}${line}\n`));
    });
  forward(child.stdout, process.stdout);
  forward(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${prefix}exited with code ${code}`);
    shutdown(code ?? 0);
  });
  return child;
});

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill());
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
