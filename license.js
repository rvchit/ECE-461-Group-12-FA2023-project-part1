"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.license = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)('Correctness');
dotenv_1.default.config();
async function license(url) {
    const urlParts = url.split('/');
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const apiURL = `https://api.github.com/repos/${owner}/${repo}/readme`;
    logger.info(`Constructed API URL: ${apiURL}`);
    const response = await (0, node_fetch_1.default)(apiURL, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (!response.ok) {
        logger.error(`Failed to fetch readme from ${apiURL}. Status: ${response.statusText}`);
        throw new Error(`Failed to fetch readme from ${apiURL}. Status: ${response.statusText}`);
    }
    const { content } = await response.json();
    const readme = Buffer.from(content, 'base64').toString('utf-8');
    const licenseRegex = /licen[sc]e/gi;
    const hasLicense = licenseRegex.test(readme);
    return hasLicense ? 1 : 0;
}
exports.license = license;
