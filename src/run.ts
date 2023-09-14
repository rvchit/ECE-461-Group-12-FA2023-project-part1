import { exec, ExecException } from 'child_process';

// Check if the second command-line argument is "install."
if (process.argv[2] === 'install') {
  // Define the command to run (npm install).
  const command = 'npm install ';
  var packages: string[] = ['dotenv', 'node-fetch']; //list of packages to install
  // Run the command.
  for(let pkg = 0; pkg < packages.length; pkg++)
  {
    const installProcess = exec(command.concat(packages[pkg]), (error: ExecException | null) => {
      if (error) {
        console.error(`Error running command: ${error.message}`);
      }
    });
    // Use optional chaining to check for null values.
    installProcess?.stdout?.on('data', (data) => {
      console.log(data.toString());
    });

    installProcess?.stderr?.on('data', (data) => {
      console.error(data.toString());
    });

    installProcess?.on('close', (code) => {
      if (code === 0) {
        console.log('Dependencies installed successfully.');
      } else {
        console.error(`Dependency installation failed with code ${code}.`);
      }
    });
  }
} else {
  console.log('Usage: ./run install or ./run TXT FILE or ./run test');
}