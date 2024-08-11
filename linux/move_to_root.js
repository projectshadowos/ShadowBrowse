import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const electronVersion = packageJson.devDependencies.electron.replace('^', '');

    const directory = path.join(process.cwd(), `node_modules/.pnpm/electron@${electronVersion}/node_modules/electron/dist`);
    const sandbox = path.join(directory, 'chrome-sandbox');

    execSync('su -c "echo Sudo session started"', { stdio: 'inherit', shell: '/bin/bash' });

    execSync(`sudo chown root:root ${sandbox}`, { stdio: 'inherit', shell: '/bin/bash' });
    execSync(`sudo chmod 4755 ${sandbox}`, { stdio: 'inherit', shell: '/bin/bash' });

    console.log('Directory moved to root successfully.');
} catch (error) {
    console.error('Failed to move directory to root:', error);
}