import { fetchGitHubData, fetchCorrectnessData } from '../src/correctness';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

describe('fetchCorrectnessData', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should calculate correctness data based on PRs and stars', async () => {
		const repoUrl = 'https://github.com/user/repo';

		const mockRepoDetails = { stargazers_count: 5000 };
		const mockOpenPRData = { total_count: 50 };
		const mockClosedPRData = { total_count: 150 };

		mockedFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRepoDetails,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockOpenPRData,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockClosedPRData,
			} as any);

		const result = await fetchCorrectnessData(repoUrl);
		expect(result).toBe(0.875);
	});

	it('should calculate correctness data based on PRs and stars', async () => {
		const repoUrl = 'https://github.com/user/repo';

		const mockRepoDetails = { stargazers_count: 5000 };
		const mockOpenPRData = { total_count: 50 };
		const mockClosedPRData = { total_count: 150 };

		mockedFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRepoDetails,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockOpenPRData,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockClosedPRData,
			} as any);

		const result = await fetchCorrectnessData(repoUrl);
		expect(result).toBe(0.875);
	});

	it('should calculate correctness data based on PRs and stars', async () => {
		const repoUrl = 'https://github.com/user/repo';

		const mockRepoDetails = { stargazers_count: 31 };
		const mockOpenPRData = { total_count: 40 };
		const mockClosedPRData = { total_count: 15 };

		mockedFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRepoDetails,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockOpenPRData,
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockClosedPRData,
			} as any);

		const result = await fetchCorrectnessData(repoUrl);
		expect(result).toBeLessThanOrEqual(0.2);
	});

	it('should handle a scenario with no PRs', async () => {
		const repoUrl = 'https://github.com/user/repo';

		mockedFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ stargazers_count: 1000 }),
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ total_count: 0 }),
			} as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ total_count: 0 }),
			} as any);

		const result = await fetchCorrectnessData(repoUrl);
		expect(result).toBe(0.5); // Only considering the stars score
	});

	it('should console.log("Failed to fetch data") and then process.exit(1)', async () => {
		mockedFetch.mockResolvedValueOnce({
			ok: false,
			statusText: 'Not Found',
		} as any);

		await fetchCorrectnessData('https://github.com/user/repo');
		expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch data from user/repo. Status: Not Found');
		expect(processExitSpy).toHaveBeenCalledWith(1);
	});

	it('should console.log("Invalid GitHub repository URL") and then process.exit(1)', async () => {
		await fetchCorrectnessData('invalidURL');
		expect(consoleSpy).toHaveBeenCalledWith('Invalid GitHub repository URL: invalidURL');
		expect(processExitSpy).toHaveBeenCalledWith(1);
	});

	describe('fetchGitHubData', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should fetch data successfully from GitHub API', async () => {
			const repoUrl = 'https://github.com/user/repo';
			const endpoint = 'repos/OWNER/REPO';
			const mockData = { someKey: 'someValue' };

			mockedFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as any);

			const result = await fetchGitHubData(repoUrl, endpoint);
			expect(result).toEqual(mockData);
		});

	});
});
