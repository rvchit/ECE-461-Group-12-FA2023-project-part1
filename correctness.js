"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCorrectnessData = exports.fetchGitHubData = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)('Correctness');
dotenv_1.default.config();
async function fetchGitHubData(fullRepoUrl, endpoint) {
    logger.info(`Fetching contributors for repo: ${fullRepoUrl}`);
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
        logger.error(`Invalid GitHub repository URL:', ${fullRepoUrl}`);
        console.log(`Invalid GitHub repository URL: ${fullRepoUrl}`);
        process.exit(1);
    }
    console.log(repoUrlMatch);
    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/${endpoint.replace('OWNER/REPO', repoUrl)}`;
    logger.info(`Constructed API URL: ${apiUrl}`);
    const response = await (0, node_fetch_1.default)(apiUrl, {
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
exports.fetchGitHubData = fetchGitHubData;
async function fetchCorrectnessData(repoUrl) {
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
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to fetch correctness data: ${error.message}`);
            console.log(`Failed to fetch correctness data: ${error.message}`);
        }
        else {
            logger.error('An unknown error occurred while fetching correctness data');
            console.log('An unknown error occurred while fetching correctness data');
        }
        process.exit(1);
    }
}
exports.fetchCorrectnessData = fetchCorrectnessData;
