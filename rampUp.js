"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rampUp = void 0;
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const node_fetch_1 = __importDefault(require("node-fetch"));
dotenv_1.default.config();
const logger = (0, logger_1.default)('Ramp Up');
async function rampUp(url) {
    const urlParts = url.split('/');
    const repo = urlParts.pop();
    const owner = urlParts.pop();
    const tempDir = path_1.default.join(os_1.default.tmpdir(), `repo-${Date.now()}`);
    try {
        await fs_1.default.promises.mkdir(tempDir);
        await isomorphic_git_1.default.clone({
            fs: fs_1.default,
            http: node_fetch_1.default,
            dir: tempDir,
            url: `https://github.com/${owner}/${repo}.git`,
            singleBranch: true,
            depth: 1,
        });
        const readmePath = path_1.default.join(tempDir, 'README.md');
        if (!fs_1.default.existsSync(readmePath)) {
            logger.info("Couldn't get readme for rampUp. Score of 0");
            return 0;
        }
        const readme = await fs_1.default.promises.readFile(readmePath, 'utf-8');
        const readmeLines = readme.split('\n').length;
        // Readme length score calculation
        let score = 0;
        if (readmeLines > 0) {
            score += 0.2 * Math.min(readmeLines / 200, 1);
        }
        // Keywords score calculation using regex pattern
        const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
        const matches = readme.match(keywordPattern);
        if (matches) {
            // use a Set to eliminate duplicate matches, then get the unique count
            const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
            score += 0.16 * uniqueMatches.size;
        }
        // if score is greater than 1, return 1
        return Math.min(score, 1);
    }
    catch (error) {
        logger.error('Error during rampUp', error);
        throw error;
    }
    finally {
        await fs_1.default.promises.rm(tempDir, { recursive: true, force: true });
    }
}
exports.rampUp = rampUp;
