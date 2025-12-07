// server/worker.js
const { Worker } = require("bullmq");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

// 1. Redis Connection
const redisOptions = { connection: { host: "localhost", port: 6379 } };


// 2. Helper to run Docker commands
const runDockerCommand = (command) => {
  return new Promise((resolve, reject) => {
    // Timeout logic: Kill process if it takes > 5 seconds
    const process = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error && error.killed) {
        resolve({ stdout: "", stderr: "Timeout: Code took too long to execute" });
      } else if (error && !stderr) {
        reject(error); // System error (e.g., Docker not found)
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// 3. The Worker Logic
const worker = new Worker("code-execution-queue", async (job) => {
  const { language, code, input } = job.data;
  const jobId = job.id;
  
  // PATHS: We need absolute paths for Docker volume mounting
  // We create a folder: /server/temp/<jobId>/
  const tempDir = path.join(__dirname, "temp", jobId); 
  const inputFilePath = path.join(tempDir, "input.txt");
  
  await fs.ensureDir(tempDir);

  let dockerImage, runCmd, codeFile;

  // Language Config
  if (language === "python") {
    codeFile = "main.py";
    dockerImage = "python:3.9-alpine"; 
    // Docker Command:
    // -v maps host folder to container folder
    // < input.txt feeds the input file into stdin
    runCmd = `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "python3 main.py < input.txt"`;
  
  } else if (language === "cpp") {
    codeFile = "main.cpp";
    dockerImage = "gcc:latest";
    runCmd = `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "g++ -o out main.cpp && ./out < input.txt"`;
  }

  try {
    // Write code and input to the host file system
    await fs.writeFile(path.join(tempDir, codeFile), code);
    await fs.writeFile(inputFilePath, input || "");

    // Spin up container -> Execute -> Clean container (--rm handles this)
    const { stdout, stderr } = await runDockerCommand(runCmd);
    
    return { output: stdout, error: stderr };

  } catch (err) {
    return { output: "", error: "System Error: " + err.message };
  } finally {
    // CLEANUP: Remove the temp folder from Host System
    await fs.remove(tempDir);
  }

}, redisOptions);

console.log("Worker Listening...");