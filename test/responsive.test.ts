import { responsive } from "../src/responsive";
import { test } from "@jest/globals";

const githubURLFail =
  "https://github.com/Rohit-kamath/ECE-461-Group-12-FA2023-project-part1";
const githubURLSucceed = "https://github.com/cloudinary/cloudinary_npm";

//test to see if license.ts returns 0 for githubURLFail
test("responsive.ts returns 0 for githubURLFail", async () => {
  const score = await responsive(githubURLFail);
  expect(score).toBeLessThan(2);
}, 20000);

//test to see if license.ts returns 1 for githubURLSucceed
test("responsive.ts returns 1 for githubURLSucceed", async () => {
  const score = await responsive(githubURLSucceed);
  expect(score).toBeLessThan(1);
}, 20000);
