import dotenv from 'dotenv';
import createModuleLogger from './logger';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import { dir } from 'tmp-promise';

dotenv.config();

const logger = createModuleLogger('Ramp Up');

export async function rampUp(url: string): Promise<number> {
	let score = 0;

	try {
		// Create a temporary directory to clone the repository
		const { path: localPath, cleanup } = await dir();

		// Clone the repository using isomorphic-git
		await git.clone({ fs, http, dir: localPath, url });

		// Try reading the README.md file from the local clone
		let readme;
		try {
			readme = fs.readFileSync(path.join(localPath, 'README.md'), 'utf-8');
		} catch {
			logger.info("Couldn't find README.md locally; Score of 0");
			await cleanup();
			return 0;
		}

		// Calculate ramp up score based on the README content
		const readmeLines = readme.split('\n').length;

		if (readmeLines > 0) {
			score += 0.2 * Math.min(readmeLines / 200, 1);
		}

		// Keywords score calculation using regex pattern
		const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
		const matches = readme.match(keywordPattern);

		if (matches) {
			const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
			score += 0.16 * uniqueMatches.size;
		}

		// Cleanup the cloned repository
		await cleanup();

		// If score is greater than 1, return 1
		if (score > 1) {
			return 1;
		}

		return score;
	} catch (error) {
		logger.error('Error in rampUp function', error);
		return score;
	}
}
