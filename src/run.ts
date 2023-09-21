#!/usr/bin/env node

import fetch from 'node-fetch';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { getBusFactor } from './busFactor';
import { license } from './license';
import { responsive } from './responsive';
import { rampUp } from './rampUp';
import { fetchCorrectnessData } from './correctness';
import createModuleLogger from './logger';
import { exec } from 'child_process';

const program = new Command();
program
  .command('install')
  .description('Install dependencies')
  .action(() => {
    const child = exec('npm install');

    child.stderr?.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
		try {
			const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
			const dependencyCount = Object.keys(packageJson.dependencies || {}).length;
			console.log(`${dependencyCount} dependencies installed...`);
		} catch (err) {
			console.error('Error reading package.json:', err);
		  }
      } else {
        console.error(`npm install failed with code ${code}.`);
      }
    });
  });
const logger = createModuleLogger('run cli');


async function getGithubUrl(npmUrl: string): Promise<string> {
	const packageName = npmUrl.split('package/')[1];
	const response = await fetch(npmUrl);
	const text = await response.text();
	const githubUrl = text.split('github.com')[1].split('"')[0];
	const githubUrlWithPackageName = githubUrl.split('/')[0] + '/' + githubUrl.split('/')[1] + '/' + packageName;
	return `https://github.com${githubUrlWithPackageName}`;
}

function formatter(metric: number): string {
	const truncated = metric.toFixed(5);
	const trimmed = truncated.replace(/\.?0*$/, '');
	return trimmed;
}

program
	.version('0.0.1')
	.argument('<file>', 'file with npm urls')
	.action(async (file) => {
		try {
			const fileContents = readFileSync(file, 'utf-8');
			const urls = fileContents.split('\n');
			logger.info(`grabbing net score for ${urls}`);
			for (let url of urls) {
				const newUrl = url;
				if (url.includes('npmjs.com')) {
					url = await getGithubUrl(url);
				}
				const busFactor = await getBusFactor(url);
				const licenseScore = await license(url);
				const responsiveScore = await responsive(url);
				const rampUpScore = await rampUp(url);
				const correctnessScore = await fetchCorrectnessData(url);
				const netScore =
					licenseScore *
					(responsiveScore * 0.3 + busFactor * 0.4 + correctnessScore * 0.15 + rampUpScore * 0.15);
				console.log(
					`{"URL":"${newUrl}", "NET_SCORE":${formatter(netScore)}, "RAMP_UP_SCORE":${formatter(
						rampUpScore,
					)}, "CORRECTNESS_SCORE":${formatter(correctnessScore)}, "BUS_FACTOR_SCORE":${formatter(
						busFactor,
					)}, "RESPONSIVE_MAINTAINER_SCORE":${formatter(responsiveScore)}, "LICENSE_SCORE":${formatter(
						licenseScore,
					)}}`,
				);
			}
		} catch (error) {
			logger.error(`Failed to get net score metrics. Error: ${error}`)
			console.error(`Failed to get net score metrics. Error: ${error}`);
		}
	});

program.parse(process.argv);