import fetch from 'node-fetch';
import dotenv from 'dotenv';
import createModuleLogger from './logger';

const logger = createModuleLogger('Ramp Up');
dotenv.config();

export async function rampUp(url: string): Promise<number> {
	const urlParts = url.split('/');
	const repo = urlParts.pop();
	const owner = urlParts.pop();
	const apiURL = `https://api.github.com/repos/${owner}/${repo}/readme`;

	const response = await fetch(apiURL, {
		headers: {
			Authorization: `token ${process.env.GITHUB_TOKEN}`,
		},
	});

	if (!response.ok) {
		logger.info("Couldn't get readme for rampuUp. Score of 0");
		return 0;
	}

	const { content } = await response.json();
	const readme = Buffer.from(content, 'base64').toString('utf-8');
	const readmeLines = readme.split('\n').length;

	// Readme length score calculation
	let score = 0;
	if (readmeLines > 0) {
		score += 0.2 * Math.min(readmeLines / 200, 1);
	}

	// Keywords score calculation using cregex pattern
	const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
	const matches = readme.match(keywordPattern);

	if (matches) {
		// use a Set to eliminate duplicate matches, then get the unique count
		const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
		score += 0.16 * uniqueMatches.size;
	}
	//if score is greater than 1, return 1
	if (score > 1) {
		return 1;
	}
	return score;
}
