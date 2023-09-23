import { fetchContributors, getBusFactor } from '../src/busFactor';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Bus Factor functions', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('fetchContributors', () => {
		it('should fetch contributors from a valid repo URL', async () => {
			const mockData = [
				{ login: 'user1', contributions: 10 },
				{ login: 'user2', contributions: 20 },
			];

			mockedFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as any);

			const result = await fetchContributors('https://github.com/user/repo');
			expect(result).toEqual(mockData);
		});

		it('should throw an error for invalid repo URL', async () => {
			await expect(fetchContributors('invalidURL')).rejects.toThrow('Invalid GitHub repository URL');
		});

		it('should throw an error if the fetch fails', async () => {
			mockedFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Bad Request',
			} as any);

			await expect(fetchContributors('https://github.com/user/repo')).rejects.toThrow(
				'Failed to fetch contributors',
			);
		});
	});

	describe('getBusFactor', () => {
		it('should calculate bus factor for a few contributors with majority of contributions', async () => {
			const mockData = [
				{ login: 'user1', contributions: 50 },
				{ login: 'user2', contributions: 30 },
				{ login: 'user3', contributions: 20 },
			];
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as any);
			const result = await getBusFactor('https://github.com/user/repo');
			expect(result).toBe(0.2);
		});

		it('should calculate bus factor for a solid well-rounded repo', async () => {
			const mockData = [
				{ login: 'user1', contributions: 80 },
				{ login: 'user2', contributions: 76 },
				{ login: 'user3', contributions: 100 },
				{ login: 'user4', contributions: 90 },
				{ login: 'user5', contributions: 98 },
				{ login: 'user6', contributions: 76 },
				{ login: 'user7', contributions: 65 },
				{ login: 'user8', contributions: 21 },
				{ login: 'user9', contributions: 12 },
				{ login: 'user10', contributions: 24 },
				{ login: 'user11', contributions: 15 },
				{ login: 'user12', contributions: 17 },
				{ login: 'user13', contributions: 17 },
				{ login: 'user14', contributions: 45 },
				{ login: 'user15', contributions: 37 },
				{ login: 'user16', contributions: 20 },
				{ login: 'user17', contributions: 43 },
				{ login: 'user18', contributions: 27 },
				{ login: 'user19', contributions: 32 },
				{ login: 'user20', contributions: 42 },
			];
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as any);
			const result = await getBusFactor('https://github.com/user/repo');
			expect(result).toBeGreaterThan(0.5);
		});

		it('should calculate bus factor for a single contributor', async () => {
			const mockData = [{ login: 'user1', contributions: 100 }];
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as any);
			const result = await getBusFactor('https://github.com/user/repo');
			expect(result).toBe(0);
		});

		it('should throw error if fetch contributors fails', async () => {
			mockedFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Bad Request',
			} as any);
			await expect(getBusFactor('https://github.com/user/repo')).rejects.toThrow('Failed to fetch contributors');
		});
	});
});
