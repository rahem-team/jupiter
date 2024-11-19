#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import ora from 'ora';

program.name('jupiter').description('CLI to manage jupiter');

// program.action(async () => {

program
  .argument('<directory>', 'Directory to clone the Next.js app')
  .action(async directory => {
    // check git is installed
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf-8' });
      console.log('Git is installed:', gitVersion);
    } catch (error) {
      console.error(
        'Git is not installed. Please install Git from the following link: https://git-scm.com/downloads'
      );
      process.exit(1);
    }

    // state cli start to work
    console.log('Jupiter is started');

    // detemine the root folder
    if (directory === '.') {
      directory = process.cwd();
      if (fs.existsSync(path.join(directory, '.git'))) {
        console.log(
          `The current directory is already has a Git repository. Aborting the process.`
        );
        process.exit(1);
      }
    } else {
      const targetDir = path.join(process.cwd(), directory);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      directory = targetDir;
    }

    // get the appliaction title
    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Waht is your app title?',
        default: 'Jupiter',
      },
    ]);

    // clone the jupiter-core
    try {
      execSync(
        `git clone --single-branch -b main https://github.com/rahem-team/jupiter-core.git ${directory}`,
        {
          stdio: 'inherit',
        }
      );
    } catch (error) {
      console.log('something went wrong, try later');
      process.exit(1);
    }

    // add the .evn file
    const envPath = path.join(directory, '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = `# Add your environment variables here

NEXt_PUBLIC_APP = ${title}
      `;
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  });

program.parse();
