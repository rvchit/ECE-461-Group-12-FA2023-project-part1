import fetch from 'node-fetch';
import dotenv from 'dotenv'
dotenv.config();

interface Contributor {
    login: string;
    contributions: number;
}

interface BusFactorResult {
    busFactor: number;
    majorContributors: Contributor[];
    totalContributors: number;
}

async function fetchContributors(repoUrl: string): Promise<Contributor[]> {
    const apiUrl = `https://api.github.com/repos/${repoUrl}/contributors`;
    console.log('Constructed API URL:', apiUrl);
    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_API_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || !data.every(d => 'login' in d && 'contributions' in d)) { //checking if data is in an array and if data has login & contribution property
        throw new Error('Expected an array of contributors but received a different type.');
    }

    return data.map(item => ({ login: item.login, contributions: item.contributions }));
}

function calculateBusFactor(contributors: Contributor[]): BusFactorResult {
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

    const busFactor = majorContributorsCount / sortedContributors.length;

    return {
        busFactor,
        majorContributors: sortedContributors.slice(0, majorContributorsCount),
        totalContributors: sortedContributors.length
    };
}

async function getBusFactor(repoUrl: string): Promise<BusFactorResult> {
    const contributors = await fetchContributors(repoUrl);
    return calculateBusFactor(contributors);
}

const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
async function printBusFactorForRepo() {
    const repoUrl = 'netdata/netdata';
    const result = await getBusFactor(repoUrl);

    console.log(result);
}

printBusFactorForRepo();