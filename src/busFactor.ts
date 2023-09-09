import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

interface Contributor {
    login: string;
    contributions: number;
}

interface BusFactorResult {
    busFactor: number;
}

async function fetchContributors(fullRepoUrl: string): Promise<Contributor[]> {
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
        throw new Error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    }

    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/repos/${repoUrl}/contributors`;
    //console.log('Constructed API URL:', apiUrl); 
    
    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || !data.every(d => 'login' in d && 'contributions' in d)) {
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

    const busFactor = Math.min(majorContributorsCount / 10, 1);

    return {
        busFactor,
    };
}

async function writeDataToFile(data: BusFactorResult, filePath: string): Promise<void> {
    const ndjson = JSON.stringify(data) + '\n';
    return fs.promises.writeFile(filePath, ndjson, { flag: 'a' });
}

export async function getBusFactor(repoUrl: string): Promise<BusFactorResult> {
    const contributors = await fetchContributors(repoUrl);
    return calculateBusFactor(contributors);
}



const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
async function printBusFactorForRepo() {
    const repoUrl = 'https://github.com/netdata/netdata';
    try {
        const result = await getBusFactor(repoUrl);
        await writeDataToFile(result, 'busfactorout.ndjson')
        //console.log('Data written to output.ndjson');
    } catch (error) {
        console.error('Error fetching bus factor:', error);
    }
}

printBusFactorForRepo();