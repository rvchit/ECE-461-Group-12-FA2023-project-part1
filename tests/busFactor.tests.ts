import { getBusFactor } from '../src/busFactor';

test('calculates the bus factor correctly', async () => {
    const repoUrl = 'https://github.com/netdata/netdata';
    const result = await getBusFactor(repoUrl);
    
    expect(result.busFactor).toBeGreaterThanOrEqual(0);
    expect(result.busFactor).toBeLessThanOrEqual(1);
});