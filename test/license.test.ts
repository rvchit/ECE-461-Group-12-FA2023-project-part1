//write tests for license.ts using jest. License.ts is in the src folder
//test license.ts
import { license } from '../src/license';

const githubURLFail = 'https://github.com/barchart/marketdata-api-js';
const githubURLSucceed = 'https://github.com/cloudinary/cloudinary_npm';

//test to see if license.ts returns 0 for githubURLFail
test('license.ts returns 0 for githubURLFail', async () => {
	const score = await license(githubURLFail);
	expect(score).toBe(0);
});

//test to see if license.ts returns 1 for githubURLSucceed
test('license.ts returns 1 for githubURLSucceed', async () => {
	const score = await license(githubURLSucceed);
	expect(score).toBe(1);
});
