import fetch from 'node-fetch';
import dotenv from 'dotenv';
import createModuleLogger from './logger';

//Initialize logger
const logger = createModuleLogger('Bus Factor');

dotenv.config();

interface Contributor {
	login: string;
	contributions: number;
}

export async function fetchContributors(fullRepoUrl: string): Promise<Contributor[]> {
	logger.info(`Fetching contributors for repo: ${fullRepoUrl}`);

	const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
	if (!repoUrlMatch || repoUrlMatch.length < 2 || repoUrlMatch === null) {
		logger.info(`Invalid GitHub repository URL: ${fullRepoUrl}`);
		console.log(`Invalid GitHub repository URL: ${fullRepoUrl}`);
		process.exit(1);
	}

	const repoUrl = repoUrlMatch[1];

	const apiUrl = `https://api.github.com/repos/${repoUrlMatch[1]}/contributors`;

	logger.info(`Constructed API URL: ${apiUrl}`);

	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
		},
	});

	if (!response.ok) {
		logger.info(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
		console.log(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
		process.exit(1);
	}
	let data;
	try{
		data = await response.json();
	} catch(err){
		logger.info(`Failed to parse response from ${repoUrl}. Status: ${response.statusText}`);
		console.log(`Failed to parse response from ${repoUrl}. Status: ${response.statusText}`);
		process.exit(1);
	}

	if (!Array.isArray(data) || !data.every((d) => 'login' in d && 'contributions' in d)) {
		logger.info(`Expected an array of contributors but received a different type.`);
		console.log(`Expected an array of contributors but received a different type.`);
		process.exit(1);
	}

	return data.map((item) => ({
		login: item.login,
		contributions: item.contributions,
	}));
}

function calculateBusFactor(contributors: Contributor[]): number {
	if (contributors.length === 1 && contributors[0].contributions > 0) {
		logger.info(`Only one contributor with all contributions. Bus factor: 0`);
		return 0;
	}

	const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);

	let majorContributorsCount = 0;
	let contributionsCounted = 0;
	const percentOfTotalContributions =
		sortedContributors.reduce((acc, contributor) => acc + contributor.contributions, 0) * 0.6;

	for (const contributor of sortedContributors) {
		contributionsCounted += contributor.contributions;
		majorContributorsCount++;

		if (contributionsCounted >= percentOfTotalContributions) {
			logger.info(`Bus factor calculated with ${majorContributorsCount} major contributors.`);
			break;
		}
	}

	const busFactor = Math.min(majorContributorsCount / 10, 1);
	logger.info(`Calculated bus factor: ${busFactor}`);

	return busFactor;
}

export async function getBusFactor(repoUrl: string): Promise<number> {
	const contributors = await fetchContributors(repoUrl);
	return calculateBusFactor(contributors);
}
