"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsive = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ms_to_sec = 1000;
const sec_to_hour = 3600;
const hours_to_days = 24;
//Changes date ticket to an actual data object to calc the difference in terms of milliseconds between created date and closed date
function parseDate(dateString) {
    return new Date(dateString);
}
//Grabs the 50 most recent closed issues from GitHub API
async function fetchIssues(owner, repo) {
    const perPage = 50; // Number of pull requests per page (maximum allowed by GitHub)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&page=1&per_page=${perPage}`;
    const response = await (0, node_fetch_1.default)(apiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.statusText}`);
    }
    const closedIssues = await response.json();
    return closedIssues;
}
//Fetches issue data of a specified issue number
async function fetchIssueData(owner, repo, issueNumber) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    const response = await (0, node_fetch_1.default)(apiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.statusText}`);
    }
    const issueData = await response.json();
    return issueData;
}
//Finds the median of the time taken to close an issue, over 50 samples
function findMedian(numbers) {
    // Step 1: Sort the list
    const sortedNumbers = numbers.slice().sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedNumbers.length / 2);
    if (sortedNumbers.length % 2 === 0) {
        // Even number of elements, so take the average of the two middle elements
        const middle1 = sortedNumbers[middleIndex - 1];
        const middle2 = sortedNumbers[middleIndex];
        return (middle1 + middle2) / 2;
    }
    else {
        // Odd number of elements, so the middle element is the median
        return sortedNumbers[middleIndex];
    }
}
//
async function responsive(url) {
    const urlParts = url.split("/");
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const score_list = [];
    try {
        const issues = await fetchIssues(owner, repo);
        for (const issue of issues) {
            const issueData = await fetchIssueData(owner, repo, issue.number);
            const created = parseDate(issue.created_at);
            const closed = parseDate(issueData.closed_at);
            const diff = (closed.valueOf() - created.valueOf()) / (ms_to_sec * sec_to_hour * hours_to_days); // diff measured in days
            score_list.push(diff);
        }
        const median = findMedian(score_list);
        if (median < 1) {
            return 1;
        }
        else if (median > 7) {
            return 0;
        }
        else {
            // linear interpolation here.
            return 1 - (median - 1) / 6;
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}
exports.responsive = responsive;
