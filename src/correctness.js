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
exports.fetchCorrectnessData = void 0;
var node_fetch_1 = require("node-fetch");
var dotenv_1 = require("dotenv");
var logger_1 = require("./logger");
var logger = (0, logger_1.default)('Correctness');
dotenv_1.default.config();
function fetchGitHubData(fullRepoUrl, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
        var repoUrlMatch, repoUrl, apiUrl, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Fetching contributors for repo: ".concat(fullRepoUrl));
                    repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
                    if (!repoUrlMatch) {
                        logger.error("Invalid GitHub repository URL:', ".concat(fullRepoUrl));
                        throw new Error("Invalid GitHub repository URL: ".concat(fullRepoUrl));
                    }
                    repoUrl = repoUrlMatch[1];
                    apiUrl = "https://api.github.com/".concat(endpoint.replace('OWNER/REPO', repoUrl));
                    logger.info("Constructed API URL: ".concat(apiUrl));
                    return [4 /*yield*/, (0, node_fetch_1.default)(apiUrl, {
                            headers: {
                                Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN),
                                Accept: 'application/vnd.github.v3+json',
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        logger.error("Failed to fetch data from ".concat(repoUrl, ". Status: ").concat(response.statusText));
                        throw new Error("Failed to fetch data from ".concat(repoUrl, ". Status: ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function fetchCorrectnessData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var repoUrlMatch, repoPath, repoDetails, openPRData, closedPRData, prScore, starsScore, finalScore, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    repoUrlMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
                    if (!repoUrlMatch) {
                        logger.error("Invalid GitHub repository URL: ".concat(repoUrl));
                        throw new Error("Invalid GitHub repository URL: ".concat(repoUrl));
                    }
                    repoPath = repoUrlMatch[1];
                    return [4 /*yield*/, fetchGitHubData(repoUrl, "repos/".concat(repoPath))];
                case 1:
                    repoDetails = _a.sent();
                    return [4 /*yield*/, fetchGitHubData(repoUrl, "search/issues?q=repo:".concat(repoPath, "+type:pr+state:open"))];
                case 2:
                    openPRData = _a.sent();
                    return [4 /*yield*/, fetchGitHubData(repoUrl, "search/issues?q=repo:".concat(repoPath, "+type:pr+state:closed"))];
                case 3:
                    closedPRData = _a.sent();
                    prScore = 0;
                    if (closedPRData.total_count + openPRData.total_count > 0) {
                        prScore = closedPRData.total_count / (closedPRData.total_count + openPRData.total_count);
                    }
                    logger.info("Calculated PR score: ".concat(prScore));
                    starsScore = Math.min(repoDetails.stargazers_count / 1000, 1);
                    logger.info("Calculated stars score: ".concat(starsScore));
                    finalScore = (starsScore + prScore) / 2;
                    logger.info("Calculated final score: ".concat(finalScore));
                    return [2 /*return*/, finalScore];
                case 4:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        logger.error("Failed to fetch correctness data: ".concat(error_1.message));
                        throw new Error("Failed to fetch correctness data: ".concat(error_1.message));
                    }
                    else {
                        logger.error('An unknown error occurred while fetching correctness data');
                        throw new Error('An unknown error occurred while fetching correctness data');
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.fetchCorrectnessData = fetchCorrectnessData;
