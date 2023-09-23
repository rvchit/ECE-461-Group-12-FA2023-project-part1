import { getBusFactor } from "../src/busFactor";

describe("Bus Factor Integration Tests", () => {
  test("Bus factor for a known repository", async () => {
    const repoUrl = "https://github.com/facebook/react";
    const busFactor = await getBusFactor(repoUrl);

    expect(busFactor).toBeGreaterThanOrEqual(0);
    expect(busFactor).toBeLessThanOrEqual(1);
  });
});
