import fetch from 'node-fetch';
import dotenv from 'dotenv';
import createModuleLogger from './logger';

const logger = createModuleLogger('Correctness');

dotenv.config();

export async function fetchGitHubData(fullRepoUrl: string, endpoint: string): Promise<any> {
	logger.info(`Fetching contributors for repo: ${fullRepoUrl}`);
	const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
	if (!repoUrlMatch) {
		logger.error(`Invalid GitHub repository URL:', ${fullRepoUrl}`);
		console.log(`Invalid GitHub repository URL: ${fullRepoUrl}`);
		process.exit(1);
	}

	const repoUrl = repoUrlMatch[1];
	const apiUrl = `https://api.github.com/${endpoint.replace('OWNER/REPO', repoUrl)}`;

	logger.info(`Constructed API URL: ${apiUrl}`);

	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
		},
	});

	if (!response.ok) {
		logger.error(`Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`);
		console.log(`Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`);
		process.exit(1);
	}

	return await response.json();
}

export async function fetchCorrectnessData(repoUrl: string): Promise<number> {
	try {
		const repoUrlMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
		if (!repoUrlMatch) {
			logger.error(`Invalid GitHub repository URL: ${repoUrl}`);
			console.log(`Invalid GitHub repository URL: ${repoUrl}`);
			process.exit(1);
		}
		const repoPath = repoUrlMatch[1];

		const repoDetails = await fetchGitHubData(repoUrl, `repos/${repoPath}`);
		const openPRData = await fetchGitHubData(repoUrl, `search/issues?q=repo:${repoPath}+type:pr+state:open`);
		const closedPRData = await fetchGitHubData(repoUrl, `search/issues?q=repo:${repoPath}+type:pr+state:closed`);

		let prScore = 0;
		if (closedPRData.total_count + openPRData.total_count > 0) {
			prScore = closedPRData.total_count / (closedPRData.total_count + openPRData.total_count);
		}
		logger.info(`Calculated PR score: ${prScore}`);

		const starsScore = Math.min(repoDetails.stargazers_count / 1000, 1);
		logger.info(`Calculated stars score: ${starsScore}`);

		const finalScore = (starsScore + prScore) / 2;
		logger.info(`Calculated final score: ${finalScore}`);

		return finalScore;
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error(`Failed to fetch correctness data: ${error.message}`);
			console.log(`Failed to fetch correctness data: ${error.message}`);
		} else {
			logger.error('An unknown error occurred while fetching correctness data');
			console.log('An unknown error occurred while fetching correctness data');
		}
		process.exit(1);	
	}
}
