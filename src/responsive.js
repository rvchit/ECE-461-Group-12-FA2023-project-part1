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
exports.responsive = void 0;
var node_fetch_1 = require("node-fetch");
var dotenv_1 = require("dotenv");
var logger_1 = require("./logger");
var logger = (0, logger_1.default)('responsive');
dotenv_1.default.config();
var ms_to_sec = 1000;
var sec_to_hour = 3600;
var hours_to_days = 24;
//Changes date ticket to an actual data object to calc the difference in terms of milliseconds between created date and closed date
function parseDate(dateString) {
    return new Date(dateString);
}
function fetchIssues(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var perPage, apiUrl, response, closedIssues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    perPage = 100;
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/issues?state=closed&page=1&per_page=").concat(perPage);
                    return [4 /*yield*/, (0, node_fetch_1.default)(apiUrl, {
                            headers: {
                                Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        logger.error("Failed to fetch data from ".concat(repo, ". Status: ").concat(response.statusText));
                        throw new Error("Failed to fetch data from ".concat(repo, ". Status: ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    closedIssues = _a.sent();
                    return [2 /*return*/, closedIssues];
            }
        });
    });
}
//Finds the median of the time taken to close an issue
function findMedian(numbers) {
    // Step 1: Sort the list
    var sortedNumbers = numbers.slice().sort(function (a, b) { return a - b; });
    var middleIndex = Math.floor(sortedNumbers.length / 2);
    if (sortedNumbers.length % 2 === 0) {
        // Even number of elements, so take the average of the two middle elements
        var middle1 = sortedNumbers[middleIndex - 1];
        var middle2 = sortedNumbers[middleIndex];
        return (middle1 + middle2) / 2;
    }
    else {
        // Odd number of elements, so the middle element is the median
        return sortedNumbers[middleIndex];
    }
}
//
function responsive(url) {
    return __awaiter(this, void 0, void 0, function () {
        var urlParts, repo, owner, score_list, issues, _i, issues_1, issue, created, closed_1, diff, median, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlParts = url.split('/');
                    repo = urlParts.pop();
                    owner = urlParts.pop();
                    score_list = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchIssues(owner, repo)];
                case 2:
                    issues = _a.sent();
                    for (_i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
                        issue = issues_1[_i];
                        created = parseDate(issue.created_at);
                        closed_1 = parseDate(issue.closed_at);
                        diff = (closed_1.valueOf() - created.valueOf()) / (ms_to_sec * sec_to_hour * hours_to_days);
                        score_list.push(diff);
                    }
                    median = findMedian(score_list);
                    if (median < 1) {
                        return [2 /*return*/, 1];
                    }
                    else if (median > 7) {
                        return [2 /*return*/, 0];
                    }
                    else {
                        // linear interpolation here.
                        return [2 /*return*/, 1 - (median - 1) / 6];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    logger.error("Failed to calculate score of ".concat(repo, ". Error: ").concat(error_1));
                    console.error("Failed to calculate score of ".concat(repo, ". Error: ").concat(error_1));
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.responsive = responsive;
