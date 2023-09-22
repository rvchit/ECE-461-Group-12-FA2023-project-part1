#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
var commander_1 = require("commander");
var fs_1 = require("fs");
var busFactor_1 = require("./busFactor");
var license_1 = require("./license");
var responsive_1 = require("./responsive");
var rampUp_1 = require("./rampUp");
var correctness_1 = require("./correctness");
var logger_1 = require("./logger");
var child_process_1 = require("child_process");
var logger = (0, logger_1.default)('run cli');
var program = new commander_1.Command();
program
    .command('install')
    .description('Install dependencies')
    .action(function () {
    var _a;
    var child = (0, child_process_1.exec)('npm install');
    (_a = child.stderr) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
        console.error("stderr: ".concat(data));
    });
    child.on('close', function (code) {
        if (code === 0) {
            try {
                var packageJson = JSON.parse((0, fs_1.readFileSync)('package.json', 'utf8'));
                var dependencyCount = Object.keys(packageJson.dependencies || {}).length;
                console.log("".concat(dependencyCount, " dependencies installed..."));
            }
            catch (err) {
                console.error('Error reading package.json:', err);
            }
        }
        else {
            logger.error("npm install failed with code ".concat(code, "."));
            console.error("npm install failed with code ".concat(code, "."));
        }
    });
});
function getGithubUrl(npmUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var packageName, response, text, githubUrl, githubUrlWithPackageName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    packageName = npmUrl.split('package/')[1];
                    return [4 /*yield*/, (0, node_fetch_1.default)(npmUrl)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    text = _a.sent();
                    githubUrl = text.split('github.com')[1].split('"')[0];
                    githubUrlWithPackageName = githubUrl.split('/')[0] + '/' + githubUrl.split('/')[1] + '/' + packageName;
                    return [2 /*return*/, "https://github.com".concat(githubUrlWithPackageName)];
            }
        });
    });
}
function formatter(metric) {
    var truncated = metric.toFixed(5);
    var trimmed = truncated.replace(/\.?0*$/, '');
    return trimmed;
}
program
    .version('0.0.1')
    .argument('<file>', 'file with npm urls')
    .action(function (file) { return __awaiter(void 0, void 0, void 0, function () {
    var fileContents, urls, _i, urls_1, url, newUrl, busFactor, licenseScore, responsiveScore, rampUpScore, correctnessScore, netScore, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 11, , 12]);
                fileContents = (0, fs_1.readFileSync)(file, 'utf-8');
                urls = fileContents.split('\n');
                logger.info("grabbing net score for ".concat(urls));
                _i = 0, urls_1 = urls;
                _a.label = 1;
            case 1:
                if (!(_i < urls_1.length)) return [3 /*break*/, 10];
                url = urls_1[_i];
                newUrl = url;
                if (!url.includes('npmjs.com')) return [3 /*break*/, 3];
                return [4 /*yield*/, getGithubUrl(url)];
            case 2:
                url = _a.sent();
                _a.label = 3;
            case 3: return [4 /*yield*/, (0, busFactor_1.getBusFactor)(url)];
            case 4:
                busFactor = _a.sent();
                return [4 /*yield*/, (0, license_1.license)(url)];
            case 5:
                licenseScore = _a.sent();
                return [4 /*yield*/, (0, responsive_1.responsive)(url)];
            case 6:
                responsiveScore = _a.sent();
                return [4 /*yield*/, (0, rampUp_1.rampUp)(url)];
            case 7:
                rampUpScore = _a.sent();
                return [4 /*yield*/, (0, correctness_1.fetchCorrectnessData)(url)];
            case 8:
                correctnessScore = _a.sent();
                netScore = licenseScore *
                    (responsiveScore * 0.3 + busFactor * 0.4 + correctnessScore * 0.15 + rampUpScore * 0.15);
                console.log("{\"URL\":\"".concat(newUrl, "\", \"NET_SCORE\":").concat(formatter(netScore), ", \"RAMP_UP_SCORE\":").concat(formatter(rampUpScore), ", \"CORRECTNESS_SCORE\":").concat(formatter(correctnessScore), ", \"BUS_FACTOR_SCORE\":").concat(formatter(busFactor), ", \"RESPONSIVE_MAINTAINER_SCORE\":").concat(formatter(responsiveScore), ", \"LICENSE_SCORE\":").concat(formatter(licenseScore), "}"));
                _a.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 1];
            case 10: return [3 /*break*/, 12];
            case 11:
                error_1 = _a.sent();
                logger.error("Failed to get net score metrics. Error: ".concat(error_1));
                console.error("Failed to get net score metrics. Error: ".concat(error_1));
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
program
    .command('test')
    .description('Run the test suite')
    .action(function () {
    console.log('Running tests...');
    (0, child_process_1.exec)('npm test', function (error, stdout, stderr) {
        if (error) {
            console.error("Test suite encountered an error: ".concat(error.message));
            process.exit(1);
        }
        // regex from stdout
        var totalTestsMatch = stdout.match(/Tests:\s+(\d+)\s+total/);
        var passedTestsMatch = stdout.match(/Tests:\s+(\d+)\s+passed/);
        var coverageMatch = stdout.match(/All files\s+\|[^|]+|[^|]+|[^|]+|[^|]+|([^|]+)|/);
        if (totalTestsMatch && passedTestsMatch && coverageMatch) {
            var total = totalTestsMatch[1];
            var passed = passedTestsMatch[1];
            var coverage = coverageMatch[1].trim();
            console.log("Total: ".concat(total));
            console.log("Passed: ".concat(passed));
            console.log("Coverage: ".concat(coverage));
            console.log("".concat(passed, "/").concat(total, " test cases passed. ").concat(coverage, " line coverage achieved."));
        }
        else {
            console.log('Failed to extract test report data.');
        }
        if (stderr) {
            console.error("stderr: ".concat(stderr));
        }
    });
});
program.parse(process.argv);
