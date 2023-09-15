#!/usr/bin/env node

import fetch from "node-fetch";
import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { getBusFactor } from "./busFactor";
import { license } from "./license";
import { responsive } from "./responsive";
import { rampUp } from "./rampUp";
import { fetchCorrectnessData } from "./correctness";

const program = new Command();

async function getGithubUrl(npmUrl: string): Promise<string> {
    const packageName = npmUrl.split("package/")[1];
    const response = await fetch(npmUrl);
    const text = await response.text();
    const githubUrl = text.split("github.com")[1].split('"')[0];
    const githubUrlWithPackageName = githubUrl.split("/")[0] + "/" + githubUrl.split("/")[1] + "/" + packageName;
    return `https://github.com${githubUrlWithPackageName}`
}

program
    .version("0.0.1")
    .argument("<file>", "file with npm urls")
    .action(async (file) => {
        try {
            const fileContents = readFileSync(file, "utf-8");
            const urls = fileContents.split("\n");
            for (let url of urls) {
                let newUrl = url;
                if (url.includes("npmjs.com")) {
                    url = await getGithubUrl(url);
                }
                const busFactor = await getBusFactor(url);
                const licenseScore = await license(url);
                const responsiveScore = await responsive(url);
                const rampUpScore = await rampUp(url);
                const correctnessScore = await fetchCorrectnessData(url);
                const netScore = licenseScore * ((responsiveScore * 0.3) + (busFactor * 0.4) + (correctnessScore * 0.15) + (rampUpScore * 0.15));
                console.log(`{"URL":"${newUrl}", "NET_SCORE":${netScore.toFixed(1)}, "RAMP_UP_SCORE":${rampUpScore.toFixed(1)}, "CORRECTNESS_SCORE":${correctnessScore.toFixed(1)}, "BUS_FACTOR_SCORE":${busFactor.toFixed(1)}, "RESPONSIVE_MAINTAINER_SCORE":${responsiveScore.toFixed(1)}, "LICENSE_SCORE":${licenseScore.toFixed(1)}}`);
            }
        } catch (error) {
            console.error(error);
        }
    })

program.parse(process.argv);