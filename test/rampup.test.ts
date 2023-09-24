import { rampUp } from '../src/rampUp'; // Adjust the path to point to your main script file

const gitURL0 = 'https://github.com/rvchit/test0';
const gitURL1 = 'https://github.com/tj/commander.js';

test('it should return a score of 0 for a repository with no README', async () => {
	const score = await rampUp(gitURL0);
	expect(score).toBe(0);
}, 15000);

test('it should return a score of 1 for a repository with perfect README', async () => {
	const score = await rampUp(gitURL1);
	expect(score).toBe(1);
}, 15000);
