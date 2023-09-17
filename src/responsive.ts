import fetch from 'node-fetch';
import dotenv from 'dotenv';
import createModuleLogger from './logger';

const logger = createModuleLogger('responsive');
dotenv.config();
const ms_to_sec: number = 1000;
const sec_to_hour: number = 3600;
const hours_to_days: number = 24;

//Changes date ticket to an actual data object to calc the difference in terms of milliseconds between created date and closed date
function parseDate(dateString: any) {
	return new Date(dateString);
}

async function fetchIssues(owner: string, repo: string): Promise<any[]> {
	const perPage = 100;
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&page=1&per_page=${perPage}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	});

	if (!response.ok) {
		logger.error(`Failed to fetch data from ${repo}. Status: ${response.statusText}`)
		throw new Error(`Failed to fetch data from ${repo}. Status: ${response.statusText}`);
	}

	const closedIssues = await response.json();
	return closedIssues;
}
//Finds the median of the time taken to close an issue
function findMedian(numbers: any) {
	// Step 1: Sort the list
	const sortedNumbers = numbers.slice().sort((a: any, b: any) => a - b);

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
//
async function responsive(url: string): Promise<number> {
	const urlParts = url.split('/');
	const repo: string = urlParts.pop()!;
	const owner: string = urlParts.pop()!;
	const score_list: number[] = [];

	try {
		const issues = await fetchIssues(owner, repo);

		for (const issue of issues) {
			const created = parseDate(issue.created_at);
			const closed = parseDate(issue.closed_at);
			const diff = (closed.valueOf() - created.valueOf()) / (ms_to_sec * sec_to_hour * hours_to_days); // diff measured in days
			score_list.push(diff);
		}
		const median = findMedian(score_list);
		if (median < 1) {
			return 1;
		} else if (median > 7) {
			return 0;
		} else {
			// linear interpolation here.
			return 1 - (median - 1) / 6;
		}
	} catch (error) {
		logger.error(`Failed to calculate score of ${repo}. Error: ${error}`)
		console.error(`Failed to calculate score of ${repo}. Error: ${error}`);
		throw error;
	}
}
export { responsive };
