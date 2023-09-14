//"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
// Check if the second command-line argument is "install."
if (process.argv[2] === 'install') {
    // Define the command to run (npm install).
    var command = 'npm install ';
    var packages = ['dotenv', 'node-fetch']; //list of packages to install
    // Run the command.
    for (var pkg = 0; pkg < packages.length; pkg++) {
        var installProcess = (0, child_process_1.exec)(command.concat(packages[pkg]), function (error) {
            if (error) {
                console.error("Error running command: ".concat(error.message));
            }
        });
        // Use optional chaining to check for null values.
        (_a = installProcess === null || installProcess === void 0 ? void 0 : installProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            console.log(data.toString());
        });
        (_b = installProcess === null || installProcess === void 0 ? void 0 : installProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
            console.error(data.toString());
        });
        installProcess === null || installProcess === void 0 ? void 0 : installProcess.on('close', function (code) {
            if (code === 0) {
                console.log('Dependencies installed successfully.');
            }
            else {
                console.error("Dependency installation failed with code ".concat(code, "."));
            }
        });
    }
}
else {
    console.log('Usage: ./run install or ./run TXT FILE or ./run test');
}
