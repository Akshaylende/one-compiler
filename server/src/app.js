// server/app.js
const express = require("express");
const { Queue } = require("bullmq");
const cors = require("cors");



const app = express();
app.use(cors());
app.use(express.json());

// Connect to local Redis
const jobQueue = new Queue("code-execution-queue", {
  connection: { host: "localhost", port: 6379 }
});


app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  if (!code) {
        return res.status(400).json({ success: false, error: "Empty code body" });
  }

  
  try {
        // Create a job and add to queue
        const job = await jobQueue.add("execute-job", { language, code, input });
        
        // Respond immediately with Job ID
        res.status(201).json({ success: true, jobId: job.id });
    } 
  catch (err) {
        // console.error("CRITICAL ERROR:", err); 
        res.status(500).json({ success: false, error: "Error processing request" });
  }
});
app.get("/status/:id", async (req, res) => {

 const jobId = req.params.id;
    
    if (!jobId) {
        return res.status(400).json({ success: false, error: "Missing Job ID" });
    }

    try {
        const job = await jobQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: "Invalid Job ID" });
        }

        const state = await job.getState(); // completed, failed, delayed, etc.
        const result = job.returnvalue;
        const reason = job.failedReason;
        
        console.log(job);
        if (state === 'completed') {
            codeOutput = result.output;
            if(codeOutput === '')
                codeOutput = result.error;
            res.json({status: 'success', output: codeOutput});
        } else if (state === 'failed') {
            res.json({status: 'error', error: reason });
        } else {
            res.json({ status: 'pending'});
        }

    } catch (err) {
        res.status(500).json({ success: false, error: "Error checking status" });
    }
});


app.listen(5000, () => console.log("API Server running on port 5000"));