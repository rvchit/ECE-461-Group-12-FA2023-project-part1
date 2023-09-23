"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rampUp = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const tmp_promise_1 = require("tmp-promise");
dotenv_1.default.config();
const logger = (0, logger_1.default)('Ramp Up');
async function rampUp(url) {
    let score = 0;
    try {
        // Create a temporary directory to clone the repository
        const { path: localPath, cleanup } = await (0, tmp_promise_1.dir)();
        // Clone the repository using isomorphic-git
        await isomorphic_git_1.default.clone({
            fs: fs_1.default,
            http: node_1.default,
            dir: localPath,
            url,
            singleBranch: true,
            depth: 1,
        });
        // Try reading the README.md file from the local clone
        let readme;
        const readmeVariations = ['README.md', 'readme.md', 'Readme.md'];
        for (const readmeFile of readmeVariations) {
            try {
                readme = fs_1.default.readFileSync(path_1.default.join(localPath, readmeFile), 'utf-8');
                break;
            }
            catch {
                // If reading fails, continue to the next iteration
            }
        }
        if (!readme) {
            logger.info("Couldn't find a readable README file locally; Score of 0");
            await cleanup();
            return 0;
        }
        // Calculate ramp up score based on the README content
        const readmeLines = readme.split('\n').length;
        score += 0.2 * Math.min(readmeLines / 200, 1);
        // Keywords score calculation using regex pattern
        const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
        const matches = readme.match(keywordPattern);
        const uniqueMatches = matches ? new Set(matches.map((match) => match.toLowerCase())) : new Set();
        score += Math.min(0.16 * uniqueMatches.size, 0.8);
        // Cleanup the cloned repository
        await cleanup();
        return score;
    }
    catch (error) {
        logger.error('Error in rampUp function', error);
        return score;
    }
}
exports.rampUp = rampUp;
