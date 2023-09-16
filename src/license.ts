//function uses github token in .env file to use githubAPI and uses a regEx to find the license in the readme file in typescript
//input = github url, output = score. Score = 0 if no license, Score = 1 if license is found
//uses fetch

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
async function license(url: string): Promise<number> {
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
		throw new Error(`Failed to fetch readme from ${apiURL}`);
	}

	const { content }: { content: string } = await response.json();
	const readme = Buffer.from(content, 'base64').toString('utf-8');
	const licenseRegex = /licen[sc]e/gi;
	const hasLicense = licenseRegex.test(readme);

	return hasLicense ? 1 : 0;
}

export { license };
