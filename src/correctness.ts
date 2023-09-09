import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

interface CorrectnessResult {
    correctnessScore: number;
}


async function fetchGitHubData(fullRepoUrl: string, endpoint: string): Promise<any> {
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
        throw new Error(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    }

    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/${endpoint.replace('OWNER/REPO', repoUrl)}`;

    //console.log('Constructed API URL:', apiUrl); 

    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`);
    }

    return await response.json();
}

async function fetchCorrectnessData(repoUrl: string): Promise<CorrectnessResult> {
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
        
        return {
            correctnessScore: (starsScore + prScore) / 2
        };

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch correctness data: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching correctness data');
        }
    }
}

async function  printCorrectnessForRepo() {
    const repoUrl = 'https://github.com/wolever/parameterized';
    try {
        const result = await fetchCorrectnessData(repoUrl);
        console.log('Correctness score:', result.correctnessScore);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

printCorrectnessForRepo();