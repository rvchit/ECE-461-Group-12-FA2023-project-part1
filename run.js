#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)('run cli');
const program = new commander_1.Command();
let fetch;
async function loadFetch() {
    const module = await Promise.resolve().then(() => __importStar(require('node-fetch')));
    fetch = module.default || module;
}
async function getGithubUrl(npmUrl) {
    if (!fetch) {
        await loadFetch();
    }
    const packageName = npmUrl.split('package/')[1];
    const response = await fetch(npmUrl);
    const text = await response.text();
    const githubUrl = text.split('github.com')[1].split('"')[0];
    const githubUrlWithPackageName = githubUrl.split('/')[0] + '/' + githubUrl.split('/')[1] + '/' + packageName;
    return `https://github.com${githubUrlWithPackageName}`;
}
program
    .command('install')
    .description('Install dependencies')
    .action(() => {
    const child = (0, child_process_1.exec)('npm install');
    child.stderr?.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    child.on('close', (code) => {
        if (code === 0) {
            try {
                const packageJson = JSON.parse((0, fs_1.readFileSync)('package.json', 'utf8'));
                const dependencyCount = Object.keys(packageJson.dependencies || {}).length;
                console.log(`${dependencyCount} dependencies installed...`);
            }
            catch (err) {
                console.error('Error reading package.json:', err);
            }
        }
        else {
            logger.error(`npm install failed with code ${code}.`);
            console.error(`npm install failed with code ${code}.`);
        }
    });
})
    .command('test')
    .description('Run the test suite')
    .action(() => {
    (0, child_process_1.exec)('npm test', (error, stdout, stderr) => {
        if (error) {
            throw new Error(`Failed to run tests. Error: ${error}`);
        }
        const testMatch = stderr.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
        const coverageMatch = stdout.match(/All files\s+\|[^|]+\|[^|]+\|[^|]+\|([^|]+)\|/);
        if (coverageMatch && testMatch) {
            const passed = testMatch[1];
            const total = testMatch[2];
            const coverage = Math.floor(parseFloat(coverageMatch[1].trim()));
            console.log(`${passed}/${total} test cases passed. ${coverage}% line coverage achieved.`);
        }
        else {
            throw new Error('Failed to extract test report data.');
        }
    });
});
function formatter(metric) {
    const truncated = metric.toFixed(5);
    const trimmed = truncated.replace(/\.?0*$/, '');
    return trimmed;
}
program
    .version('0.0.1')
    .argument('<file>', 'file with npm urls')
    .action(async (file) => {
    const { getBusFactor } = await Promise.resolve().then(() => __importStar(require('./busFactor')));
    const { license } = await Promise.resolve().then(() => __importStar(require('./license')));
    const { responsive } = await Promise.resolve().then(() => __importStar(require('./responsive')));
    const { rampUp } = await Promise.resolve().then(() => __importStar(require('./rampUp')));
    const { fetchCorrectnessData } = await Promise.resolve().then(() => __importStar(require('./correctness')));
    const fileContents = (0, fs_1.readFileSync)(file, 'utf-8');
    const urls = fileContents.split('\n').filter((url) => url !== '');
    logger.info(`grabbing net score for ${urls}`);
    for (let url of urls) {
        const newUrl = url;
        if (url.includes('npmjs.com')) {
            url = await getGithubUrl(url);
        }
        const busFactor = await getBusFactor(url);
        const licenseScore = await license(url);
        const responsiveScore = await responsive(url);
        const rampUpScore = await rampUp(url);
        const correctnessScore = await fetchCorrectnessData(url);
        const netScore = licenseScore * (responsiveScore * 0.3 + busFactor * 0.4 + correctnessScore * 0.15 + rampUpScore * 0.15);
        console.log(`{"URL":"${newUrl}", "NET_SCORE":${formatter(netScore)}, "RAMP_UP_SCORE":${formatter(rampUpScore)}, "CORRECTNESS_SCORE":${formatter(correctnessScore)}, "BUS_FACTOR_SCORE":${formatter(busFactor)}, "RESPONSIVE_MAINTAINER_SCORE":${formatter(responsiveScore)}, "LICENSE_SCORE":${formatter(licenseScore)}}`);
    }
});
program.parse(process.argv);
