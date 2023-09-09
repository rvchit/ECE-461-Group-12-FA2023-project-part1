import { license } from "../src/responsive";

const githubURLFail = "https://github.com/Rohit-kamath/ECE-461-Group-12-FA2023-project-part1"
const githubURLSucceed = "https://github.com/cloudinary/cloudinary_npm"

//test to see if license.ts returns 0 for githubURLFail
test("license.ts returns 0 for githubURLFail", async () => {
    const score = await license(githubURLFail);
    expect(score).toBe(0);
});

//test to see if license.ts returns 1 for githubURLSucceed
test("license.ts returns 1 for githubURLSucceed", async () => {
    const score = await license(githubURLSucceed);
    expect(score).toBe(1);
});