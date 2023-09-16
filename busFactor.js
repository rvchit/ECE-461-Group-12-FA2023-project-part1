"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusFactor = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function fetchContributors(fullRepoUrl) {
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
        throw new Error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    }
    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/repos/${repoUrl}/contributors`;
    //console.log('Constructed API URL:', apiUrl);
    const response = await (0, node_fetch_1.default)(apiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || !data.every((d) => 'login' in d && 'contributions' in d)) {
        throw new Error('Expected an array of contributors but received a different type.');
    }
    return data.map((item) => ({
        login: item.login,
        contributions: item.contributions,
    }));
}
function calculateBusFactor(contributors) {
    const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);
    let majorContributorsCount = 0;
    let contributionsCounted = 0;
    const halfOfTotalContributions = sortedContributors.reduce((acc, contributor) => acc + contributor.contributions, 0) / 2;
    for (const contributor of sortedContributors) {
        contributionsCounted += contributor.contributions;
        majorContributorsCount++;
        if (contributionsCounted >= halfOfTotalContributions) {
            break;
        }
    }
    const busFactor = Math.min(majorContributorsCount / 10, 1);
    return busFactor;
}
async function getBusFactor(repoUrl) {
    const contributors = await fetchContributors(repoUrl);
    return calculateBusFactor(contributors);
}
exports.getBusFactor = getBusFactor;
/*async function printBusFactorForRepo() {
    const repoUrl = 'https://github.com/netdata/netdata';
    try {
        const result = await getBusFactor(repoUrl);
        console.log('Bus factor:', result.busFactor);
    } catch (error) {
        console.error('Error fetching bus factor:', error);
    }
}

printBusFactorForRepo();
*/
