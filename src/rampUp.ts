// A score of 0 means you don’t have a readMe.  

// readMe length score has a weight of 0.2. The readMe length score has a score of 0
// if the readMe is 0 lines long (empty), and 200 lines means a score of 1. And then 
// we scale the length of a readMe to be between those 2 sizes. 

// Key words have a certain weight based on a regEx parse. 

// “Installation”, “Features”, “Quick Start”, “Wiki” or “Guide”, “Examples” would each 
// have a weight of 0.16 totaling to a combined weight of 0.8 

import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function rampUp(url: string): Promise<number> {
    const urlParts = url.split("/");
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const apiURL = `https://api.github.com/repos/${owner}/${repo}/readme`;

    const response = await fetch(apiURL, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });

    if (!response.ok) {
        // A score of 0 means don’t have a readMe.
        return 0;
    }

    const { content } = await response.json();
    const readme = Buffer.from(content, "base64").toString("utf-8");
    const readmeLines = readme.split('\n').length;

    // Readme length score calculation
    let score = 0;
    if (readmeLines > 0) {
        score += 0.2 * Math.min(readmeLines / 200, 1);
    }

    // Keywords score calculation using cregex pattern
    const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
    const matches = readme.match(keywordPattern);

    if (matches) {
        // use a Set to eliminate duplicate matches, then get the unique count
        const uniqueMatches = new Set(matches.map(match => match.toLowerCase()));
        score += 0.16 * uniqueMatches.size;
    }
    //if score is greater than 1, return 1
    if (score > 1) {
        return 1;
    }
    return score;
}

