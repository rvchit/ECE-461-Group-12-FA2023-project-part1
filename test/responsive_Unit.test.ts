import { responsive, fetchIssues } from '../src/responsive';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Responsive functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchIssues', () => {
        it('should fetch closed issues from a valid repo URL', async () => {
            const mockData = [
                { created_at: '2022-01-01T00:00:00Z', closed_at: '2022-01-02T00:00:00Z' },
                { created_at: '2022-02-01T00:00:00Z', closed_at: '2022-02-03T00:00:00Z' }
            ];

            mockedFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as any);

            const result = await fetchIssues('user', 'repo');
            expect(result).toEqual(mockData);
        });
    });

    describe('responsive', () => {
        it('should return score of 1 for immediate issue resolution', async () => {
            const mockData = [
                { created_at: '2022-01-01T00:00:00Z', closed_at: '2022-01-01T00:00:01Z' }
            ];
            
            mockedFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as any);

            const score = await responsive('https://github.com/user/repo');
            expect(score).toBe(1);
        });

        it('should return score of 0 for delayed issue resolution of over 7 days', async () => {
            const mockData = [
                { created_at: '2022-01-01T00:00:00Z', closed_at: '2022-01-10T00:00:00Z' }
            ];

            mockedFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as any);

            const score = await responsive('https://github.com/user/repo');
            expect(score).toBe(0);
        });

        it('should return a score between 0 and 1 for moderate issue resolution times', async () => {
            const mockData = [
                { created_at: '2022-01-01T00:00:00Z', closed_at: '2022-01-02T00:00:00Z' },
                { created_at: '2022-02-01T00:00:00Z', closed_at: '2022-02-03T00:00:00Z' },
                { created_at: '2022-02-10T00:00:00Z', closed_at: '2022-02-12T00:00:00Z' }
            ];

            mockedFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as any);

            const score = await responsive('https://github.com/user/repo');
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThan(1);
        });
    });
});