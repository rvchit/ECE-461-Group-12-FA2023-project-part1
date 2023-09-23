import fetch from "node-fetch";
import dotenv from "dotenv";
import createModuleLogger from "./logger";

//Initialize logger
const logger = createModuleLogger('Bus Factor');

dotenv.config();

interface Contributor {
  login: string;
  contributions: number;
}

export async function fetchContributors(
  fullRepoUrl: string,
): Promise<Contributor[]> {
  logger.info(`Fetching contributors for repo: ${fullRepoUrl}`);

  const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
  if (!repoUrlMatch) {
    logger.error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    throw new Error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
  }

  const repoUrl = repoUrlMatch[1];
  const apiUrl = `https://api.github.com/repos/${repoUrl}/contributors`;

  logger.info(`Constructed API URL: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    logger.error(
      `Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`,
    );
    throw new Error(
      `Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (
    !Array.isArray(data) ||
    !data.every((d) => "login" in d && "contributions" in d)
  ) {
    logger.error(
      `Expected an array of contributors but received a different type.`,
    );
    throw new Error(
      `Expected an array of contributors but received a different type.`,
    );
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
      logger.info(
        `Bus factor calculated with ${majorContributorsCount} major contributors.`,
      );
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
