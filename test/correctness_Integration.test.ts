import { fetchCorrectnessData } from "../src/correctness";

test("calculates the correctness score correctly", async () => {
  const repoUrl = "https://github.com/wolever/parameterized";
  const result = await fetchCorrectnessData(repoUrl);

  expect(result).toBeGreaterThanOrEqual(0);
  expect(result).toBeLessThanOrEqual(1);
});
