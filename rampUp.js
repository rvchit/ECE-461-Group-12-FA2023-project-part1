"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rampUp = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)('Correctness');
dotenv_1.default.config();
async function rampUp(url) {
    const urlParts = url.split('/');
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const apiURL = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await (0, node_fetch_1.default)(apiURL, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (!response.ok) {
        logger.info("Couldn't get readme for rampuUp. Score of 0");
        return 0;
    }
    const { content } = await response.json();
    const readme = Buffer.from(content, 'base64').toString('utf-8');
    const readmeLines = readme.split('\n').length;
    // Readme length score calculation
    let score = 0;
    if (readmeLines > 0) {
        score += 0.2 * Math.min(readmeLines / 200, 1);
    }
    // Keywords score calculation using cregex pattern
    const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
    const matches = readme.match(keywordPattern);
    if (matches) {
        // use a Set to eliminate duplicate matches, then get the unique count
        const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
        score += 0.16 * uniqueMatches.size;
    }
    //if score is greater than 1, return 1
    if (score > 1) {
        return 1;
    }
    return score;
}
exports.rampUp = rampUp;
