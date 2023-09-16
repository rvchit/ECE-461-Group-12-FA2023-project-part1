import { getBusFactor } from '../src/busFactor';

test('calculates the bus factor correctly', async () => {
	//const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

	const repoUrl = 'https://github.com/netdata/netdata';
	const result = await getBusFactor(repoUrl);

	expect(result).toBeGreaterThanOrEqual(0);
	expect(result).toBeLessThanOrEqual(1);
});
