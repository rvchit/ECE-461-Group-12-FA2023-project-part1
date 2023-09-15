#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const commander_1 = require("commander");
const fs_1 = require("fs");
const busFactor_1 = require("./busFactor");
const license_1 = require("./license");
const responsive_1 = require("./responsive");
const rampUp_1 = require("./rampUp");
const correctness_1 = require("./correctness");
const program = new commander_1.Command();
async function getGithubUrl(npmUrl) {
    const packageName = npmUrl.split("package/")[1];
    const response = await (0, node_fetch_1.default)(npmUrl);
    const text = await response.text();
    const githubUrl = text.split("github.com")[1].split('"')[0];
    const githubUrlWithPackageName = githubUrl.split("/")[0] + "/" + githubUrl.split("/")[1] + "/" + packageName;
    return `https://github.com${githubUrlWithPackageName}`;
}
function formatter(metric) {
    const truncated = metric.toFixed(5);
    const trimmed = truncated.replace(/\.?0*$/, '');
    return trimmed;
}
program
    .version("0.0.1")
    .argument("<file>", "file with npm urls")
    .action(async (file) => {
    try {
        const fileContents = (0, fs_1.readFileSync)(file, "utf-8");
        const urls = fileContents.split("\n");
        for (let url of urls) {
            let newUrl = url;
            if (url.includes("npmjs.com")) {
                url = await getGithubUrl(url);
            }
            const busFactor = await (0, busFactor_1.getBusFactor)(url);
            const licenseScore = await (0, license_1.license)(url);
            const responsiveScore = await (0, responsive_1.responsive)(url);
            const rampUpScore = await (0, rampUp_1.rampUp)(url);
            const correctnessScore = await (0, correctness_1.fetchCorrectnessData)(url);
            const netScore = licenseScore * ((responsiveScore * 0.3) + (busFactor * 0.4) + (correctnessScore * 0.15) + (rampUpScore * 0.15));
            console.log(`{"URL":"${newUrl}", "NET_SCORE":${formatter(netScore)}, "RAMP_UP_SCORE":${formatter(rampUpScore)}, "CORRECTNESS_SCORE":${formatter(correctnessScore)}, "BUS_FACTOR_SCORE":${formatter(busFactor)}, "RESPONSIVE_MAINTAINER_SCORE":${formatter(responsiveScore)}, "LICENSE_SCORE":${formatter(licenseScore)}}`);
        }
    }
    catch (error) {
        console.error(error);
    }
});
program.parse(process.argv);
