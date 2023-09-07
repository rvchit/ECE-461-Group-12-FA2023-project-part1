"use strict";
//function uses github token in .env file to use githubAPI and uses a regEx to find the license in the readme file in typescript
//input = github url, output = score. Score = 0 if no license, Score = 1 if license is found
//uses fetch 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function license(url) {
    const urlParts = url.split("/");
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const apiURL = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await (0, node_fetch_1.default)(apiURL, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch readme from ${apiURL}`);
    }
    const { content } = await response.json();
    const readme = Buffer.from(content, "base64").toString("utf-8");
    const licenseRegex = /licen[sc]e/gi;
    const hasLicense = licenseRegex.test(readme);
    return hasLicense ? 1 : 0;
}
async function printLicenseRepo(url) {
    const score = await license(url);
    console.log(`License score for ${url}: ${score}`);
}
printLicenseRepo("https://github.com/Rohit-kamath/ECE-461-Group-12-FA2023-project-part1");
