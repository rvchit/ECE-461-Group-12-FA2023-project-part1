import dotenv from 'dotenv';
import createModuleLogger from './logger';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import { dir } from 'tmp-promise';
import { dir as tmpDir } from 'tmp-promise';


dotenv.config();

const logger = createModuleLogger('Ramp Up');
async function rampUp(url: string): Promise<number>{
	let score = 0;
	const { path: tmpPath, cleanup } = await tmpDir({ unsafeCleanup: true });
	logger.info(`Cloning ${url} to ${tmpPath}`);
	await git.clone({
		fs,
		http,
		dir: tmpPath,
		url,
		singleBranch: true,
		depth: 1,
	});
	let readme;
	const readmeVariations = ['README.md', 'readme.md', 'Readme.md', 'readme.markdown'];

	for (const readmeFile of readmeVariations) {
		try {
			readme = fs.readFileSync(path.join(tmpPath, readmeFile), 'utf-8');
			break;
		} catch {
			// If reading fails, continue to the next iteration
		}
	}

	if (!readme) {
		logger.info("Couldn't find a readable README file locally; Score of 0");
		await cleanup();
		return 0;
	}

	// Calculate ramp up score based on the README content
	const readmeLines = readme.split('\n').length;
	score += 0.2 * Math.min(readmeLines / 200, 1);
	logger.debug(`Calculated score based on README length: ${score}`);

	// Keywords score calculation using regex pattern
	const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
	const matches = readme.match(keywordPattern);

	const uniqueMatches = matches ? new Set(matches.map((match) => match.toLowerCase())) : new Set();
	score += Math.min(0.16 * uniqueMatches.size, 0.8);
	logger.debug(`Found ${uniqueMatches.size} unique keywords in README. Updated score: ${score}`);

	cleanup();
	logger.debug(`Temporary directory cleaned up.`);
	return score;
}

export { rampUp };