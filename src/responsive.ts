"use strict";
import fetch from 'node-fetch';
const dotenv = require('dotenv');
const ms_to_sec: number = 1000;
const sec_to_hour: number = 3600;
// Load environment variables from .env file
dotenv.config();
function parseDate(dateString){
    return new Date(dateString);
}
async function fetchClosedPullRequests(owner: string, repo: string, accessToken: string, maxCount: number = 300, page: number = 1): Promise<any[]> {
    const perPage = 100; // Number of pull requests per page (maximum allowed by GitHub)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&page=${page}&per_page=${perPage}`;
  
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GitHub-Pull-Request-Fetcher',
      },
    });
  
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }
  
    const closedPullRequests = await response.json();
    const totalCount = closedPullRequests.length;
    //this loop is to fetch 300 entires because each page only has 100 entries
    if ((closedPullRequests.length === perPage) && (totalCount < maxCount)) {
      const nextPageClosedPullRequests = await fetchClosedPullRequests(owner, repo, accessToken, maxCount - totalCount, page + 1);
      return [...closedPullRequests, ...nextPageClosedPullRequests];
    }
    return closedPullRequests;
  }
  
  async function fetchClosedPullRequestData(owner: string, repo: string, accessToken: string, pullRequestNumber: number): Promise<any> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequestNumber}`;
  
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GitHub-Pull-Request-Fetcher',
      },
    });
  
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }
  
    const pullRequestData = await response.json();
  
    return pullRequestData;
  }
  function findMedian(numbers) {
    // Step 1: Sort the list
    const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  
    const middleIndex = Math.floor(sortedNumbers.length / 2);
  
    if (sortedNumbers.length % 2 === 0) {
      // Even number of elements, so take the average of the two middle elements
      const middle1 = sortedNumbers[middleIndex - 1];
      const middle2 = sortedNumbers[middleIndex];
      return (middle1 + middle2) / 2;
    } else {
      // Odd number of elements, so the middle element is the median
      return sortedNumbers[middleIndex];
    }
  }
  const owner = 'browserify';
  const repo = 'browserify';
  const accessToken = process.env.GITHUB_TOKEN || '';
  const score_list: number[] = [];
  fetchClosedPullRequests(owner, repo, accessToken)
    .then(async (closedPullRequests) => {
      console.log('Closed Pull Requests:');
      for (const pr of closedPullRequests) {
        const pullRequestData = await fetchClosedPullRequestData(owner, repo, accessToken, pr.number);
        const created = parseDate(pr.created_at);
        const closed = parseDate(pullRequestData.closed_at);
        const diff = (closed.valueOf()-created.valueOf())/(ms_to_sec*3600*24); //get rid of magic numbers MEASURES IN Days
        score_list.push(diff);
      }
      console.log(`Scores: ${score_list}`);
      const median = findMedian(score_list);
      console.log("Median:", median);
      console.log("Length:", score_list.length)
    })
    .catch((error) => {
      console.error('Error fetching closed pull requests:', error);
    });