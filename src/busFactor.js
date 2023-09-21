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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusFactor = void 0;
var node_fetch_1 = require("node-fetch");
var dotenv = require("dotenv");
var logger_1 = require("./logger");
var logger = (0, logger_1.default)('Bus Factor');
dotenv.config();
function fetchContributors(fullRepoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var repoUrlMatch, repoUrl, apiUrl, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Fetching contributors for repo: ".concat(fullRepoUrl));
                    repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
                    if (!repoUrlMatch) {
                        logger.error("Invalid GitHub repository URL: ".concat(fullRepoUrl));
                        throw new Error("Invalid GitHub repository URL: ".concat(fullRepoUrl));
                    }
                    repoUrl = repoUrlMatch[1];
                    apiUrl = "https://api.github.com/repos/".concat(repoUrl, "/contributors");
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
                        logger.error("Failed to fetch contributors from ".concat(repoUrl, ". Status: ").concat(response.statusText));
                        throw new Error("Failed to fetch contributors from ".concat(repoUrl, ". Status: ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!Array.isArray(data) || !data.every(function (d) { return 'login' in d && 'contributions' in d; })) {
                        logger.error("Expected an array of contributors but received a different type.");
                        throw new Error("Expected an array of contributors but received a different type.");
                    }
                    return [2 /*return*/, data.map(function (item) { return ({
                            login: item.login,
                            contributions: item.contributions,
                        }); })];
            }
        });
    });
}
function calculateBusFactor(contributors) {
    var sortedContributors = __spreadArray([], contributors, true).sort(function (a, b) { return b.contributions - a.contributions; });
    var majorContributorsCount = 0;
    var contributionsCounted = 0;
    var halfOfTotalContributions = sortedContributors.reduce(function (acc, contributor) { return acc + contributor.contributions; }, 0) / 2;
    for (var _i = 0, sortedContributors_1 = sortedContributors; _i < sortedContributors_1.length; _i++) {
        var contributor = sortedContributors_1[_i];
        contributionsCounted += contributor.contributions;
        majorContributorsCount++;
        if (contributionsCounted >= halfOfTotalContributions) {
            logger.info("Bus factor calculated with ".concat(majorContributorsCount, " major contributors."));
            break;
        }
    }
    var busFactor = Math.min(majorContributorsCount / 10, 1);
    logger.info("Calculated bus factor: ".concat(busFactor));
    return busFactor;
}
function getBusFactor(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var contributors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchContributors(repoUrl)];
                case 1:
                    contributors = _a.sent();
                    return [2 /*return*/, calculateBusFactor(contributors)];
            }
        });
    });
}
exports.getBusFactor = getBusFactor;
/*async function printBusFactorForRepo() {
    const repoUrl = 'https://github.com/netdata/netdata';
    try {
        const result = await getBusFactor(repoUrl);
        console.log('Bus factor:', result.busFactor);
    } catch (error) {
        console.error('Error fetching bus factor:', error);
    }
}

printBusFactorForRepo();
*/
