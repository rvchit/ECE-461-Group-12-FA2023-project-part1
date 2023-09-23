import { fetchGitHubData, fetchCorrectnessData } from '../src/correctness'; 
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('fetchCorrectnessData', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should calculate correctness data based on PRs and stars', async () => {
        const repoUrl = 'https://github.com/user/repo';

        const mockRepoDetails = { stargazers_count: 5000 };
        const mockOpenPRData = { total_count: 50 };
        const mockClosedPRData = { total_count: 150 };

        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockRepoDetails
        } as any)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenPRData
        } as any)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockClosedPRData
        } as any);

        const result = await fetchCorrectnessData(repoUrl);
        expect(result).toBe(0.875);
});

it('should calculate correctness data based on PRs and stars', async () => {
    const repoUrl = 'https://github.com/user/repo';

    const mockRepoDetails = { stargazers_count: 5000 };
    const mockOpenPRData = { total_count: 50 };
    const mockClosedPRData = { total_count: 150 };

    mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoDetails
    } as any)
    .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenPRData
    } as any)
    .mockResolvedValueOnce({
        ok: true,
        json: async () => mockClosedPRData
    } as any);

    const result = await fetchCorrectnessData(repoUrl);
    expect(result).toBe(0.875);
});

it('should calculate correctness data based on PRs and stars', async () => {
    const repoUrl = 'https://github.com/user/repo';

    const mockRepoDetails = { stargazers_count: 31 };
    const mockOpenPRData = { total_count: 40 };
    const mockClosedPRData = { total_count: 15 };

    mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoDetails
    } as any)
    .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenPRData
    } as any)
    .mockResolvedValueOnce({
        ok: true,
        json: async () => mockClosedPRData
    } as any);

    const result = await fetchCorrectnessData(repoUrl);
    expect(result).toBeLessThanOrEqual(0.2);
});

it('should handle a scenario with no PRs', async () => {
    const repoUrl = 'https://github.com/user/repo';

    mockedFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ stargazers_count: 1000 }) } as any)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ total_count: 0 }) } as any)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ total_count: 0 }) } as any);

    const result = await fetchCorrectnessData(repoUrl);
    expect(result).toBe(0.5); // Only considering the stars score
});

it('should throw an error if fetching repo details fails', async () => {
    mockedFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' } as any);
    await expect(fetchCorrectnessData('https://github.com/user/repo')).rejects.toThrow('Failed to fetch data');
});

it('should throw an error for an invalid GitHub URL', async () => {
    const invalidUrl = 'https://invalid-url.com/user/repo';
    await expect(fetchCorrectnessData(invalidUrl)).rejects.toThrow('Invalid GitHub repository URL');
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
            json: async () => mockData
        } as any);

        const result = await fetchGitHubData(repoUrl, endpoint);
        expect(result).toEqual(mockData);
    });

    it('should throw an error for an invalid GitHub URL', async () => {
        const invalidUrl = 'https://invalid-url.com/user/repo';
        const endpoint = 'repos/OWNER/REPO';
        
        await expect(fetchGitHubData(invalidUrl, endpoint)).rejects.toThrow('Invalid GitHub repository URL');
    });

    it('should throw an error if the API request fails', async () => {
        const repoUrl = 'https://github.com/user/repo';
        const endpoint = 'repos/OWNER/REPO';

        mockedFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' } as any);
        await expect(fetchGitHubData(repoUrl, endpoint)).rejects.toThrow('Failed to fetch data');
    });

    it('should handle network errors or timeouts', async () => {
        const repoUrl = 'https://github.com/user/repo';
        const endpoint = 'repos/OWNER/REPO';

        mockedFetch.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchGitHubData(repoUrl, endpoint)).rejects.toThrow('Network error');
    });
});
});