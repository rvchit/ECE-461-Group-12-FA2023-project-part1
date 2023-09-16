"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCorrectnessData = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function fetchGitHubData(fullRepoUrl, endpoint) {
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
        throw new Error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    }
    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/${endpoint.replace('OWNER/REPO', repoUrl)}`;
    //console.log('Constructed API URL:', apiUrl);
    const response = await (0, node_fetch_1.default)(apiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`);
    }
    return await response.json();
}
async function fetchCorrectnessData(repoUrl) {
    try {
        const repoUrlMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
        if (!repoUrlMatch) {
            throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
        }
        const repoPath = repoUrlMatch[1];
        const repoDetails = await fetchGitHubData(repoUrl, `repos/${repoPath}`);
        const openPRData = await fetchGitHubData(repoUrl, `search/issues?q=repo:${repoPath}+type:pr+state:open`);
        const closedPRData = await fetchGitHubData(repoUrl, `search/issues?q=repo:${repoPath}+type:pr+state:closed`);
        let prScore = 0;
        if (closedPRData.total_count + openPRData.total_count > 0) {
            prScore = closedPRData.total_count / (closedPRData.total_count + openPRData.total_count);
        }
        const starsScore = Math.min(repoDetails.stargazers_count / 1000, 1);
        return (starsScore + prScore) / 2;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch correctness data: ${error.message}`);
        }
        else {
            throw new Error('An unknown error occurred while fetching correctness data');
        }
    }
}
exports.fetchCorrectnessData = fetchCorrectnessData;
/*async function  printCorrectnessForRepo() {
    const repoUrl = 'https://github.com/netdata/netdata';
    try {
        const result = await fetchCorrectnessData(repoUrl);
        console.log('Correctness score:', result.correctnessScore);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

printCorrectnessForRepo();
*/
